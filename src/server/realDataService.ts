/**
 * QARVYEN 2.0 — Real Data Pipeline Service (Backend Orchestrator)
 * Strict enforcement of the three external sources:
 * 1. Copernicus CDSE openEO (Sentinel-1 SAR C-band)
 * 2. WorldPop (Disk GeoTIFF 100m)
 * 3. OpenStreetMap (Overpass live API)
 *
 * STRICT GOVERNANCE RULES:
 * - If any source is unavailable, returns REAL_DATA_UNAVAILABLE.
 * - In REAL_DATA_UNAVAILABLE:
 *   * floodedAreaKm2 = 0.0
 *   * affectedPopulationEst = 0
 *   * criticalAssetsAtRisk = []
 *   * No observational confidence
 *   * No success audit
 * - SYNTHETIC_DEMO remains completely separate and untouched.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as GeoTIFF from 'geotiff';
import { copernicusBackend, type DownloadedSentinelGeoTiff } from './copernicusOpenEoBackend.ts';
import { worldPopDiskManager, type WorldPopDiskInfo } from './worldpopDiskManager.ts';
import { overpassLiveClient, type OverpassQueryResult } from './overpassLiveClient.ts';
import type { RealExecutionAuditRecord } from '../types/qarvyen.ts';

export interface RealPipelineRequest {
  studyAreaId: string;
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  polarization: 'VV' | 'VH';
  thresholdDb: number;
}

export interface RealPipelineResponse {
  analysisId: string;
  systemStatus: 'REAL_DATA_READY' | 'REAL_DATA_UNAVAILABLE';
  executionMode: 'REAL_DATA';
  timestamp: string;
  failureReason?: string;
  sourcesStatus: {
    copernicus: {
      status: 'AVAILABLE' | 'UNAVAILABLE';
      jobId?: string;
      fileOnDisk?: string;
      sha256?: string;
      error?: string;
    };
    worldpop: {
      status: 'AVAILABLE' | 'UNAVAILABLE';
      fileOnDisk?: string;
      sha256?: string;
      doi?: string;
      error?: string;
    };
    osm: {
      status: 'AVAILABLE' | 'UNAVAILABLE';
      rawResponseDiskPath?: string;
      rawSha256?: string;
      assetsCount?: number;
      error?: string;
    };
  };
  metrics?: {
    floodedAreaKm2: number;
    floodedPixelCount: number;
    measuredResolutionMeters: number;
    crs: string;
    affectedPopulationEst: number;
    criticalAssetsAtRisk: any[];
  };
  geoTransform?: {
    width: number;
    height: number;
    originX: number;
    originY: number;
    pixelScaleX: number;
    pixelScaleY: number;
    crs: string;
  };
  auditRecord: RealExecutionAuditRecord;
}

export class RealDataService {
  private resultsDir: string;

  constructor() {
    this.resultsDir = path.resolve(process.cwd(), 'data/real/results');
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  public async executePipeline(req: RealPipelineRequest): Promise<RealPipelineResponse> {
    const analysisId = `QARVYEN-REAL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const sourcesStatus: RealPipelineResponse['sourcesStatus'] = {
      copernicus: { status: 'UNAVAILABLE' },
      worldpop: { status: 'UNAVAILABLE' },
      osm: { status: 'UNAVAILABLE' },
    };

    const failureReasons: string[] = [];

    // =========================================================================
    // SOURCE 1: COPERNICUS CDSE / openEO
    // =========================================================================
    let downloadedS1: DownloadedSentinelGeoTiff | null = null;
    let s1RasterData: {
      width: number;
      height: number;
      nativeResX: number;
      nativeResY: number;
      originX: number;
      originY: number;
      crs: string;
      pixelValues: Float32Array;
    } | null = null;

    try {
      if (!copernicusBackend.hasCredentials()) {
        sourcesStatus.copernicus.error = 'COPERNICUS_CDSE_CLIENT_ID / SECRET not configured in backend environment.';
        failureReasons.push('Copernicus CDSE: identifiants non configurés côté serveur');
      } else {
        const auth = await copernicusBackend.authenticate();
        // Construct openEO process graph for Sentinel-1 GRD IW
        const [minLon, minLat, maxLon, maxLat] = req.bbox;
        const processGraph = {
          load_s1: {
            process_id: 'load_collection',
            arguments: {
              id: 'SENTINEL1_GRD',
              spatial_extent: { west: minLon, east: maxLon, south: minLat, north: maxLat },
              temporal_extent: ['2024-09-01T00:00:00Z', '2024-10-31T23:59:59Z'],
              bands: [req.polarization],
            },
          },
          sar_proc: {
            process_id: 'sar_backscatter',
            arguments: {
              data: { from_node: 'load_s1' },
              coefficient: 'sigma0-ellipsoid',
            },
          },
          save: {
            process_id: 'save_result',
            arguments: {
              data: { from_node: 'sar_proc' },
              format: 'GTIFF',
            },
            result: true,
          },
        };

        const job = await copernicusBackend.submitBatchJob(auth.accessToken, processGraph);
        sourcesStatus.copernicus.jobId = job.jobId;

        // Poll job for completion (with timeout)
        let jobResult = await copernicusBackend.getJobStatus(auth.accessToken, job.jobId);
        let attempts = 0;
        while (jobResult.status !== 'finished' && jobResult.status !== 'error' && attempts < 10) {
          await new Promise((r) => setTimeout(r, 2000));
          jobResult = await copernicusBackend.getJobStatus(auth.accessToken, job.jobId);
          attempts++;
        }

        if (jobResult.status === 'finished' && jobResult.assetUrl) {
          downloadedS1 = await copernicusBackend.downloadGeoTiffAsset(auth.accessToken, job.jobId, jobResult.assetUrl);
          sourcesStatus.copernicus.status = 'AVAILABLE';
          sourcesStatus.copernicus.fileOnDisk = downloadedS1.filePath;
          sourcesStatus.copernicus.sha256 = downloadedS1.sha256Hash;

          // Decode GeoTIFF from disk
          const rawBuffer = await fs.promises.readFile(downloadedS1.filePath);
          const tiff = await GeoTIFF.fromArrayBuffer(rawBuffer.buffer.slice(rawBuffer.byteOffset, rawBuffer.byteOffset + rawBuffer.byteLength));
          const img = await tiff.getImage();
          const rasters = await img.readRasters();
          const firstBand = rasters[0] instanceof Float32Array ? rasters[0] : new Float32Array(rasters[0] as any);

          s1RasterData = {
            width: img.getWidth(),
            height: img.getHeight(),
            nativeResX: Math.abs(img.getResolution()?.[0] || 0.0001),
            nativeResY: Math.abs(img.getResolution()?.[1] || 0.0001),
            originX: img.getOrigin()?.[0] || minLon,
            originY: img.getOrigin()?.[1] || maxLat,
            crs: 'EPSG:4326',
            pixelValues: firstBand,
          };
        } else {
          sourcesStatus.copernicus.error = `CDSE openEO Job did not complete (status: ${jobResult.status}, error: ${jobResult.error || 'none'})`;
          failureReasons.push(`Copernicus CDSE: Job openEO non terminé (${jobResult.status})`);
        }
      }
    } catch (err: any) {
      sourcesStatus.copernicus.error = err.message;
      failureReasons.push(`Copernicus CDSE: ${err.message}`);
    }

    // =========================================================================
    // SOURCE 2: WORLDPOP DISK RASTER
    // =========================================================================
    let worldpopData: { meta: WorldPopDiskInfo; pixelValues: Float32Array } | null = null;
    try {
      worldpopData = await worldPopDiskManager.inspectAndLoadDiskRaster();
      sourcesStatus.worldpop.status = 'AVAILABLE';
      sourcesStatus.worldpop.fileOnDisk = worldpopData.meta.filePath;
      sourcesStatus.worldpop.sha256 = worldpopData.meta.sha256Hash;
      sourcesStatus.worldpop.doi = worldpopData.meta.doi;
    } catch (err: any) {
      sourcesStatus.worldpop.error = err.message;
      failureReasons.push(`WorldPop: ${err.message}`);
    }

    // =========================================================================
    // SOURCE 3: OPENSTREETMAP OVERPASS LIVE API
    // =========================================================================
    let osmResult: OverpassQueryResult | null = null;
    try {
      osmResult = await overpassLiveClient.queryLiveOverpass(req.bbox);
      sourcesStatus.osm.status = 'AVAILABLE';
      sourcesStatus.osm.rawResponseDiskPath = osmResult.rawResponseDiskPath;
      sourcesStatus.osm.rawSha256 = osmResult.rawResponseSha256;
      sourcesStatus.osm.assetsCount = osmResult.assets.length;
    } catch (err: any) {
      sourcesStatus.osm.error = err.message;
      failureReasons.push(`OpenStreetMap: ${err.message}`);
    }

    // =========================================================================
    // DECISION: ARE ALL 3 SOURCES TRULY AVAILABLE?
    // =========================================================================
    const allAvailable =
      sourcesStatus.copernicus.status === 'AVAILABLE' &&
      sourcesStatus.worldpop.status === 'AVAILABLE' &&
      sourcesStatus.osm.status === 'AVAILABLE';

    if (!allAvailable || !s1RasterData || !worldpopData || !osmResult || !downloadedS1) {
      // STRICT REQUIREMENT: Return REAL_DATA_UNAVAILABLE.
      // Zero surfaces, zero population, empty assets, no false confidence.
      const failureReasonStr = failureReasons.join(' | ');

      const auditRecord: RealExecutionAuditRecord = {
        processingId: analysisId,
        timestamp,
        executionMode: 'REAL_DATA',
        systemStatus: 'REAL_DATA_UNAVAILABLE',
        success: false,
        failureReason: failureReasonStr,
        sourcesVerified: {
          copernicus: {
            available: sourcesStatus.copernicus.status === 'AVAILABLE',
            jobId: sourcesStatus.copernicus.jobId,
            fileOnDisk: sourcesStatus.copernicus.fileOnDisk,
            sha256: sourcesStatus.copernicus.sha256,
          },
          worldpop: {
            available: sourcesStatus.worldpop.status === 'AVAILABLE',
            fileOnDisk: sourcesStatus.worldpop.fileOnDisk,
            sha256: sourcesStatus.worldpop.sha256,
            doi: sourcesStatus.worldpop.doi,
          },
          osm: {
            available: sourcesStatus.osm.status === 'AVAILABLE',
            diskResponsePath: sourcesStatus.osm.rawResponseDiskPath,
            rawSha256: sourcesStatus.osm.rawSha256,
            assetsCount: sourcesStatus.osm.assetsCount || 0,
          },
        },
      };

      // Save failure record to disk
      await fs.promises.writeFile(
        path.join(this.resultsDir, `${analysisId}_UNAVAILABLE.json`),
        JSON.stringify(auditRecord, null, 2),
        'utf8'
      );

      return {
        analysisId,
        systemStatus: 'REAL_DATA_UNAVAILABLE',
        executionMode: 'REAL_DATA',
        timestamp,
        failureReason: failureReasonStr,
        sourcesStatus,
        auditRecord,
      };
    }

    // =========================================================================
    // SUCCESS PATH: COMPUTE REAL SPATIAL METRICS FROM AUTHENTIC SOURCES
    // =========================================================================
    const { width, height, nativeResX, nativeResY, originX, originY, pixelValues } = s1RasterData;
    const [minLon, minLat, maxLon, maxLat] = req.bbox;
    const meanLat = (minLat + maxLat) / 2;
    const meanLatRad = (meanLat * Math.PI) / 180;

    const metersPerDegLat = 111132.92 - 559.82 * Math.cos(2 * meanLatRad) + 1.175 * Math.cos(4 * meanLatRad);
    const metersPerDegLon = 111412.84 * Math.cos(meanLatRad) - 93.5 * Math.cos(3 * meanLatRad);

    const resXMeters = nativeResX * metersPerDegLon;
    const resYMeters = nativeResY * metersPerDegLat;
    const pixelAreaM2 = resXMeters * resYMeters;
    const pixelAreaKm2 = pixelAreaM2 * 1e-6;
    const measuredResolutionMeters = Math.round(Math.sqrt(pixelAreaM2) * 10) / 10;

    // Build binary flood mask from threshold
    const floodMask: number[][] = [];
    let floodedPixelCount = 0;

    for (let y = 0; y < height; y++) {
      floodMask[y] = [];
      for (let x = 0; x < width; x++) {
        const val = pixelValues[y * width + x];
        if (val <= req.thresholdDb && val > -50) {
          floodMask[y][x] = 1;
          floodedPixelCount++;
        } else {
          floodMask[y][x] = 0;
        }
      }
    }

    const floodedAreaKm2 = Math.round(floodedPixelCount * pixelAreaKm2 * 10) / 10;

    // Real zonal intersection with WorldPop disk raster
    const affectedPopulationEst = worldPopDiskManager.calculateExposedPopulation(
      worldpopData,
      floodMask,
      req.bbox
    );

    // Filter OSM live assets that fall within flood zones
    const criticalAssetsAtRisk = osmResult.assets.filter((asset) => {
      const normX = (asset.lon - minLon) / (maxLon - minLon);
      const normY = (maxLat - asset.lat) / (maxLat - minLat);
      const px = Math.floor(normX * width);
      const py = Math.floor(normY * height);
      return px >= 0 && px < width && py >= 0 && py < height && floodMask[py]?.[px] === 1;
    });

    const auditRecord: RealExecutionAuditRecord = {
      processingId: analysisId,
      timestamp,
      executionMode: 'REAL_DATA',
      systemStatus: 'REAL_DATA_READY',
      success: true,
      sourcesVerified: {
        copernicus: {
          available: true,
          jobId: downloadedS1.jobId,
          fileOnDisk: downloadedS1.filePath,
          sha256: downloadedS1.sha256Hash,
        },
        worldpop: {
          available: true,
          fileOnDisk: worldpopData.meta.filePath,
          sha256: worldpopData.meta.sha256Hash,
          doi: worldpopData.meta.doi,
        },
        osm: {
          available: true,
          diskResponsePath: osmResult.rawResponseDiskPath,
          rawSha256: osmResult.rawResponseSha256,
          assetsCount: osmResult.assets.length,
        },
      },
    };

    // Save final verified execution result to disk
    await fs.promises.writeFile(
      path.join(this.resultsDir, `${analysisId}_READY.json`),
      JSON.stringify(auditRecord, null, 2),
      'utf8'
    );

    return {
      analysisId,
      systemStatus: 'REAL_DATA_READY',
      executionMode: 'REAL_DATA',
      timestamp,
      sourcesStatus,
      metrics: {
        floodedAreaKm2,
        floodedPixelCount,
        measuredResolutionMeters,
        crs: 'EPSG:4326 (WGS84)',
        affectedPopulationEst,
        criticalAssetsAtRisk,
      },
      geoTransform: {
        width,
        height,
        originX,
        originY,
        pixelScaleX: nativeResX,
        pixelScaleY: nativeResY,
        crs: 'EPSG:4326',
      },
      auditRecord,
    };
  }
}

export const realDataService = new RealDataService();
