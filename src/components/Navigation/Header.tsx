/**
 * QARVYEN 2.0 — Sovereign Header & Classification Banner
 * Enforces RBAC Role switching, Sovereign Enclave selector,
 * Hardware acceleration badge and sector navigation.
 */

import React from 'react';
import {
  UserProfile,
  UserRole,
  SecurityClearance,
  SectorType
} from '../../types/qarvyen';
import { SOVEREIGN_USERS, WORKSPACES } from '../../services/governanceAudit';
import {
  Shield,
  Cpu,
  Lock,
  Compass,
  FileText,
  Activity,
  Award,
  Users,
  Terminal,
  Layers,
  Sparkles,
  Mic,
  Megaphone
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  activeSector: SectorType | 'agents' | 'rag' | 'benchmark' | 'audit' | 'demo';
  onSelectSector: (sector: any) => void;
  onOpenBenchmark: () => void;
  onOpenDemoGuide: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenAlertBroadcast?: () => void;
  hardwareBackendName: string;
  isOllamaOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  activeSector,
  onSelectSector,
  onOpenBenchmark,
  onOpenDemoGuide,
  onOpenVoiceAssistant,
  onOpenAlertBroadcast,
  hardwareBackendName,
  isOllamaOnline,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100 flex flex-col shrink-0">
      {/* 1. Sovereign Security Classification Banner */}
      <div className="bg-amber-950/70 border-b border-amber-800/60 px-4 py-1 flex items-center justify-between text-[11px] font-mono tracking-wider">
        <div className="flex items-center gap-2 text-amber-300">
          <Lock className="w-3.5 h-3.5" />
          <span className="font-bold">NIVEAU D'HABILITATION : {currentUser.clearance}</span>
          <span className="text-amber-600">·</span>
          <span className="text-slate-300">ENCLAVE AIR-GAPPED ISOLÉE</span>
          <span className="text-amber-600">·</span>
          <span className="text-cyan-300 font-bold">🌍 COUVERTURE PLANÉTAIRE (5 CONTINENTS)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOllamaOnline ? 'bg-emerald-400' : 'bg-sky-400'}`} />
            LLM : {isOllamaOnline ? 'Ollama Local Actif' : 'Noyau Règle Déterministe'}
          </span>
          <span className="text-slate-600">·</span>
          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
          >
            <Cpu className="w-3 h-3" />
            Moteur : {hardwareBackendName}
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="px-5 py-3 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Shield className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">QARVYEN 2.0</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                SOVEREIGN CORE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 font-mono">
              Sovereign Intelligence for Complex Worlds
            </p>
          </div>
        </div>

        {/* Primary Sector Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => onSelectSector('flood')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSector === 'flood'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Inondation SAR (Sentinel-1)
          </button>

          <button
            onClick={() => onSelectSector('health')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSector === 'health'
                ? 'bg-rose-500 text-white shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Santé & Crise Hospitalière
          </button>

          <button
            onClick={() => onSelectSector('multisectoral')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSector === 'multisectoral'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Matrice Multisectorielle (9 Pôles)
          </button>

          <button
            onClick={() => onSelectSector('agents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSector === 'agents'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Multi-Agents IA
          </button>

          <button
            onClick={() => onSelectSector('rag')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSector === 'rag'
                ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Doctrine & RAG
          </button>

          <button
            onClick={() => onSelectSector('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSector === 'audit'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Audit SHA-256
          </button>
        </nav>

        {/* Right Action Tools: Language, Hackathon Demo Guide & RBAC Profile */}
        <div className="flex items-center gap-2.5">
          {/* Planetary Language Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono font-bold">
            <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              🇫🇷 FR
            </span>
            <span className="px-1.5 py-1 text-slate-500 hover:text-slate-300 cursor-pointer" title="English">
              EN
            </span>
            <span className="px-1.5 py-1 text-slate-500 hover:text-slate-300 cursor-pointer" title="Español">
              ES
            </span>
            <span className="px-1.5 py-1 text-slate-500 hover:text-slate-300 cursor-pointer" title="العربية">
              AR
            </span>
          </div>

          {/* Voice Assistant Button */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/80 shadow-sm transition-all cursor-pointer group"
              title="Ouvrir la commande vocale temps réel"
            >
              <div className="relative">
                <Mic className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <span>Voix QARVYEN</span>
            </button>
          )}

          {/* Mass Alert Broadcast Button */}
          {onOpenAlertBroadcast && (
            <button
              onClick={onOpenAlertBroadcast}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-950/40 transition-all cursor-pointer animate-pulse"
              title="Diffuser une alerte d'urgence aux populations (SMS, X, WhatsApp, Radios)"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alerte Populations (SMS/X)</span>
            </button>
          )}

          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Démo Hackathon (5 min)
          </button>

          {/* RBAC Profile Switcher */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Users className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-mono">
                RBAC : <span className="text-cyan-300 font-bold">{currentUser.role.toUpperCase()}</span>
              </div>
              <select
                value={currentUser.id}
                onChange={e => {
                  const found = SOVEREIGN_USERS.find(u => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {SOVEREIGN_USERS.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
