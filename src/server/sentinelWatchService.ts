/**
 * QARVYEN 2.0 — Sentinel-1 Background Watcher Service
 * Periodically polls the authentic Copernicus Data Space Ecosystem (CDSE)
 * Catalog for new Sentinel-1 C-SAR radar passes over the Senegal River Valley
 * (and configured study zones), detects new acquisitions, and broadcasts update alerts.
 */

import crypto from 'crypto';

export interface Sentinel1SceneMeta {
  id: string;
  title: string;
  acquisitionDate: string;
  platform: string;
  instrument: string;
  mode: string;
  polarizations: string[];
  orbitDirection: 'ascending' | 'descending' | 'unknown';
  relativeOrbit?: number;
  bbox: [number, number, number, number];
  quicklookUrl?: string;
  detectedAt: string;
  isNew: boolean;
}

export interface WatcherStatus {
  enabled: boolean;
  intervalSeconds: number;
  lastCheckTime: string | null;
  lastSceneDetected: Sentinel1SceneMeta | null;
  hasNewAlert: boolean;
  alertAcknowledged: boolean;
  totalScenesMonitored: number;
  studyAreaName: string;
  bbox: [number, number, number, number];
  backendEndpoint: string;
  recentScenes: Sentinel1SceneMeta[];
  logs: Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warn' | 'alert' }>;
}

export class SentinelWatchService {
  private enabled: boolean = true;
  private intervalSeconds: number = 60; // Check every 60s
  private timer: NodeJS.Timeout | null = null;
  private isChecking: boolean = false;
  private lastCheckTime: string | null = null;
  private knownSceneIds: Set<string> = new Set();
  private recentScenes: Sentinel1SceneMeta[] = [];
  private lastSceneDetected: Sentinel1SceneMeta | null = null;
  private hasNewAlert: boolean = false;
  private alertAcknowledged: boolean = false;
  private logs: Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warn' | 'alert' }> = [];

  // Default monitoring zone: Vallée du Fleuve Sénégal (Dagana - Podor - Richard-Toll)
  private defaultBbox: [number, number, number, number] = [-15.15, 16.55, -14.85, 16.78];
  private studyAreaName: string = 'Vallée du Fleuve Sénégal (Dagana - Podor)';

  constructor() {
    this.addLog('info', 'Service de veille orbitale Sentinel-1 initialisé.');
    // Start initial background cycle
    this.start();
  }

  private addLog(type: 'info' | 'success' | 'warn' | 'alert', message: string) {
    this.logs.unshift({
      timestamp: new Date().toISOString(),
      message,
      type,
    });
    if (this.logs.length > 30) {
      this.logs.pop();
    }
  }

  /**
   * Starts periodic polling in background
   */
  public start(intervalSeconds: number = this.intervalSeconds) {
    this.intervalSeconds = intervalSeconds;
    this.enabled = true;
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.addLog('info', `Veille en tâche de fond démarrée (intervalle: ${this.intervalSeconds}s).`);
    // Run an immediate check shortly after start
    setTimeout(() => {
      this.checkNow().catch((e) => this.addLog('warn', `Erreur vérification initiale: ${e.message}`));
    }, 2000);

    this.timer = setInterval(() => {
      if (this.enabled) {
        this.checkNow().catch((e) => this.addLog('warn', `Erreur vérification périodique: ${e.message}`));
      }
    }, this.intervalSeconds * 1000);
  }

  /**
   * Pauses the background polling
   */
  public stop() {
    this.enabled = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.addLog('info', 'Veille orbitale en tâche de fond suspendue.');
  }

  /**
   * Acknowledges current alert
   */
  public acknowledge() {
    this.alertAcknowledged = true;
    this.hasNewAlert = false;
    this.addLog('info', 'Alerte nouvelle acquisition Sentinel-1 acquittée par l\'opérateur.');
  }

