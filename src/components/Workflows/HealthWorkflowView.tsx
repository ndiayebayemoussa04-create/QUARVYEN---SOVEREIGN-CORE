/**
 * QARVYEN 2.0 — Multisectoral Demonstration: Health & Hospital Crisis Logistics
 * Demonstrates the power of the QARVYEN Core on a non-geospatial, public health crisis:
 * Bed capacity, ICU saturation, staff, generator autonomy, emergency patient reallocation.
 */

import React, { useState } from 'react';
import {
  INITIAL_HOSPITALS,
  HospitalNetworkSummary,
  computeHospitalNetworkSummary,
  generatePatientReallocations,
  HOSPITAL_REGIONS,
  getHospitalsForNetwork,
  GLOBAL_OUTBREAK_CLUSTERS,
  GlobalOutbreakCluster,
} from '../../services/healthModule';
import {
  HospitalNode,
  PatientReallocationPlan,
  UserProfile,
} from '../../types/qarvyen';
import { auditLedger } from '../../services/governanceAudit';
import {
  Activity,
  Hospital,
  ShieldAlert,
  ArrowRight,
  BatteryCharging,
  Users,
  Ambulance,
  LifeBuoy,
  FileCheck2,
  RefreshCw,
  AlertTriangle,
  Globe,
  Radio,
  Biohazard,
  ShieldCheck,
  CheckCircle2,
  Syringe,
  Crosshair
} from 'lucide-react';

interface HealthWorkflowViewProps {
  currentUser: UserProfile;
}

