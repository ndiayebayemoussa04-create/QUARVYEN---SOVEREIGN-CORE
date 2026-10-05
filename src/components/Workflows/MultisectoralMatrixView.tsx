/**
 * QARVYEN 2.0 — Multisectoral Sovereign Matrix View
 * Full integration of the 9 strategic sovereign sectors and their specialized AI agents:
 * Defense, Energy, Agriculture, Livestock, Economy, Territory, Health, Telecoms, Education.
 */

import React, { useState } from 'react';
import { UserProfile, SectorType } from '../../types/qarvyen';
import {
  MULTISECTORAL_SECTORS,
  MultisectoralSector,
  multisectoralRegistry,
  SectorActionDirective
} from '../../services/multisectoralService';
import {
  ShieldAlert,
  Zap,
  Wheat,
  TrendingUp,
  MapPin,
  Activity,
  Radio,
  GraduationCap,
  Milestone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bot,
  FileText,
  Compass,
  Building2,
  Lock,
  Cpu,
  RefreshCw
} from 'lucide-react';

interface MultisectoralMatrixViewProps {
  currentUser: UserProfile;
  onNavigateToModule?: (tab: string) => void;
}

export const MultisectoralMatrixView: React.FC<MultisectoralMatrixViewProps> = ({
  currentUser,
  onNavigateToModule
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<SectorType>('defense_resilience');
  const [approvedDirectiveHashes, setApprovedDirectiveHashes] = useState<Record<string, string>>({});
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'SECURITY' | 'INFRASTRUCTURE' | 'LIVELIHOOD' | 'SOCIAL_HUMAN'>('ALL');
  const [simulatedConflictResolved, setSimulatedConflictResolved] = useState<string | null>(null);

  const sectors = multisectoralRegistry.getAllSectors();

  const filteredSectors = activeCategoryFilter === 'ALL'
    ? sectors
    : sectors.filter(s => s.category === activeCategoryFilter);

  const currentSector = multisectoralRegistry.getSectorById(selectedSectorId) || sectors[0];

  const getSectorIcon = (id: SectorType, className: string = 'w-5 h-5') => {
    switch (id) {
      case 'defense_resilience': return <ShieldAlert className={className} />;
      case 'energy': return <Zap className={className} />;
      case 'agriculture': return <Wheat className={className} />;
      case 'livestock': return <Milestone className={className} />;
      case 'economy': return <TrendingUp className={className} />;
      case 'territory': return <MapPin className={className} />;
      case 'health': return <Activity className={className} />;
      case 'telecom': return <Radio className={className} />;
      case 'education': return <GraduationCap className={className} />;
      default: return <Layers className={className} />;
    }
  };

  const handleApproveDirective = async (directive: SectorActionDirective) => {
    try {
      const res = await multisectoralRegistry.approveDirective(currentSector.id, directive.id, currentUser);
      setApprovedDirectiveHashes(prev => ({
        ...prev,
        [directive.id]: res.hashSha256
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 flex flex-col gap-6">
      {/* 1. Header & Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-2xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
              ARCHITECTURE MULTISECTORIELLE SOUVERAINE
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-amber-400 font-mono font-semibold">9 PÔLES D'ÉTAT COORDONNÉS</span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">9 AGENTS IA DÉDIÉS</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1.5 tracking-tight font-sans">
            Matrice de Résilience Intersectorielle & Polyvalence Opérationnelle
          </h2>
          <p className="text-xs text-slate-400 max-w-4xl mt-1 leading-relaxed">
            Démonstration de la transversalité du moteur QARVYEN Core : une seule plateforme d'arbitrage satellitaire, démographique et prédictive connecte et synchronise en temps réel les 9 piliers régaliens d'un État en crise complexe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">Directive Scellée SHA-256</div>
            <div className="text-xs font-bold text-emerald-400">
              {Object.keys(approvedDirectiveHashes).length} Actes Validés
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter & 9 Sectors Quick Selector Grid */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>PÔLES STRATÉGIQUES D'ÉTAT :</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Tous (9)' },
              { id: 'SECURITY', label: '🛡️ Sécurité & C2' },
              { id: 'INFRASTRUCTURE', label: '⚡ Réseaux & Ouvrages' },
              { id: 'LIVELIHOOD', label: '🌾 Subsistance & Économie' },
              { id: 'SOCIAL_HUMAN', label: '🏥 Santé & Social' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer font-medium ${
                  activeCategoryFilter === cat.id
                    ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* The 9 Sector Badges / Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {filteredSectors.map(sector => {
            const isSelected = sector.id === selectedSectorId;
            return (
              <button
                key={sector.id}
                onClick={() => setSelectedSectorId(sector.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/60'
                    : 'bg-slate-900/80 border-slate-800/90 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isSelected ? 'bg-cyan-950 border border-cyan-800 text-cyan-300' : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}>
                  {getSectorIcon(sector.id, 'w-5 h-5')}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span className="text-slate-400 font-bold">{sector.code}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      sector.category === 'SECURITY' ? 'text-rose-400' :
                      sector.category === 'INFRASTRUCTURE' ? 'text-amber-400' :
                      sector.category === 'LIVELIHOOD' ? 'text-emerald-400' : 'text-sky-400'
                    }`}>
                      {sector.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate font-sans">{sector.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{sector.missionOverview}</p>

                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300">
                    <Bot className="w-3 h-3 text-cyan-400" />
                    <span className="truncate">{sector.agent.name}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Deep Dive into the Active Sector: Detailed Role, KPIs & Specialized Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sector Details & KPIs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                  {getSectorIcon(currentSector.id, 'w-6 h-6')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">{currentSector.code}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-400">{currentSector.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans">{currentSector.title}</h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">Autorité Tutélaire</span>
                <span className="text-xs font-semibold text-slate-200">{currentSector.leadMinistry}</span>
              </div>
            </div>

            {/* Legal Mandate & Role in Crisis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800/90 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono font-bold uppercase text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mandat Légal & Doctrines</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {currentSector.legalMandate}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800/90 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono font-bold uppercase text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rôle Tactique en Phase de Crise</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {currentSector.tacticalRoleInCrisis}
                </p>
              </div>
            </div>

            {/* Operational KPIs */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 uppercase mb-3">
                <span>Indicateurs Clés de Situation Opérationnelle (KPIs)</span>
                <span className="text-emerald-400 text-[10px]">Télémétrie en Direct</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentSector.kpis.map(kpi => (
                  <div key={kpi.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1 font-mono">
                    <span className="text-[10px] text-slate-400 truncate block">{kpi.label}</span>
                    <div className="text-lg font-bold text-white tracking-tight">{kpi.value}</div>
                    {kpi.subValue && (
                      <div className="text-[10px] text-slate-500 truncate">{kpi.subValue}</div>
                    )}
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        kpi.status === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                        kpi.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {kpi.status}
                      </span>
                      <span className="text-slate-400">
                        {kpi.trend === 'UP' ? '↗' : kpi.trend === 'DOWN' ? '↘' : '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intersectoral Synergies & Conflict Arbitrations */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 uppercase">
                <span>Interdépendances & Arbitrages Interministériels</span>
                <span className="text-cyan-400 text-[10px]">Liaisons Croisées</span>
              </div>

              <div className="space-y-2">
                {currentSector.intersectoralSynergies.map((syn, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3 text-xs">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                      syn.relationship === 'PROVIDES' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      syn.relationship === 'REQUIRES' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {syn.relationship === 'PROVIDES' ? 'APPROVISIONNE' :
                       syn.relationship === 'REQUIRES' ? 'DÉPEND DE' : 'ARBITRAGE CONFLIT'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white capitalize mr-1.5">
                        Vers {syn.targetSector} :
                      </span>
                      <span className="text-slate-300 text-[11px]">{syn.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Interministerial Conflict Simulator */}
          <div className="bg-slate-900 border border-amber-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Simulateur d'Arbitrage Intersectoriel de Crise
                </h4>
              </div>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                Aide à la Décision Première Ministre / C2
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Scénario type : En cas de crue extrême, l'énergie électrique disponible est insuffisante pour alimenter simultanément les <strong>stations de pompage agricoles de drainage (SAED)</strong> et les <strong>hôpitaux de secteur (ICU)</strong>. Quel arbitrage le poste de commandement doit-il ordonner ?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setSimulatedConflictResolved('HEALTH_PRIORITY')}
                className="p-3 rounded-xl bg-slate-950 border border-rose-800 hover:border-rose-500 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-rose-300">Option Alpha : Priorité Absolue Sanitaire</div>
                <div className="text-[11px] text-slate-400">Sanctuaire électrique aux réanimations d'hôpitaux et usines d'eau potable. Inondation acceptée des casiers rizicoles.</div>
              </button>

              <button
                onClick={() => setSimulatedConflictResolved('BALANCED_MICROGRID')}
                className="p-3 rounded-xl bg-slate-950 border border-emerald-800 hover:border-emerald-500 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-emerald-300">Option Bêta : Microréseau Hybride Optimisé</div>
                <div className="text-[11px] text-slate-400">Bascule des hôpitaux sur groupes électrogènes de secours (carburant garanti 72h) + 60% d'électricité dédiée au pompage agricole.</div>
              </button>
            </div>

            {simulatedConflictResolved && (
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-700 text-xs font-mono text-cyan-200 flex items-center justify-between">
                <span>
                  ARBITRAGE VALIDÉ PAR LE C2 : {simulatedConflictResolved === 'HEALTH_PRIORITY' ? 'Option Alpha adoptée (Priorité Vie Humaine)' : 'Option Bêta adoptée (Résilience Économique & Sanitaire Mixte)'}.
                </span>
                <span className="text-emerald-400 font-bold shrink-0 ml-2">CONFORME ORSEC</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dedicated Sectoral AI Agent (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-cyan-800/90 rounded-2xl p-6 shadow-2xl space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-900 border border-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
                  <Bot className="w-6 h-6 text-cyan-200" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                    AGENT IA SOUVERAIN DU PÔLE
                  </div>
                  <h4 className="text-base font-bold text-white font-sans">{currentSector.agent.name}</h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 font-bold">
                {currentSector.agent.callsign}
              </span>
            </div>

            {/* Agent Specialty & Model */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Nom de Code :</span>
                <span className="text-cyan-300 font-bold">{currentSector.agent.codename}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Doctrine de Référence :</span>
                <span className="text-slate-200 truncate max-w-[200px]" title={currentSector.agent.doctrineSource}>
                  {currentSector.agent.doctrineSource}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Moteur d'Inférence :</span>
                <span className="text-emerald-400 font-bold">Local LLM / Règle Déterministe</span>
              </div>
            </div>

            {/* Current Real-Time Assessment */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Évaluation de Situation en Direct</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                "{currentSector.agent.currentAssessment}"
              </p>
            </div>

            {/* Autonomous Capabilities */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                Capacités d'Analyse Autonome :
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {currentSector.agent.autonomousCapabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Directives with Cryptographic Approval */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 uppercase">
                <span>Directives Proposées par l'Agent IA</span>
                <span className="text-cyan-400 text-[10px]">{currentSector.agent.recommendedDirectives.length} Recommandations</span>
              </div>

              <div className="space-y-3">
                {currentSector.agent.recommendedDirectives.map(directive => {
                  const hash = approvedDirectiveHashes[directive.id];
                  const isApproved = Boolean(hash || directive.status === 'APPROVED');

                  return (
                    <div key={directive.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-300 font-bold">{directive.code}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          directive.priority === 'URGENT' ? 'bg-red-950 text-red-300 border border-red-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {directive.priority} · {directive.leadTimeHours}h
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white">{directive.title}</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{directive.description}</p>

                      <div className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded">
                        <span className="text-slate-500">Impact Intersectoriel : </span>
                        <span>{directive.intersectorImpact}</span>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        {isApproved ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-bold">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>APPROUVÉ & SCELLÉ SHA-256</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApproveDirective(directive)}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Valider & Sceller Ordre d'État</span>
                          </button>
                        )}

                        {hash && (
                          <span className="text-[9px] font-mono text-slate-500 truncate max-w-[130px]">
                            {hash.slice(0, 16)}...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
