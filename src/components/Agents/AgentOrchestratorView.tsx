/**
 * QARVYEN 2.0 — Multi-Agent AI Orchestration Dashboard
 * Real-time monitoring of the 6 specialized sovereign agents:
 * Data Agent, Knowledge Agent, Satellite Agent, Simulation Agent,
 * Governance Agent, and Orchestrator Agent.
 *
 * Visualizes the 6-stage lifecycle:
 * Retrieve -> Ground -> Analyze -> Simulate -> Explain -> Audit
 */

import React, { useState } from 'react';
import {
  AgentType,
  OrchestrationStep,
  AgentLogMessage,
  UserProfile,
} from '../../types/qarvyen';
import { STUDY_AREAS } from '../../services/copernicusService';
import { agentOrchestrator } from '../../services/agentOrchestrator';
import { MULTISECTORAL_SECTORS } from '../../services/multisectoralService';
import {
  Terminal,
  Database,
  BookOpen,
  Satellite,
  Activity,
  ShieldCheck,
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  Bot,
  Zap,
  Wheat,
  TrendingUp,
  MapPin,
  Radio,
  GraduationCap,
  Milestone,
  ShieldAlert
} from 'lucide-react';

interface AgentOrchestratorViewProps {
  currentUser: UserProfile;
}