export const HealthWorkflowView: React.FC<HealthWorkflowViewProps> = ({ currentUser }) => {
  const [activeHealthTab, setActiveHealthTab] = useState<'networks' | 'who_outbreaks'>('networks');
  const [selectedContinent, setSelectedContinent] = useState<string>('ALL');
  const [selectedRegionId, setSelectedRegionId] = useState('senegal_river_valley');
  const [hospitals, setHospitals] = useState<HospitalNode[]>(INITIAL_HOSPITALS);
  const [reallocationPlans, setReallocationPlans] = useState<PatientReallocationPlan[]>([]);
  const [isSimulatingSurge, setIsSimulatingSurge] = useState(false);
  const [auditHash, setAuditHash] = useState<string | null>(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState<GlobalOutbreakCluster | null>(GLOBAL_OUTBREAK_CLUSTERS[0]);

  const summary: HospitalNetworkSummary = computeHospitalNetworkSummary(hospitals);

  const filteredRegions = selectedContinent === 'ALL'
    ? HOSPITAL_REGIONS
    : HOSPITAL_REGIONS.filter(r => r.continent === selectedContinent);

  const filteredOutbreaks = selectedContinent === 'ALL'
    ? GLOBAL_OUTBREAK_CLUSTERS
    : GLOBAL_OUTBREAK_CLUSTERS.filter(o => {
        if (selectedContinent === 'AFRICA') return o.whoRegion === 'AFRO';
        if (selectedContinent === 'AMERICAS') return o.whoRegion === 'AMRO';
        if (selectedContinent === 'EUROPE') return o.whoRegion === 'EURO';
        if (selectedContinent === 'ASIA') return o.whoRegion === 'SEARO' || o.whoRegion === 'WPRO';
        return true;
      });

  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    setHospitals(getHospitalsForNetwork(regionId));
    setReallocationPlans([]);
    setAuditHash(null);
  };

  // Trigger crisis surge scenario dynamically on any chosen hospital network
  const handleSimulateSurge = () => {
    setIsSimulatingSurge(true);

    setTimeout(() => {
      const updated = hospitals.map((h, idx) => {
        if (idx === 0) {
          return {
            ...h,
            occupiedBeds: Math.min(h.totalBeds, h.occupiedBeds + Math.round(h.totalBeds * 0.15)),
            occupiedIcuBeds: h.icuBeds,
            floodRisk: 'ALERT' as const,
            generatorAutonomyHours: Math.min(h.generatorAutonomyHours, 24),
          };
        }
        if (idx === 1 && hospitals.length > 1) {
          return {
            ...h,
            occupiedBeds: h.totalBeds,
            occupiedIcuBeds: h.icuBeds,
            floodRisk: 'EVACUATING' as const,
            generatorAutonomyHours: Math.min(h.generatorAutonomyHours, 14),
          };
        }
        return h;
      });

      setHospitals(updated);
      const plans = generatePatientReallocations(updated);
      setReallocationPlans(plans);
      setIsSimulatingSurge(false);

      // Audit the health reallocation decision
      auditLedger.logAction(
        currentUser,
        'HEALTH_SURGE_REALLOCATION_PLANETARY',
        'health',
        {
          regionId: selectedRegionId,
          sourceHospitalsCount: updated.filter(h => h.floodRisk !== 'SAFE').length,
          totalPatientsEvacuated: plans.reduce((acc, p) => acc + p.patientCount, 0),
          plansCount: plans.length,
        },
        ['doc-plan-orsec-evac-sanitaire'],
        [],
        45,
        'QARVYEN Planetary Health Logistics Core'
      ).then(record => {
        setAuditHash(record.hashSha256);
      });
    }, 400);
  };

  const handleReset = () => {
    setHospitals(getHospitalsForNetwork(selectedRegionId));
    setReallocationPlans([]);
    setAuditHash(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 flex flex-col gap-6">
      {/* Top Banner: Core Reusability Explanation */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
              MODULE MULTISECTORIEL : SANTÉ PUBLIQUE & CRISE
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">COUVERTURE PLANÉTAIRE</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Régulation Capacitaire Hospitalière Planétaire
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl mt-0.5">
            Démonstration de l'extensibilité du Core : sans reconstruire l'infrastructure, QARVYEN applique ses moteurs d'analyse de contraintes, de RAG doctrinal et de traçabilité souveraine à la gestion des flux hospitaliers sur 5 théâtres mondiaux.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSimulateSurge}
            disabled={isSimulatingSurge}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-950/50 flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            Simuler Surcharge & Déclencher Réallocation
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
            title="Réinitialiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Planetary Theatre Selector & Sub-navigation */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveHealthTab('networks')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeHealthTab === 'networks'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            Réseaux Hospitaliers & Flux ({HOSPITAL_REGIONS.length} Théâtres)
          </button>
          <button
            onClick={() => setActiveHealthTab('who_outbreaks')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeHealthTab === 'who_outbreaks'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Biohazard className="w-3.5 h-3.5" />
            Observatoire Pandémique OMS (RSI 2005)
          </button>
        </div>

        {/* Continental filter */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 text-[11px] mr-1">Continent :</span>
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'AFRICA', label: '🌍 Afrique' },
            { id: 'EUROPE', label: '🇪🇺 Europe' },
            { id: 'AMERICAS', label: '🌎 Amériques' },
            { id: 'ASIA', label: '🌏 Asie' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedContinent(c.id)}
              className={`px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer font-medium ${
                selectedContinent === c.id
                  ? 'bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {activeHealthTab === 'networks' && (
        <>
          {/* Active Hospital Region Selector */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <Globe className="w-4 h-4 text-rose-400" />
              <span className="font-bold uppercase tracking-wider text-[11px]">Réseau Hospitalier Actif :</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filteredRegions.map(reg => (
                <button
                  key={reg.id}
                  onClick={() => handleSelectRegion(reg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedRegionId === reg.id
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{reg.flag}</span>
                  <span>{reg.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Network KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>OCCUPATION GLOBALE LITS</span>
                <Hospital className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {summary.occupancyRatePercent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {summary.totalOccupied} / {summary.totalCapacity} lits disponibles
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>LITS DE RÉANIMATION (ICU)</span>
                <Activity className="w-4 h-4 text-rose-400" />
              </div>
              <div className={`text-2xl font-bold font-mono mt-2 ${summary.icuOccupancyRatePercent >= 90 ? 'text-rose-400' : 'text-amber-400'}`}>
                {summary.icuOccupancyRatePercent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {summary.totalIcuOccupied} / {summary.totalIcuCapacity} lits critiques occupés
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>ÉTABLISSEMENTS MENACÉS</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {summary.criticalHospitalsCount} / {hospitals.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Accès partiel submergé par la crue
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>VECTEURS AMBULANCIERS</span>
                <Ambulance className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                {summary.totalAmbulancesReady}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Équipes d'urgence pré-positionnées
              </div>
            </div>
          </div>

          {/* Hospital Nodes Status Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Réseau Hospitalier du Bassin d'Opération
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{hospitals.length} Pôles Sanitaires Régionaux</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Établissement</th>
                    <th className="px-4 py-3">Niveau Aléa Inondation</th>
                    <th className="px-4 py-3">Lits Totaux</th>
                    <th className="px-4 py-3">Lits Réanimation</th>
                    <th className="px-4 py-3">Personnel Actif</th>
                    <th className="px-4 py-3">Autonomie Électrique (Secours)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {hospitals.map(h => (
                    <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{h.name}</div>
                        <div className="text-[10px] text-slate-400">{h.location[0].toFixed(3)}°N, {h.location[1].toFixed(3)}°E</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.floodRisk === 'EVACUATING' ? 'bg-red-950 text-red-400 border border-red-800' :
                          h.floodRisk === 'ALERT' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {h.floodRisk}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {h.occupiedBeds} / {h.totalBeds} ({Math.round(h.occupiedBeds / h.totalBeds * 100)}%)
                      </td>
                      <td className="px-4 py-3">
                        <span className={h.occupiedIcuBeds >= h.icuBeds ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {h.occupiedIcuBeds} / {h.icuBeds}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {h.staffOnDuty} soignants
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <BatteryCharging className={`w-3.5 h-3.5 ${h.generatorAutonomyHours < 72 ? 'text-rose-400' : 'text-emerald-400'}`} />
                          <span className={h.generatorAutonomyHours < 72 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {h.generatorAutonomyHours}h
                          </span>
                          {h.generatorAutonomyHours < 72 && (
                            <span className="text-[9px] text-rose-500 font-sans">(&lt; 72h doctrine)</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* WHO Planetary Outbreak Observatory */}
      {activeHealthTab === 'who_outbreaks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Outbreaks List */}
            <div className="lg:col-span-1 space-y-3">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                <span>Foyers Épidémiologiques Actifs</span>
                <span className="text-amber-400">{filteredOutbreaks.length} Clusters</span>
              </div>
              <div className="space-y-2.5">
                {filteredOutbreaks.map(outbreak => (
                  <div
                    key={outbreak.id}
                    onClick={() => setSelectedOutbreak(outbreak)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedOutbreak?.id === outbreak.id
                        ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold">{outbreak.whoRegion}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        outbreak.threatLevel === 'PANDEMIC_RISK' ? 'bg-red-950 text-red-300 border border-red-800' :
                        outbreak.threatLevel === 'EMERGENCY' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}>
                        {outbreak.threatLevel}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white mt-1.5">{outbreak.pathogen}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{outbreak.name}</div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>R₀ : <strong className="text-amber-300">{outbreak.reproductionRateR0}</strong></span>
                      <span>Létalité : <strong className="text-rose-400">{outbreak.fatalityRatePercent}%</strong></span>
                      <span>Cas : ~{outbreak.activeCasesEstimated.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Outbreak Detail & Directives */}
            {selectedOutbreak && (
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Biohazard className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                        FICHE ÉPIDÉMIOLOGIQUE DÉTAILLÉE — OMS {selectedOutbreak.whoRegion}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedOutbreak.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pathogène : <span className="font-mono text-cyan-300">{selectedOutbreak.pathogen}</span> · Zone : {selectedOutbreak.continent}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      Pays : {selectedOutbreak.affectedCountries.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Epidemiological metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TAUX REPRODUCTION R₀</span>
                    <span className="text-xl font-bold text-amber-400">{selectedOutbreak.reproductionRateR0}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TAUX DE LÉTALITÉ</span>
                    <span className="text-xl font-bold text-rose-400">{selectedOutbreak.fatalityRatePercent}%</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">RISQUE SURCHARGE LITS</span>
                    <span className="text-xl font-bold text-orange-400">{selectedOutbreak.hospitalSurgeRisk}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">STOCK VACCINS / INTRANTS</span>
                    <span className={`text-sm font-bold ${
                      selectedOutbreak.vaccineSupplyStatus === 'AVAILABLE' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {selectedOutbreak.vaccineSupplyStatus}
                    </span>
                  </div>
                </div>

                {/* Transmission vector */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-1">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                    Vecteur et Étiologie de Transmission :
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedOutbreak.transmissionVector}
                  </p>
                </div>

                {/* Directives */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                    Directives Opérationnelles Recommandées (IHR / RSI 2005 & Sphère) :
                  </span>
                  <div className="space-y-2">
                    {selectedOutbreak.recommendedDirectives.map((directive, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{directive}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      auditLedger.logAction(
                        currentUser,
                        'WHO_IHR_PLANETARY_DIRECTIVE_ISSUED',
                        'health',
                        {
                          clusterId: selectedOutbreak.id,
                          pathogen: selectedOutbreak.pathogen,
                          whoRegion: selectedOutbreak.whoRegion,
                          directivesApplied: selectedOutbreak.recommendedDirectives.length
                        },
                        ['doc-who-ihr-rsi', 'doc-sphere-standards'],
                        [],
                        32,
                        'QARVYEN WHO Planetary Surveillance Engine'
                      ).then(rec => {
                        alert(`Directive Sanitaire OMS émise et scellée dans l'audit souverain SHA-256 :\n${rec.hashSha256}`);
                      });
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Diffuser & Sceller Directive d'Alerte Sanitaire (SHA-256)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Reallocation Plan Results */}
      {reallocationPlans.length > 0 && (
        <div className="bg-slate-900 border border-cyan-800/80 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Plan de Réallocation Sanitaire Généré par QARVYEN Core
                </h3>
                <p className="text-xs text-slate-400">
                  Calcul d'optimisation sous contraintes topographiques, routières et médicales.
                </p>
              </div>
            </div>
            {auditHash && (
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-1 rounded">
                Audit SHA-256 : {auditHash.slice(0, 16)}...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reallocationPlans.map(plan => (
              <div key={plan.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">{plan.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    plan.category === 'ICU_REANIMATION' ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'
                  }`}>
                    {plan.category} ({plan.patientCount} patients)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-white">
                  <span className="font-semibold text-rose-300 truncate">{plan.sourceHospitalName}</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-emerald-300 truncate">{plan.targetHospitalName}</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vecteur d'Évacuation :</span>
                    <span className="font-mono text-cyan-300 font-semibold">{plan.evacuationRoute}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance & ETA estimé :</span>
                    <span className="font-mono text-amber-300">{plan.distanceKm} km · {plan.etaMinutes} minutes</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  "{plan.riskAssessment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
