/**
 * QARVYEN 2.0 — Sovereign Crisis Intelligence Engine Server
 * Express Backend mounting Vite Dev Middleware on Port 3000
 * Handles real Copernicus CDSE, WorldPop disk management, and Overpass live queries.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { realDataService } from './src/server/realDataService.ts';
import { worldPopDiskManager } from './src/server/worldpopDiskManager.ts';
import { overpassLiveClient } from './src/server/overpassLiveClient.ts';
import { copernicusBackend } from './src/server/copernicusOpenEoBackend.ts';
import { sentinelWatchService } from './src/server/sentinelWatchService.ts';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure required data directories exist
const dataDirs = [
  path.join(__dirname, 'data/real/sentinel'),
  path.join(__dirname, 'data/real/worldpop'),
  path.join(__dirname, 'data/real/osm'),
  path.join(__dirname, 'data/real/results'),
];
for (const dir of dataDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// =============================================================================
// REAL DATA BACKEND API ROUTES (/api/real/*)
// =============================================================================

/**
 * Executes the authentic multi-source pipeline (Copernicus + WorldPop + OSM)
 */
app.post('/api/real/execute', async (req, res) => {
  try {
    const { studyAreaId, bbox, polarization, thresholdDb } = req.body;
    const defaultBbox: [number, number, number, number] = bbox || [-15.15, 16.55, -14.85, 16.78];
    const result = await realDataService.executePipeline({
      studyAreaId: studyAreaId || 'senegal_river_valley',
      bbox: defaultBbox,
      polarization: polarization || 'VV',
      thresholdDb: typeof thresholdDb === 'number' ? thresholdDb : -14.0,
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      systemStatus: 'REAL_DATA_UNAVAILABLE',
      error: error.message || 'Internal server error in real data pipeline',
    });
  }
});

/**
 * Checks Copernicus CDSE credentials and connection status
 */
app.get('/api/real/copernicus/status', async (req, res) => {
  try {
    const hasCreds = copernicusBackend.hasCredentials();
    let authOk = false;
    let authError: string | undefined;

    if (hasCreds) {
      try {
        await copernicusBackend.authenticate();
        authOk = true;
      } catch (err: any) {
        authError = err.message;
      }
    }

    res.json({
      hasCredentialsConfigured: hasCreds,
      authenticated: authOk,
      authError,
      endpoint: process.env.COPERNICUS_OPENEO_ENDPOINT || 'https://openeo.dataspace.copernicus.eu/v1.2',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// SENTINEL-1 BACKGROUND WATCHER & ORBITAL MONITORING ROUTES
// =============================================================================

/**
 * Returns current status of the background Sentinel-1 watcher
 */
app.get('/api/real/copernicus/sentinel1/watch', (req, res) => {
  res.json(sentinelWatchService.getStatus());
});

/**
 * Triggers an immediate catalog query for new Sentinel-1 passes
 */
app.post('/api/real/copernicus/sentinel1/watch/check', async (req, res) => {
  try {
    const { bbox } = req.body || {};
    const scenes = await sentinelWatchService.checkNow(bbox);
    res.json({
      success: true,
      scenesCount: scenes.length,
      status: sentinelWatchService.getStatus(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Acknowledges the new scene alert (clears the notification)
 */
app.post('/api/real/copernicus/sentinel1/watch/ack', (req, res) => {
  sentinelWatchService.acknowledge();
  res.json({ success: true, status: sentinelWatchService.getStatus() });
});

/**
 * Updates background watcher configuration (interval or enabled status)
 */
app.post('/api/real/copernicus/sentinel1/watch/config', (req, res) => {
  const { enabled, intervalSeconds } = req.body || {};
  if (typeof enabled === 'boolean') {
    if (enabled) {
      sentinelWatchService.start(intervalSeconds || 60);
    } else {
      sentinelWatchService.stop();
    }
  } else if (typeof intervalSeconds === 'number') {
    sentinelWatchService.start(intervalSeconds);
  }
  res.json({ success: true, status: sentinelWatchService.getStatus() });
});

/**
 * Triggers a test new scene alert to verify the UI notification workflow
 */
app.post('/api/real/copernicus/sentinel1/watch/test-trigger', (req, res) => {
  const simulated = sentinelWatchService.triggerTestNewSceneAlert();
  res.json({ success: true, scene: simulated, status: sentinelWatchService.getStatus() });
});

/**
 * Checks physical presence and validity of WorldPop 100m GeoTIFF on disk
 */
app.get('/api/real/worldpop/inspect', async (req, res) => {
  try {
    const fileExists = worldPopDiskManager.fileExistsOnDisk();
    if (!fileExists) {
      // Attempt download if missing
      await worldPopDiskManager.ensureFileOnDisk();
    }

    const { meta } = await worldPopDiskManager.inspectAndLoadDiskRaster();
    res.json({
      available: true,
      meta,
    });
  } catch (err: any) {
    res.json({
      available: false,
      error: err.message,
    });
  }
});

/**
 * Live Overpass API query for critical infrastructure
 */
app.post('/api/real/osm/query', async (req, res) => {
  try {
    const { bbox } = req.body;
    const defaultBbox: [number, number, number, number] = bbox || [-15.15, 16.55, -14.85, 16.78];
    const osmResult = await overpassLiveClient.queryLiveOverpass(defaultBbox);
    res.json(osmResult);
  } catch (err: any) {
    res.status(502).json({
      error: err.message,
      attribution: '© OpenStreetMap contributors (ODbL 1.0)',
    });
  }
});

/**
 * Retrieve execution record from disk
 */
app.get('/api/real/results/:id', async (req, res) => {
  try {
    const analysisId = req.params.id;
    const resultsDir = path.join(__dirname, 'data/real/results');
    const readyPath = path.join(resultsDir, `${analysisId}_READY.json`);
    const unavailPath = path.join(resultsDir, `${analysisId}_UNAVAILABLE.json`);

    if (fs.existsSync(readyPath)) {
      const data = JSON.parse(await fs.promises.readFile(readyPath, 'utf8'));
      res.json(data);
    } else if (fs.existsSync(unavailPath)) {
      const data = JSON.parse(await fs.promises.readFile(unavailPath, 'utf8'));
      res.json(data);
    } else {
      res.status(404).json({ error: 'Result not found on disk' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// VITE MIDDLEWARE MOUNTING
// =============================================================================
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QARVYEN Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
