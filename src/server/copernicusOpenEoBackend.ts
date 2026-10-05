/**
 * QARVYEN 2.0 — Real Copernicus Data Space Ecosystem (CDSE) openEO Client
 * Authenticates via Keycloak OIDC, submits real openEO v1.2 batch process graphs,
 * tracks job execution on CDSE backend, downloads true GeoTIFF assets to /data/real/sentinel/,
 * computes file size and SHA-256 hash from physical disk.
 *
 * STRICT RULE: No simulated job IDs, no in-memory synthetic rasters.
 * If CDSE is unreachable or credentials invalid, returns REAL_DATA_UNAVAILABLE.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CdseAuthResult {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface CdseJobSubmission {
  jobId: string;
  status: string;
  createdAt: string;
  backendUrl: string;
}

export interface CdseJobResult {
  jobId: string;
  status: 'created' | 'queued' | 'running' | 'finished' | 'error' | 'canceled';
  assetUrl?: string;
  error?: string;
  finishedAt?: string;
}

export interface DownloadedSentinelGeoTiff {
  jobId: string;
  filePath: string;
  fileName: string;
  byteLength: number;
  sha256Hash: string;
  downloadedAt: string;
  sourceUrl: string;
}

export class CopernicusOpenEoBackend {
  private clientId: string;
  private clientSecret: string;
  private backendUrl: string;
  private authUrl: string;
  private storageDir: string;

  constructor() {
    this.clientId = process.env.COPERNICUS_CDSE_CLIENT_ID || '';
    this.clientSecret = process.env.COPERNICUS_CDSE_CLIENT_SECRET || '';
    this.backendUrl = process.env.COPERNICUS_OPENEO_ENDPOINT || 'https://openeo.dataspace.copernicus.eu/v1.2';
    this.authUrl = process.env.OPENEO_AUTH_URL || 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
    this.storageDir = path.resolve(process.cwd(), 'data/real/sentinel');

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Checks whether CDSE credentials are configured in backend environment
   */
  public hasCredentials(): boolean {
    const id = process.env.COPERNICUS_CDSE_CLIENT_ID || this.clientId;
    const secret = process.env.COPERNICUS_CDSE_CLIENT_SECRET || this.clientSecret;
    return Boolean(id && secret && id.trim() !== '' && secret.trim() !== '');
  }

  /**
   * Real OIDC Token Request to Copernicus CDSE Keycloak
   */
  public async authenticate(): Promise<CdseAuthResult> {
    const id = process.env.COPERNICUS_CDSE_CLIENT_ID || this.clientId;
    const secret = process.env.COPERNICUS_CDSE_CLIENT_SECRET || this.clientSecret;

    if (!id || !secret || id.trim() === '' || secret.trim() === '') {
      throw new Error('CREDENTIALS_MISSING: COPERNICUS_CDSE_CLIENT_ID or COPERNICUS_CDSE_CLIENT_SECRET not configured in backend.');
    }

    const bodyParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: id.trim(),
      client_secret: secret.trim(),
    });

    const authUrl = (process.env.OPENEO_AUTH_URL || this.authUrl || 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token').trim();

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: bodyParams.toString(),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'No response body');
      throw new Error(`AUTHENTICATION_FAILED: CDSE Keycloak rejected credentials with HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('AUTHENTICATION_FAILED: CDSE auth response did not contain access_token');
    }

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
      tokenType: data.token_type || 'Bearer',
    };
  }

  /**
   * Submits an authentic openEO v1.2 batch job to CDSE backend
   */
  public async submitBatchJob(
    token: string,
    processGraph: Record<string, any>,
    title: string = 'QARVYEN Sentinel-1 Flood Assessment'
  ): Promise<CdseJobSubmission> {
    const response = await fetch(`${this.backendUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        title,
        description: 'Automated SAR C-band calibrated flood detection via openEO CDSE',
        process: {
          process_graph: processGraph,
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`JOB_SUBMISSION_FAILED: CDSE openEO rejected job with HTTP ${response.status}: ${errText}`);
    }

    const jobData = await response.json();
    const jobId = jobData.id || response.headers.get('Location')?.split('/').pop();

    if (!jobId) {
      throw new Error('JOB_SUBMISSION_FAILED: No jobId returned by CDSE openEO');
    }

    // Start execution of the job
    const startRes = await fetch(`${this.backendUrl}/jobs/${jobId}/results`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!startRes.ok && startRes.status !== 202) {
      const errText = await startRes.text().catch(() => '');
      throw new Error(`JOB_START_FAILED: Could not start execution of CDSE job ${jobId} (HTTP ${startRes.status}): ${errText}`);
    }

    return {
      jobId,
      status: 'created',
      createdAt: new Date().toISOString(),
      backendUrl: this.backendUrl,
    };
  }

  /**
   * Polls status of a real openEO batch job on CDSE
   */
  public async getJobStatus(token: string, jobId: string): Promise<CdseJobResult> {
    const response = await fetch(`${this.backendUrl}/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`JOB_STATUS_QUERY_FAILED: HTTP ${response.status} for job ${jobId}: ${errText}`);
    }

    const data = await response.json();
    const status = data.status as CdseJobResult['status'];

    let assetUrl: string | undefined;
    if (status === 'finished') {
      // Query results endpoint for assets
      const resResponse = await fetch(`${this.backendUrl}/jobs/${jobId}/results`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (resResponse.ok) {
        const resData = await resResponse.json();
        const assets = resData.assets || {};
        for (const key of Object.keys(assets)) {
          if (assets[key]?.type?.includes('tiff') || key.endsWith('.tif') || key.endsWith('.tiff')) {
            assetUrl = assets[key].href;
            break;
          }
        }
      }
    }

    return {
      jobId,
      status,
      assetUrl,
      error: data.error?.message,
      finishedAt: data.updated || data.finished,
    };
  }

  /**
   * Downloads the authentic GeoTIFF asset from CDSE to physical disk
   */
  public async downloadGeoTiffAsset(
    token: string,
    jobId: string,
    assetUrl: string
  ): Promise<DownloadedSentinelGeoTiff> {
    const fileName = `s1_openeo_${jobId}.tif`;
    const targetPath = path.join(this.storageDir, fileName);

    const response = await fetch(assetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(60000), // Up to 60s for raster payload
    });

    if (!response.ok) {
      throw new Error(`ASSET_DOWNLOAD_FAILED: HTTP ${response.status} while downloading GeoTIFF from ${assetUrl}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write to disk
    await fs.promises.writeFile(targetPath, buffer);

    // Compute physical properties from disk file
    const stat = await fs.promises.stat(targetPath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      jobId,
      filePath: targetPath,
      fileName,
      byteLength: stat.size,
      sha256Hash: hash,
      downloadedAt: new Date().toISOString(),
      sourceUrl: assetUrl,
    };
  }
}

export const copernicusBackend = new CopernicusOpenEoBackend();