export const AgentOrchestratorView: React.FC<AgentOrchestratorViewProps> = ({ currentUser }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string>(STUDY_AREAS[0].id);
  const [selectedFramework, setSelectedFramework] = useState<string>('ORSEC_NATIONAL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('FR');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentStepName, setCurrentStepName] = useState<string>('En attente');
  const [messages, setMessages] = useState<AgentLogMessage[]>([
    {
      id: 'init-msg-1',
      agent: 'orchestrator',
      step: 'retrieve',
      title: 'Système Multi-Agents Planétaire Initialisé',
      content: 'Les 6 agents souverains sont synchronisés dans l\'enclave locale.\nPrêts pour le déploiement sur n\'importe quel théâtre de crise du globe.',
      timestamp: new Date().toLocaleTimeString(),
      status: 'info',
    }
  ]);

  const stages: { key: OrchestrationStep; label: string; agent: AgentType; icon: any }[] = [
    { key: 'retrieve', label: '1. Retrieve', agent: 'data', icon: Database },
    { key: 'ground', label: '2. Ground', agent: 'knowledge', icon: BookOpen },
    { key: 'analyze', label: '3. Analyze', agent: 'satellite', icon: Satellite },
    { key: 'simulate', label: '4. Simulate', agent: 'simulation', icon: Activity },
    { key: 'explain', label: '5. Explain', agent: 'orchestrator', icon: Cpu },
    { key: 'audit', label: '6. Audit', agent: 'governance', icon: ShieldCheck },
  ];

  const currentArea = STUDY_AREAS.find(a => a.id === selectedAreaId) || STUDY_AREAS[0];

  const handleLaunchLifecycle = async () => {
    setIsRunning(true);
    setMessages([]);
    setCurrentStepIndex(1);

    try {
      await agentOrchestrator.executeMission(
        currentArea,
        0,
        1,
        {
          id: `scen-${currentArea.id}`,
          name: `Mission Opérationnelle — ${currentArea.name}`,
          description: `Déploiement sous cadre ${selectedFramework} en ${selectedLanguage}.`,
          waterLevelRiseM: 1.2,
          dikeBreach: true,
          rainfallMm24h: 85,
          upstreamDischargeM3s: 2150,
          timeStepHours: 3,
          totalDurationHours: 18,
        },
        currentUser,
        {
          onMessage: (msg) => {
            setMessages(prev => [...prev, msg]);
          },
          onProgress: (stepIdx, stepName) => {
            setCurrentStepIndex(stepIdx);
            setCurrentStepName(stepName);
          },
          onCompleted: () => {
            setIsRunning(false);
            setCurrentStepIndex(6);
            setCurrentStepName('Terminé avec succès');
          },
        }
      );
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  const getAgentColor = (agent: AgentType) => {
    switch (agent) {
      case 'data': return 'text-blue-400 border-blue-800 bg-blue-950/40';
      case 'knowledge': return 'text-sky-400 border-sky-800 bg-sky-950/40';
      case 'satellite': return 'text-cyan-400 border-cyan-800 bg-cyan-950/40';
      case 'simulation': return 'text-amber-400 border-amber-800 bg-amber-950/40';
      case 'orchestrator': return 'text-purple-400 border-purple-800 bg-purple-950/40';
      case 'governance': return 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
      case 'agent_defense': return 'text-rose-400 border-rose-800 bg-rose-950/40';
      case 'agent_energy': return 'text-amber-400 border-amber-800 bg-amber-950/40';
      case 'agent_agriculture': return 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
      case 'agent_livestock': return 'text-lime-400 border-lime-800 bg-lime-950/40';
      case 'agent_economy': return 'text-yellow-400 border-yellow-800 bg-yellow-950/40';
      case 'agent_territory': return 'text-indigo-400 border-indigo-800 bg-indigo-950/40';
      case 'agent_health': return 'text-red-400 border-red-800 bg-red-950/40';
      case 'agent_telecom': return 'text-sky-400 border-sky-800 bg-sky-950/40';
      case 'agent_education': return 'text-teal-400 border-teal-800 bg-teal-950/40';
      default: return 'text-slate-400 border-slate-800 bg-slate-950/40';
    }
  };

  const handleQuerySectoralAgent = (sector: typeof MULTISECTORAL_SECTORS[0]) => {
    const newMsg: AgentLogMessage = {
      id: `msg-sect-${Date.now()}`,
      agent: sector.agent.agentType,
      step: 'explain',
      title: `${sector.agent.name} [${sector.agent.callsign}] — Évaluation Sectorielle`,
      content: `• Autorité Tutélaire : ${sector.leadMinistry}\n• Doctrine Source : ${sector.agent.doctrineSource}\n• Évaluation Tactique en Direct :\n"${sector.agent.currentAssessment}"\n• Directive Prioritaire : ${sector.agent.recommendedDirectives[0]?.title || 'Veille active'}\n(Directives : ${sector.agent.recommendedDirectives[0]?.description || 'Surveillance continue des seuils'})`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'info',
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono uppercase text-purple-300 font-bold">
              ARCHITECTURE MULTI-AGENTS SOUVERAINE
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Pipeline Décisionnel Autonome & Déterministe
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Coordination séquentielle stricte : <strong>Retrieve → Ground → Analyze → Simulate → Explain → Audit</strong>. Chaque agent possède un périmètre d'action certifié.
          </p>
        </div>

        <button
          onClick={handleLaunchLifecycle}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
            isRunning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span>Étape {currentStepIndex}/6 en cours...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Déclencher le Cycle Multi-Agents</span>
            </>
          )}
        </button>
      </div>

      {/* Planetary Mission Configuration Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        {/* Theater */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase text-[11px]">Théâtre d'Opérations :</span>
          <select
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
            disabled={isRunning}
            className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {STUDY_AREAS.map(area => (
              <option key={area.id} value={area.id}>
                {area.name} ({area.country})
              </option>
            ))}
          </select>
        </div>

        {/* International Framework */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase text-[11px]">Doctrine / Mandat :</span>
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            disabled={isRunning}
            className="bg-slate-950 border border-slate-700 text-amber-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ORSEC_NATIONAL">Plan ORSEC / Sécurité Civile Nationale</option>
            <option value="UN_OCHA_INSARAG">Directives INSARAG / UN OCHA USAR</option>
            <option value="WHO_IHR_2005">Règlement Sanitaire International (OMS/RSI)</option>
            <option value="EU_UCPM">Protection Civile Européenne (UCPM/CEMS)</option>
            <option value="UNDRR_SENDAI">Cadre de Sendai 2015-2030 (EW4All)</option>
          </select>
        </div>

        {/* Language */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-bold uppercase text-[11px] mr-1">Langue :</span>
          {[
            { id: 'FR', label: '🇫🇷 FR' },
            { id: 'EN', label: '🇬🇧 EN' },
            { id: 'ES', label: '🇪🇸 ES' },
            { id: 'AR', label: '🇸🇦 AR' },
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              disabled={isRunning}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                selectedLanguage === lang.id
                  ? 'bg-purple-950 border border-purple-600 text-purple-300'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6-Stage Progress Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stages.map((st, idx) => {
          const isCurrent = currentStepIndex === idx + 1;
          const isPassed = currentStepIndex > idx + 1;
          const Icon = st.icon;

          return (
            <div
              key={st.key}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-purple-950/60 border-purple-500 shadow-lg ring-1 ring-purple-500/50'
                  : isPassed
                  ? 'bg-slate-900 border-emerald-800/80'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-purple-300' : isPassed ? 'text-emerald-400' : 'text-slate-400'}`} />
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                )}
              </div>
              <div className="text-xs font-bold text-white mt-2">{st.label}</div>
              <div className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">Agent : {st.agent}</div>
            </div>
          );
        })}
      </div>

      {/* 9 Sectoral Sovereign AI Agents Rack */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              9 Agents Sectoriels Spécialisés d'État (Pôles Régaliens)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Cliquez sur un agent pour solliciter son évaluation sectorielle immédiate
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {MULTISECTORAL_SECTORS.map(sec => (
            <button
              key={sec.id}
              onClick={() => handleQuerySectoralAgent(sec)}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 hover:bg-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between group"
              title={`${sec.agent.name} (${sec.title}) — Cliquez pour interroger`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-cyan-400 font-bold group-hover:text-cyan-300">{sec.code}</span>
                <span className="text-[9px] text-slate-500">{sec.agent.callsign}</span>
              </div>
              <div className="text-[11px] font-bold text-white truncate">{sec.shortName}</div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">{sec.agent.codename}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Activity Live Stream */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-200">
              Journal d'Exécution et Raisonnement des Agents
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">{messages.length} messages certifiés</span>
        </div>

        <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${getAgentColor(msg.agent)}`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-current/20">
                    {msg.agent.toUpperCase()} AGENT
                  </span>
                  <span className="text-slate-400">Étape [{msg.step.toUpperCase()}]</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white tracking-wide">{msg.title}</h4>

              <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                {msg.content}
              </div>

              {/* RAG Sources Cited */}
              {msg.ragSourcesCited && msg.ragSourcesCited.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                    Citations Doctrinales RAG Validées ({msg.ragSourcesCited.length}) :
                  </span>
                  {msg.ragSourcesCited.map((cite, i) => (
                    <div key={i} className="p-2 rounded bg-black/30 border border-slate-800 text-[11px] text-slate-300">
                      <div className="flex justify-between font-mono text-cyan-300 font-medium">
                        <span>{cite.documentTitle} (p.{cite.page || 1})</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Confiance: {cite.relevanceScore}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">"{cite.excerpt}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
