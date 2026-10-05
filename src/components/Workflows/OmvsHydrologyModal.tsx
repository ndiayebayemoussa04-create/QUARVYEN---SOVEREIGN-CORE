/**
 * QARVYEN 2.0 — OMVS Hydrological Command Modal
 * Interactive display of dams (Manantali, Diama, Gouina, Félou)
 * and limnimetric gauging stations with real thresholds, discharges and trends.
 */

import React, { useState } from 'react';
import {
  Waves,
  AlertTriangle,
  Droplets,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Clock,
  Gauge,
  X,
  ShieldAlert,
  Info
} from 'lucide-react';
import { omvsHydrologyService, OMVS_STATIONS } from '../../services/omvsHydrologyService';
import { OmvsStation } from '../../types/qarvyen';

interface OmvsHydrologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStationId?: string;
}

export const OmvsHydrologyModal: React.FC<OmvsHydrologyModalProps> = ({
  isOpen,
  onClose,
  selectedStationId
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DAMS' | 'GAUGES'>('ALL');
  const [activeStation, setActiveStation] = useState<OmvsStation>(
    OMVS_STATIONS.find(s => s.id === selectedStationId) || OMVS_STATIONS[0]
  );

  if (!isOpen) return null;

  const basinData = omvsHydrologyService.getBasinHydrology();

  const filteredStations = OMVS_STATIONS.filter(s => {
    if (filterType === 'DAMS') return s.type === 'dam' || s.type === 'hydropower';
    if (filterType === 'GAUGES') return s.type === 'gauge_station';
    return true;
  });

  const getStatusBadge = (status: OmvsStation['alertStatus']) => {
    switch (status) {
      case 'RED_DANGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 border border-rose-600 text-rose-300">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            NIVEAU ROUGE — DÉBORDEMENT
          </span>
        );
      case 'ORANGE_ALERT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 border border-amber-500 text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            NIVEAU ORANGE — ALERTE CRUE
          </span>
        );
      case 'YELLOW_VIGILANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-950 border border-yellow-600 text-yellow-300">
            <Info className="w-3 h-3 text-yellow-400" />
            NIVEAU JAUNE — VIGILANCE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 border border-emerald-600 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            NIVEAU VERT — NORMAL
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-300 shadow-md">
              <Waves className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  RÉSEAU HYDROLOGIQUE SOUVERAIN OMVS
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                  BASSIN DU SÉNÉGAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Suivi limnimétrique en direct & lâchers d'ouvrages hydrauliques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400 font-mono">Statut Global :</span>
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                {basinData.globalAlertStatus === 'RED' ? 'ALERTE MAJEURE CRUE' : 'VIGILANCE BASSIN'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Propagation Wave Indicator */}
        <div className="bg-cyan-950/40 border-b border-cyan-800/40 px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              TEMPS DE PROPAGATION ESTIMÉ DE L'ONDE DE CRUE
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Débit total sortant : <span className="text-cyan-200 font-bold">{basinData.totalOutflowM3s.toLocaleString()} m³/s</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
              <div className="text-[10px] text-slate-400">Manantali ➔ Bakel</div>
              <div className="text-cyan-400 font-bold text-sm">~ 3.5 jours</div>
              <div className="text-[10px] text-slate-500">Distance 420 km</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
              <div className="text-[10px] text-slate-400">Bakel ➔ Matam</div>
              <div className="text-amber-400 font-bold text-sm">~ 2.0 jours</div>
              <div className="text-[10px] text-slate-500">Distance 165 km</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
              <div className="text-[10px] text-slate-400">Matam ➔ Podor</div>
              <div className="text-rose-400 font-bold text-sm">~ 3.0 jours</div>
              <div className="text-[10px] text-slate-500">Distance 280 km</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2">
              <div className="text-[10px] text-slate-400">Podor ➔ Diama</div>
              <div className="text-cyan-400 font-bold text-sm">~ 2.5 jours</div>
              <div className="text-[10px] text-slate-500">Distance 210 km (Estuaire)</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Stations List */}
          <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/60 overflow-hidden">
            {/* Filter Tabs */}
            <div className="p-3 border-b border-slate-800 flex gap-1">
              <button
                onClick={() => setFilterType('ALL')}
                className={`flex-1 py-1 px-2 rounded text-xs font-semibold ${
                  filterType === 'ALL'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tous ({OMVS_STATIONS.length})
              </button>
              <button
                onClick={() => setFilterType('DAMS')}
                className={`flex-1 py-1 px-2 rounded text-xs font-semibold ${
                  filterType === 'DAMS'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Barrages (4)
              </button>
              <button
                onClick={() => setFilterType('GAUGES')}
                className={`flex-1 py-1 px-2 rounded text-xs font-semibold ${
                  filterType === 'GAUGES'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Stations (4)
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredStations.map(station => {
                const isSelected = activeStation.id === station.id;
                return (
                  <button
                    key={station.id}
                    onClick={() => setActiveStation(station)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white line-clamp-1">
                        {station.name}
                      </span>
                      {station.alertStatus === 'RED_DANGER' && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">
                        Cote : <strong className="text-cyan-300">{station.currentLevelM.toFixed(2)} m</strong>
                      </span>
                      <span className="text-slate-400">
                        Débit : <strong className="text-slate-200">{station.outflowRateM3s} m³/s</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Station Detailed Inspection */}
          <div className="flex-1 flex flex-col bg-slate-900/50 overflow-y-auto p-5 space-y-5">
            {/* Title & Badge */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{activeStation.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    {activeStation.river}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Coordonnées GPS : {activeStation.coordinates[0].toFixed(3)}°N, {activeStation.coordinates[1].toFixed(3)}°W
                </p>
              </div>
              <div>{getStatusBadge(activeStation.alertStatus)}</div>
            </div>

            {/* Gauge Levels Metric Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-mono mb-1">COTE ACTUELLE</div>
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {activeStation.currentLevelM.toFixed(2)} <span className="text-xs font-normal text-slate-400">m IGN</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono mt-1">
                  {activeStation.trend === 'RISING' && (
                    <span className="text-rose-400 flex items-center">
                      <ArrowUpRight className="w-3 h-3" /> +{activeStation.trendRateM24h.toFixed(2)} m/24h
                    </span>
                  )}
                  {activeStation.trend === 'FALLING' && (
                    <span className="text-emerald-400 flex items-center">
                      <ArrowDownRight className="w-3 h-3" /> {activeStation.trendRateM24h.toFixed(2)} m/24h
                    </span>
                  )}
                  {activeStation.trend === 'STABLE' && (
                    <span className="text-slate-400 flex items-center">
                      <Minus className="w-3 h-3" /> Stable
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-mono mb-1">COTE NORMALE</div>
                <div className="text-xl font-bold font-mono text-slate-200">
                  {activeStation.normalRetentionLevelM.toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">Niveau de retenue usuel</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-amber-400 font-mono mb-1">SEUIL D'ALERTE</div>
                <div className="text-xl font-bold font-mono text-amber-300">
                  {activeStation.alertLevelM.toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
                </div>
                <div className="text-[10px] text-amber-500 font-mono mt-1">Déclenchement vigie crue</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-rose-400 font-mono mb-1">SEUIL DE DANGER</div>
                <div className="text-xl font-bold font-mono text-rose-300">
                  {activeStation.dangerLevelM.toFixed(2)} <span className="text-xs font-normal text-slate-400">m</span>
                </div>
                <div className="text-[10px] text-rose-500 font-mono mt-1">Débordement généralisé</div>
              </div>
            </div>

            {/* Discharges & Hydraulic Balance */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-200">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  BILAN HYDRAULIQUE & DÉBITS TRANSITANTS
                </div>
                {activeStation.storageRatePercent && (
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    Remplissage : {activeStation.storageRatePercent}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Débit Entrant (Inflow) :</span>
                  <strong className="text-emerald-400 text-sm">{activeStation.inflowRateM3s.toLocaleString()} m³/s</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Débit Sortant / Lâché :</span>
                  <strong className="text-rose-400 text-sm">{activeStation.outflowRateM3s.toLocaleString()} m³/s</strong>
                </div>
              </div>

              {activeStation.spillwayGatesOpen && (
                <div className="text-xs font-mono bg-cyan-950/40 border border-cyan-800/50 p-2.5 rounded-lg text-cyan-200 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Vannes & Évacuateur : <strong>{activeStation.spillwayGatesOpen}</strong></span>
                </div>
              )}
            </div>

            {/* Operational Directives */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="text-xs font-mono font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                CONSIGNES D'EXPLOITATION & IMPACT OPÉRATIONNEL
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeStation.operationalNotes}
              </p>
            </div>

            <div className="text-[11px] font-mono text-slate-500 text-right">
              Dernière mise à jour télémétrique : {new Date(activeStation.lastUpdated).toLocaleString('fr-FR')}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
