/**
 * QARVYEN 2.0 — Sovereign Interactive Geospatial Map (Leaflet)
 * Real interactive GIS layers:
 * - High-res Satellite Imagery / Dark Tactical Base
 * - Sentinel-1 Study Footprint
 * - Permanent Riverbed Water
 * - Detected Flooded Areas (SAR Backscatter change mask)
 * - Critical Infrastructure & Emergency Pins
 * - Interactive Coordinate & Elevation Inspector
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StudyAreaPreset } from '../../services/copernicusService';
import {
  SARProcessingConfig,
  FloodAnalysisResult,
  CriticalAsset,
} from '../../types/qarvyen';
import {
  Layers,
  MapPin,
  Eye,
  Sliders,
  ShieldAlert,
  Hospital,
  Zap,
  Info,
  Maximize2,
  Waves
} from 'lucide-react';
import { OMVS_STATIONS } from '../../services/omvsHydrologyService';

interface InteractiveMapProps {
  area: StudyAreaPreset;
  analysisResult: FloodAnalysisResult | null;
  config: SARProcessingConfig;
  simulationHour?: number;
  onSelectAsset?: (asset: CriticalAsset) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  area,
  analysisResult,
  config,
  simulationHour = 0,
  onSelectAsset,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{
    floodLayer?: L.LayerGroup;
    permanentWaterLayer?: L.LayerGroup;
    assetsLayer?: L.LayerGroup;
    footprintLayer?: L.LayerGroup;
    omvsLayer?: L.LayerGroup;
  }>({});

  const [activeBaseMap, setActiveBaseMap] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [showFloodMask, setShowFloodMask] = useState(true);
  const [showPermanentWater, setShowPermanentWater] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [showFootprint, setShowFootprint] = useState(true);
  const [showOmvs, setShowOmvs] = useState(true);
  const [floodOpacity, setFloodOpacity] = useState(0.75);
  const [inspectedPoint, setInspectedPoint] = useState<{
    lat: number;
    lng: number;
    elevation: number;
    deltaDb: number;
    isFlooded: boolean;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: area.center,
      zoom: area.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark Matter Tactical Map as Default
    const baseLayers = {
      dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }),
      street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }),
    };

    baseLayers[activeBaseMap].addTo(map);

    // Layer groups for dynamic toggling
    layersGroupRef.current.floodLayer = L.layerGroup().addTo(map);
    layersGroupRef.current.permanentWaterLayer = L.layerGroup().addTo(map);
    layersGroupRef.current.assetsLayer = L.layerGroup().addTo(map);
    layersGroupRef.current.footprintLayer = L.layerGroup().addTo(map);
    layersGroupRef.current.omvsLayer = L.layerGroup().addTo(map);

    // Click inspector
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Math.round(e.latlng.lat * 10000) / 10000;
      const lng = Math.round(e.latlng.lng * 10000) / 10000;

      // Simulated interpolation from grid if available
      let elevation = 12.4;
      let deltaDb = -1.2;
      let isFlooded = false;

      if (analysisResult) {
        const { minLon, maxLon, minLat, maxLat } = analysisResult.rasterGrid.bounds;
        const normX = (lng - minLon) / (maxLon - minLon);
        const normY = (lat - minLat) / (maxLat - minLat);

        if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
          const gridX = Math.floor(normX * analysisResult.rasterGrid.width);
          const gridY = Math.floor(normY * analysisResult.rasterGrid.height);

          elevation = analysisResult.rasterGrid.demAltitudeCells[gridY]?.[gridX] ?? 12.0;
          deltaDb = analysisResult.rasterGrid.differenceDbCells[gridY]?.[gridX] ?? -1.0;
          isFlooded = analysisResult.rasterGrid.floodedCells[gridY]?.[gridX] === 1;
        }
      }

      setInspectedPoint({ lat, lng, elevation, deltaDb, isFlooded });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [area.id]);

  // Handle Base Map Change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      activeBaseMap === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : activeBaseMap === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

    // Re-bring vector layers to front
    Object.values(layersGroupRef.current).forEach(g => {
      if (g) map.addLayer(g);
    });
  }, [activeBaseMap]);

  // Update Geospatial Layers (Footprint, Flood Mask, River, Assets)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { footprintLayer, permanentWaterLayer, floodLayer, assetsLayer } = layersGroupRef.current;

    // 1. FOOTPRINT
    if (footprintLayer) {
      footprintLayer.clearLayers();
      if (showFootprint) {
        const [minLon, minLat, maxLon, maxLat] = area.bbox;
        const bounds: L.LatLngBoundsExpression = [
          [minLat, minLon],
          [maxLat, maxLon],
        ];

        const rect = L.rectangle(bounds, {
          color: '#38bdf8', // sky-400
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#38bdf8',
          fillOpacity: 0.04,
        });

        rect.bindTooltip(`Emprise Sentinel-1 SAR IW : ${area.name}`, {
          sticky: true,
          className: 'bg-slate-900 text-sky-300 border border-sky-800 text-xs px-2 py-1 font-mono rounded',
        });

        footprintLayer.addLayer(rect);
      }
    }

    // 2. RASTER GRID (Flooded & Permanent Water)
    if (permanentWaterLayer && floodLayer) {
      permanentWaterLayer.clearLayers();
      floodLayer.clearLayers();

      if (analysisResult) {
        const grid = analysisResult.rasterGrid;
        const { minLon, maxLon, minLat, maxLat } = grid.bounds;
        const lonStep = (maxLon - minLon) / grid.width;
        const latStep = (maxLat - minLat) / grid.height;

        for (let y = 0; y < grid.height; y++) {
          for (let x = 0; x < grid.width; x++) {
            const cellMinLon = minLon + x * lonStep;
            const cellMaxLon = cellMinLon + lonStep;
            const cellMinLat = minLat + y * latStep;
            const cellMaxLat = cellMinLat + latStep;

            const cellBounds: L.LatLngBoundsExpression = [
              [cellMinLat, cellMinLon],
              [cellMaxLat, cellMaxLon],
            ];

            // Permanent River
            if (showPermanentWater && grid.permanentWaterCells[y][x] === 1) {
              const permRect = L.rectangle(cellBounds, {
                color: '#0284c7',
                weight: 0.5,
                fillColor: '#0369a1',
                fillOpacity: 0.85,
              });
              permanentWaterLayer.addLayer(permRect);
            }

            // Flooded Mask
            if (showFloodMask && grid.floodedCells[y][x] === 1) {
              // Expand slightly if simulation is active
              const deltaDb = grid.differenceDbCells[y][x];
              const floodColor = deltaDb < -7.0 ? '#ef4444' : '#06b6d4'; // Deep submerged vs shallow

              const floodRect = L.rectangle(cellBounds, {
                color: floodColor,
                weight: 0.5,
                fillColor: floodColor,
                fillOpacity: floodOpacity,
              });

              floodRect.bindTooltip(`Zone Inondée Sentinel-1<br/>Δσ⁰: <b>${deltaDb} dB</b><br/>Alt: ${grid.demAltitudeCells[y][x]} m`, {
                sticky: true,
                className: 'bg-slate-900 text-slate-200 border border-cyan-800 text-xs px-2 py-1 font-mono rounded shadow-lg',
              });

              floodLayer.addLayer(floodRect);
            }
          }
        }
      }
    }

    // 3. CRITICAL ASSETS
    if (assetsLayer) {
      assetsLayer.clearLayers();
      if (showAssets) {
        const assetsToDisplay = analysisResult ? analysisResult.criticalAssetsAtRisk : area.assets;

        assetsToDisplay.forEach((asset: CriticalAsset) => {
          const isCritical = asset.riskLevel === 'CRITICAL';
          const isHigh = asset.riskLevel === 'HIGH';

          const markerColor = isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#10b981';

          // Custom tactical SVG marker
          const customIcon = L.divIcon({
            className: 'custom-tactical-pin',
            html: `
              <div style="
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(15, 23, 42, 0.95);
                border: 2px solid ${markerColor};
                box-shadow: 0 0 12px ${markerColor}66;
                cursor: pointer;
              ">
                <span style="font-size: 13px;">${asset.type === 'hospital' ? '🏥' : asset.type === 'dike' ? '🛡️' : '⚡'}</span>
                ${isCritical ? `<div style="
                  position: absolute;
                  inset: -4px;
                  border-radius: 50%;
                  border: 1.5px solid ${markerColor};
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>` : ''}
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker(asset.coordinates, { icon: customIcon });

          marker.on('click', () => {
            if (onSelectAsset) onSelectAsset(asset);
          });

          marker.bindTooltip(`
            <div style="font-family: monospace; font-size: 11px; padding: 2px;">
              <strong style="color: #f8fafc;">${asset.name}</strong><br/>
              ${asset.osmId ? `<span style="color: #38bdf8;">OSM : ${asset.osmId}</span><br/>` : ''}
              <span style="color: ${markerColor};">STATUT : ${asset.operationalStatus}</span> | Alt: ${asset.elevationM}m<br/>
              ${asset.capacity ? `Capacité: ${asset.capacity} lits` : ''}
            </div>
          `, {
            direction: 'top',
            offset: [0, -14],
            className: 'bg-slate-900 border border-slate-700 shadow-xl rounded',
          });

          assetsLayer.addLayer(marker);
        });
      }
    }

    // 4. OMVS HYDROLOGICAL STATIONS & DAMS
    const omvsLayer = layersGroupRef.current.omvsLayer;
    if (omvsLayer) {
      omvsLayer.clearLayers();
      if (showOmvs) {
        OMVS_STATIONS.forEach(station => {
          const isDanger = station.alertStatus === 'RED_DANGER';
          const isAlert = station.alertStatus === 'ORANGE_ALERT';
          const color = isDanger ? '#ef4444' : isAlert ? '#f59e0b' : '#06b6d4';

          const icon = L.divIcon({
            className: 'custom-omvs-pin',
            html: `
              <div style="
                background: rgba(15, 23, 42, 0.95);
                border: 2px solid ${color};
                color: ${color};
                padding: 2px 6px;
                border-radius: 6px;
                font-family: monospace;
                font-size: 10px;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
                white-space: nowrap;
              ">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; display: inline-block;"></span>
                <span>${station.type === 'dam' ? '⏏' : '≋'} ${station.name.split(' ')[0]} : ${station.currentLevelM.toFixed(2)}m</span>
              </div>
            `,
            iconSize: [110, 22],
            iconAnchor: [55, 11],
          });

          const marker = L.marker(station.coordinates, { icon });
          marker.bindTooltip(`
            <div style="font-family: monospace; font-size: 11px; padding: 4px;">
              <b style="color: ${color};">${station.name}</b><br/>
              Rivière : ${station.river}<br/>
              Cote : <b>${station.currentLevelM.toFixed(2)} m IGN</b> (Alerte: ${station.alertLevelM.toFixed(2)} m)<br/>
              Débit : <b>${station.outflowRateM3s} m³/s</b><br/>
              Tendance : <b>${station.trend === 'RISING' ? '↗ En hausse' : station.trend === 'FALLING' ? '↘ En baisse' : '→ Stable'}</b><br/>
              <i>${station.operationalNotes}</i>
            </div>
          `, { sticky: true, className: 'bg-slate-900 text-slate-100 border border-slate-700 rounded shadow-xl' });

          omvsLayer.addLayer(marker);
        });
      }
    }
  }, [
    area,
    analysisResult,
    showFootprint,
    showPermanentWater,
    showFloodMask,
    showAssets,
    showOmvs,
    floodOpacity,
    simulationHour,
  ]);

  return (
    <div className="relative w-full h-full min-h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg shadow-lg">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
          SIG TACTIQUE SOUVERAIN
        </span>
        <span className="text-slate-500 text-xs">/</span>
        <span className="text-xs font-mono text-cyan-400">
          EPSG:4326 · {area.name}
        </span>
      </div>

      {/* Layer Controls Panel (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-xl w-64">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Couches Carto</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Leaflet v1.9</span>
        </div>

        {/* Base Map Selector */}
        <div className="flex rounded-md p-0.5 bg-slate-950 border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveBaseMap('dark')}
            className={`flex-1 py-1 rounded font-medium transition-colors ${
              activeBaseMap === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tactique Dark
          </button>
          <button
            onClick={() => setActiveBaseMap('satellite')}
            className={`flex-1 py-1 rounded font-medium transition-colors ${
              activeBaseMap === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBaseMap('street')}
            className={`flex-1 py-1 rounded font-medium transition-colors ${
              activeBaseMap === 'street' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Réseau
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-1.5 pt-1 text-xs">
          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
              Nappe Inondée (SAR Δσ⁰)
            </span>
            <input
              type="checkbox"
              checked={showFloodMask}
              onChange={e => setShowFloodMask(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-600" />
              Lit Fluvial Permanent
            </span>
            <input
              type="checkbox"
              checked={showPermanentWater}
              onChange={e => setShowPermanentWater(e.target.checked)}
              className="accent-sky-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              Infrastructures Menacées
            </span>
            <input
              type="checkbox"
              checked={showAssets}
              onChange={e => setShowAssets(e.target.checked)}
              className="accent-red-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border border-sky-400" />
              Emprise Scène Sentinel-1
            </span>
            <input
              type="checkbox"
              checked={showFootprint}
              onChange={e => setShowFootprint(e.target.checked)}
              className="accent-sky-400 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
              Réseau Limnimétrique OMVS
            </span>
            <input
              type="checkbox"
              checked={showOmvs}
              onChange={e => setShowOmvs(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
          </label>
        </div>

        {/* Opacity Slider */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Opacité Raster</span>
            <span className="font-mono">{Math.round(floodOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={floodOpacity}
            onChange={e => setFloodOpacity(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Point Inspector Card (Bottom Left) */}
      {inspectedPoint && (
        <div className="absolute bottom-4 left-3 z-[1000] bg-slate-900/95 backdrop-blur-md border border-cyan-800/80 p-3 rounded-xl shadow-2xl max-w-sm">
          <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Inspecteur Pixel SAR</span>
            </div>
            <button
              onClick={() => setInspectedPoint(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">COORDONNÉES</span>
              <span className="text-slate-200">{inspectedPoint.lat.toFixed(4)}°N, {inspectedPoint.lng.toFixed(4)}°E</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ALTITUDE DEM</span>
              <span className="text-amber-300 font-semibold">{inspectedPoint.elevation} m</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">RÉTRODIFFUSION Δσ⁰</span>
              <span className={inspectedPoint.deltaDb < -4.5 ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                {inspectedPoint.deltaDb} dB
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ÉTAT DU SOL</span>
              <span className={inspectedPoint.isFlooded ? 'text-cyan-400 font-bold' : 'text-emerald-400'}>
                {inspectedPoint.isFlooded ? 'SUBMERGÉ (EAU)' : 'SOL EXONDÉ'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0" />

      {/* Official Geospatial Attribution Badge (Bottom Right) */}
      <div className="absolute bottom-1 right-2 z-[900] bg-slate-950/85 backdrop-blur-sm border border-slate-800/80 px-2 py-0.5 rounded text-[9px] font-mono text-slate-400 flex items-center gap-1.5 pointer-events-auto">
        <span className={analysisResult?.executionMode === 'REAL_DATA' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
          {analysisResult?.executionMode === 'REAL_DATA' ? '● REAL DATA' : '● SYNTHETIC DEMO'}
        </span>
        <span>·</span>
        <span>Copernicus CDSE Sentinel-1</span>
        <span>·</span>
        <span>WorldPop (100m)</span>
        <span>·</span>
        <span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">OpenStreetMap</a> contributors (ODbL)</span>
      </div>
    </div>
  );
};