  /**
   * Queries Copernicus CDSE Catalog for Sentinel-1 scenes
   */
  public async checkNow(customBbox?: [number, number, number, number]): Promise<Sentinel1SceneMeta[]> {
    if (this.isChecking) {
      return this.recentScenes;
    }

    this.isChecking = true;
    const targetBbox = customBbox || this.defaultBbox;
    this.lastCheckTime = new Date().toISOString();

    try {
      const clientId = process.env.COPERNICUS_CDSE_CLIENT_ID?.trim();
      const clientSecret = process.env.COPERNICUS_CDSE_CLIENT_SECRET?.trim();
      const tokenUrl = (process.env.OPENEO_AUTH_URL || 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token').trim();

      if (!clientId || !clientSecret) {
        this.addLog('warn', 'Identifiants Copernicus CDSE absents du fichier .env.');
        this.isChecking = false;
        return this.recentScenes;
      }

      // Step 1: Authenticate to CDSE
      const tokenBody = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenBody.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!tokenRes.ok) {
        throw new Error(`Échec authentification CDSE Keycloak (${tokenRes.status})`);
      }

      const { access_token } = await tokenRes.json();
      if (!access_token) {
        throw new Error('Jeton d\'accès CDSE non reçu');
      }

      // Step 2: Query Sentinel Hub / CDSE Catalog Search API
      const searchUrl = 'https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search';
      const searchPayload = {
        collections: ['sentinel-1-grd'],
        datetime: '2024-09-01T00:00:00Z/2026-12-31T23:59:59Z',
        bbox: targetBbox,
        limit: 10,
      };

      const catalogRes = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/geo+json, application/json, */*',
        },
        body: JSON.stringify(searchPayload),
        signal: AbortSignal.timeout(15000),
      });

      if (!catalogRes.ok) {
        throw new Error(`Catalogue CDSE HTTP ${catalogRes.status}`);
      }

      const catalogData = await catalogRes.json();
      const features: any[] = catalogData.features || [];

      const parsedScenes: Sentinel1SceneMeta[] = features.map((f: any) => {
        const id = f.id || 'S1_UNKNOWN';
        const props = f.properties || {};
        const isAlreadyKnown = this.knownSceneIds.has(id);

        return {
          id,
          title: `Sentinel-1 ${props['sat:orbit_state'] || 'IW'} GRD (${props.datetime ? props.datetime.split('T')[0] : 'Inconnu'})`,
          acquisitionDate: props.datetime || new Date().toISOString(),
          platform: id.startsWith('S1D') ? 'Sentinel-1D' : (id.startsWith('S1C') ? 'Sentinel-1C' : 'Sentinel-1A'),
          instrument: 'C-SAR',
          mode: 'IW',
          polarizations: props['sar:polarizations'] || ['VV', 'VH'],
          orbitDirection: (props['sat:orbit_state'] === 'ascending' || props['sat:orbit_state'] === 'descending') ? props['sat:orbit_state'] : 'descending',
          relativeOrbit: props['sat:relative_orbit'] || 68,
          bbox: f.bbox || targetBbox,
          quicklookUrl: f.assets?.thumbnail?.href || f.assets?.overview?.href,
          detectedAt: new Date().toISOString(),
          isNew: !isAlreadyKnown && this.knownSceneIds.size > 0,
        };
      });

      // Sort newest first
      parsedScenes.sort((a, b) => new Date(b.acquisitionDate).getTime() - new Date(a.acquisitionDate).getTime());

      // Detect if there's a truly new scene compared to previous knowledge
      if (parsedScenes.length > 0) {
        const newest = parsedScenes[0];
        const isBrandNew = !this.knownSceneIds.has(newest.id) && this.knownSceneIds.size > 0;

        if (isBrandNew) {
          this.hasNewAlert = true;
          this.alertAcknowledged = false;
          this.lastSceneDetected = newest;
          this.addLog(
            'alert',
            `🛰️ NOUVELLE IMAGE SENTINEL-1 DÉTECTÉE sur la Vallée du Fleuve Sénégal : ${newest.id.slice(0, 32)}... (Date: ${newest.acquisitionDate.split('T')[0]})`
          );
        } else if (!this.lastSceneDetected) {
          this.lastSceneDetected = newest;
          this.addLog(
            'success',
            `Catalogue CDSE synchronisé : dernière scène identifiée ${newest.id.slice(0, 32)}... (${parsedScenes.length} scènes en archive)`
          );
        } else {
          this.addLog(
            'info',
            `Vérification effectuée : aucune nouvelle scène (dernière acquisition toujours ${this.lastSceneDetected.acquisitionDate.split('T')[0]}).`
          );
        }

        // Register all scenes into known IDs
        for (const s of parsedScenes) {
          this.knownSceneIds.add(s.id);
        }
      }

      this.recentScenes = parsedScenes;
    } catch (err: any) {
      this.addLog('warn', `Échec requête CDSE: ${err.message}`);
    } finally {
      this.isChecking = false;
    }

    return this.recentScenes;
  }

  /**
   * Simulates a newly detected scene for testing notifications in real-time
   */
  public triggerTestNewSceneAlert(): Sentinel1SceneMeta {
    const now = new Date();
    const isoString = now.toISOString();
    const dateFormatted = isoString.replace(/[-:]/g, '').split('.')[0];
    const testId = `S1A_IW_GRDH_1SDV_${dateFormatted}_TEST_RADAR_SEN_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const newScene: Sentinel1SceneMeta = {
      id: testId,
      title: `Sentinel-1A IW GRD Détection Prioritaire (${now.toLocaleDateString('fr-FR')})`,
      acquisitionDate: isoString,
      platform: 'Sentinel-1A',
      instrument: 'C-SAR',
      mode: 'IW',
      polarizations: ['VV', 'VH'],
      orbitDirection: 'descending',
      relativeOrbit: 68,
      bbox: this.defaultBbox,
      detectedAt: isoString,
      isNew: true,
    };

    this.lastSceneDetected = newScene;
    this.hasNewAlert = true;
    this.alertAcknowledged = false;
    this.recentScenes.unshift(newScene);
    this.knownSceneIds.add(testId);

    this.addLog('alert', `[TEST ALERTE] Nouvelle acquisition radar simulée avec succès : ${testId}`);
    return newScene;
  }

  /**
   * Returns current status summary
   */
  public getStatus(): WatcherStatus {
    return {
      enabled: this.enabled,
      intervalSeconds: this.intervalSeconds,
      lastCheckTime: this.lastCheckTime,
      lastSceneDetected: this.lastSceneDetected,
      hasNewAlert: this.hasNewAlert && !this.alertAcknowledged,
      alertAcknowledged: this.alertAcknowledged,
      totalScenesMonitored: this.recentScenes.length,
      studyAreaName: this.studyAreaName,
      bbox: this.defaultBbox,
      backendEndpoint: 'https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search',
      recentScenes: this.recentScenes,
      logs: this.logs.slice(0, 15),
    };
  }
}

export const sentinelWatchService = new SentinelWatchService();
