/**
 * QARVYEN 2.0 — 5-Minute Hackathon Demo Guide & Script
 * Step-by-step interactive workflow for judges & jury:
 * 1. Pitch QARVYEN Sovereign Intelligence
 * 2. Select Study Area (Vallée du Fleuve Sénégal)
 * 3. Search Sentinel-1 Scene (Copernicus CDSE)
 * 4. Select Before/After GRD IW Pair
 * 5. Launch SAR Analysis
 * 6. Display Inundation Map & Layers
 * 7. Show Hydrodynamic Simulation (+1.5m rise)
 * 8. Ask Multi-Agent Explanation
 * 9. Display Cited RAG Sources
 * 10. Inspect Cryptographic SHA-256 Audit
 * 11. Switch to Health Crisis Module
 * 12. Conclude on Sovereign Multi-Sectoral Core
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Satellite,
  Activity,
  Cpu,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface HackathonGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (stepNumber: number, sectorTab: string) => void;
}

export const HackathonGuideModal: React.FC<HackathonGuideModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Présenter QARVYEN 2.0',
      timing: '00:00 - 00:30',
      sector: 'flood',
      pitch: 'QARVYEN est une plateforme souveraine multisectorielle : données satellitaires réelles, RAG local, multi-agents IA déterministes, GPU et traçabilité inviolable.',
      actionLabel: 'Afficher la Vue Principale',
    },
    {
      step: 2,
      title: 'Sélectionner la zone opérationnelle',
      timing: '00:30 - 00:50',
      sector: 'flood',
      pitch: 'Choisir la Vallée du Fleuve Sénégal (Podor/Matam) ou Valencia DANA pour observer une crue majeure sur le terrain.',
      actionLabel: 'Ouvrir Sélecteur de Zone',
    },
    {
      step: 3,
      title: 'Rechercher les scènes Sentinel-1',
      timing: '00:50 - 01:15',
      sector: 'flood',
      pitch: 'Connexion aux données Sentinel-1 C-SAR IW GRD réelles via les spécifications Copernicus Data Space Ecosystem (CDSE).',
      actionLabel: 'Vérifier Métadonnées CDSE',
    },
    {
      step: 4,
      title: 'Sélectionner le couple Avant / Après',
      timing: '01:15 - 01:35',
      sector: 'flood',
      pitch: 'Paire pré-événement (20 sept 2024) vs pic de crue (18 oct 2024), orbite descendante #68, polarisation VV+VH.',
      actionLabel: 'Valider le Couple SAR',
    },
    {
      step: 5,
      title: 'Lancer l\'analyse SAR (Backscatter & Ratio)',
      timing: '01:35 - 02:00',
      sector: 'flood',
      pitch: 'Filtrage de speckle de Lee 5x5, calcul du différentiel en dB et exclusion topographique DEM 30m.',
      actionLabel: 'Exécuter le Traitement SAR',
    },
    {
      step: 6,
      title: 'Afficher la carte interactive d\'inondation',
      timing: '02:00 - 02:30',
      sector: 'flood',
      pitch: 'Carte Leaflet temps réel avec couches : nappe submergée, lit permanent, altitude, hôpitaux menacés et inspecteur pixel.',
      actionLabel: 'Explorer la Carte Interactive',
    },
    {
      step: 7,
      title: 'Montrer la simulation hydrodynamique',
      timing: '02:30 - 03:00',
      sector: 'flood',
      pitch: 'Déplacement du curseur temporel (T+0h à T+24h) : onde de crue, brèche de digue et submersion progressive.',
      actionLabel: 'Activer la Simulation T+12h',
    },
    {
      step: 8,
      title: 'Demander l\'explication à l\'Orchestrateur IA',
      timing: '03:00 - 03:30',
      sector: 'agents',
      pitch: 'Explication par le pipeline multi-agents (Ollama / Kernel souverain) structurée pour le commandement de crise.',
      actionLabel: 'Voir le Synthèse des Agents',
    },
    {
      step: 9,
      title: 'Afficher les sources RAG ancrées',
      timing: '03:30 - 04:00',
      sector: 'rag',
      pitch: 'Preuve d\'ancrage : Directive 2007/60/CE, guides ESA et plan ORSEC cités avec page et paragraphe exacts.',
      actionLabel: 'Consulter l\'Index RAG',
    },
    {
      step: 10,
      title: 'Vérifier l\'Audit Cryptographique SHA-256',
      timing: '04:00 - 04:20',
      sector: 'audit',
      pitch: 'Contrôle du grand livre inviolable : chaque paramètre, utilisateur et résultat possède une empreinte certifiée.',
      actionLabel: 'Vérifier la Chaîne d\'Audit',
    },
    {
      step: 11,
      title: 'Basculer vers le module Health',
      timing: '04:20 - 04:45',
      sector: 'health',
      pitch: 'Démontrer que le même Core traite la réallocation des lits d\'hôpitaux, l\'autonomie électrique et l\'afflux de blessés.',
      actionLabel: 'Basculer au Module Santé',
    },
    {
      step: 12,
      title: 'Montrer la polyvalence multisectorielle',
      timing: '04:45 - 05:00',
      sector: 'flood',
      pitch: 'QARVYEN est une plateforme souveraine extensible (Défense, Énergie, Agriculture, Territoire) prête pour la production.',
      actionLabel: 'Terminer la Démonstration',
    }
  ];

  const currentStepData = demoSteps[currentStep - 1];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Stopwatch */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Guide Démo Hackathon (5 Minutes Chrono)
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Parcours pas-à-pas optimisé pour convaincre le jury et valider les 9 priorités
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{formatTimer(elapsedSeconds)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-[10px] uppercase font-bold text-cyan-400 hover:text-cyan-300 ml-1 cursor-pointer"
              >
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Current Active Step Spotlight */}
        <div className="bg-amber-950/30 border-b border-amber-900/50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-300 font-bold">
              <span>ÉTAPE {currentStepData.step} / 12</span>
              <span>·</span>
              <span className="text-slate-400 font-normal">{currentStepData.timing}</span>
            </div>
            <span className="text-[11px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
              Vue : {currentStepData.sector.toUpperCase()}
            </span>
          </div>

          <h4 className="text-base font-bold text-white">{currentStepData.title}</h4>

          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-amber-300 block mb-1">PITCH JURY RECOMMANDÉ :</strong>
            "{currentStepData.pitch}"
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                onJumpToStep(currentStepData.step, currentStepData.sector);
                onClose();
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-amber-950/50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStepData.actionLabel}</span>
            </button>

            <div className="flex gap-2">
              <button
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={currentStep === 12}
                onClick={() => setCurrentStep(s => Math.min(12, s + 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Suivant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Navigation Checklist */}
        <div className="p-4 overflow-y-auto space-y-1.5 flex-1 text-xs">
          {demoSteps.map(st => (
            <div
              key={st.step}
              onClick={() => setCurrentStep(st.step)}
              className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                st.step === currentStep
                  ? 'bg-cyan-950/40 border-cyan-500/80 text-white'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                  st.step === currentStep ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {st.step}
                </span>
                <span className="font-medium text-xs text-white">{st.title}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{st.timing}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
