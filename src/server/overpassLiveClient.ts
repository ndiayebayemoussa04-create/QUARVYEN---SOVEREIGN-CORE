/**
 * QARVYEN 2.0 — Real OpenStreetMap Overpass API Client
 * Queries live OpenStreetMap infrastructure objects via Overpass QL,
 * stores the raw responses in /data/real/osm/, and parses critical assets.
 *
 * STRICT RULE:
 * - No local hardcoded array in REAL_DATA mode.
 * - Live query to Overpass API servers (primary + mirror fallback).
 * - Exact OSM element IDs, coordinates, tags, and ODbL attribution.
 * - If Overpass is unreachable or query fails, throws REAL_DATA_UNAVAILABLE without fallback.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface LiveOsmAsset {
  osmId: string;
  name: string;
  category: 'health' | 'energy' | 'water_barrier' | 'hydraulic' | 'transport';
  type: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  isLiveOsmData: true;
}

export interface OverpassQueryResult {
  queryExecuted: string;
  queryTimestamp: string;
  elementsCount: number;
  assets: LiveOsmAsset[];
  rawResponseDiskPath: string;
  rawResponseSha256: string;
  attribution: string;
  endpointUsed: string;
}

export class OverpassLiveClient {
  private primaryEndpoint: string;
  private fallbackEndpoint: string;
  private storageDir: string;

  constructor() {
    this.primaryEndpoint = process.env.OSM_OVERPASS_ENDPOINT || 'https://overpass-api.de/api/interpreter';
    this.fallbackEndpoint = process.env.OSM_OVERPASS_FALLBACK_ENDPOINT || 'https://lz4.overpass-api.de/api/interpreter';
    this.storageDir = path.resolve(process.cwd(), process.env.OSM_CACHE_DIR || 'data/real/osm');

    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Builds the Overpass QL query string for a bounding box
   */
  public buildOverpassQuery(bbox: [number, number, number, number]): string {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    // Overpass syntax: (south, west, north, east)
    const bboxStr = `${minLat.toFixed(4)},${minLon.toFixed(4)},${maxLat.toFixed(4)},${maxLon.toFixed(4)}`;

    return `[out:json][timeout:25];
(
  node["amenity"~"hospital|clinic"](${bboxStr});
  way["amenity"~"hospital|clinic"](${bboxStr});
  node["healthcare"~"hospital|centre"](${bboxStr});
  way["barrier"="dike"](${bboxStr});
  way["waterway"~"dam|weir|dyke"](${bboxStr});
  node["power"="substation"](${bboxStr});
  node["man_made"="pumping_station"](${bboxStr});
  node["amenity"="shelter"](${bboxStr});
);
out body center;
>;
out skel qt;`;
  }

  /**
   * Executes the Overpass query against the live Overpass servers
   */
  public async queryLiveOverpass(bbox: [number, number, number, number]): Promise<OverpassQueryResult> {
    const qlQuery = this.buildOverpassQuery(bbox);
    const endpoints = [this.primaryEndpoint, this.fallbackEndpoint];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json',
            'User-Agent': 'QARVYEN-Sovereign-Crisis-Engine/2.0 (Civil-Protection-Earth-Observation)',
          },
          body: `data=${encodeURIComponent(qlQuery)}`,
          signal: AbortSignal.timeout(20000), // 20s timeout
        });

        if (!response.ok) {
          throw new Error(`Overpass HTTP ${response.status}: ${await response.text().catch(() => '')}`);
        }

        const rawJsonText = await response.text();
        const data = JSON.parse(rawJsonText);
        const queryTimestamp = new Date().toISOString();

        // Write raw query response to disk for cryptographic provenance
        const queryHash = crypto.createHash('sha256').update(qlQuery).digest('hex').slice(0, 12);
        const diskFileName = `overpass_${queryHash}_${Date.now()}.json`;
        const diskPath = path.join(this.storageDir, diskFileName);

        await fs.promises.writeFile(diskPath, rawJsonText, 'utf8');
        const rawSha256 = crypto.createHash('sha256').update(rawJsonText).digest('hex');

        // Parse OSM elements into structured assets
        const assets: LiveOsmAsset[] = [];
        const elements = data.elements || [];

        for (const el of elements) {
          const tags = el.tags || {};
          let category: LiveOsmAsset['category'] | null = null;
          let assetType = 'infrastructure';

          if (tags.amenity === 'hospital' || tags.amenity === 'clinic' || tags.healthcare) {
            category = 'health';
            assetType = tags.amenity || 'health_facility';
          } else if (tags.barrier === 'dike' || tags.waterway === 'dam' || tags.waterway === 'weir') {
            category = 'water_barrier';
            assetType = tags.barrier || tags.waterway || 'dike';
          } else if (tags.man_made === 'pumping_station') {
            category = 'hydraulic';
            assetType = 'pumping_station';
          } else if (tags.power === 'substation') {
            category = 'energy';
            assetType = 'substation';
          }

          if (category) {
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
            if (typeof lat === 'number' && typeof lon === 'number') {
              const name = tags.name || tags['name:fr'] || `${assetType.toUpperCase()} (${el.type}/${el.id})`;
              assets.push({
                osmId: `${el.type}/${el.id}`,
                name,
                category,
                type: assetType,
                lat,
                lon,
                tags,
                isLiveOsmData: true,
              });
            }
          }
        }

        return {
          queryExecuted: qlQuery,
          queryTimestamp,
          elementsCount: elements.length,
          assets,
          rawResponseDiskPath: diskPath,
          rawResponseSha256: rawSha256,
          attribution: '© OpenStreetMap contributors (ODbL 1.0)',
          endpointUsed: endpoint,
        };
      } catch (err: any) {
        lastError = err;
        // Try fallback endpoint
      }
    }

    throw new Error(`OVERPASS_UNAVAILABLE: Failed to query live Overpass API after attempting primary and fallback endpoints. Detail: ${lastError?.message}`);
  }
}

export const overpassLiveClient = new OverpassLiveClient();
