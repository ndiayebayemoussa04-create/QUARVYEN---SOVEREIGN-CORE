/**
 * QARVYEN 2.0 — Sovereign Intelligence for Complex Worlds
 * Multisectoral Command Platform
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  SectorType,
  FloodAnalysisResult,
  CriticalAsset,
  BenchmarkMetrics,
} from './types/qarvyen';
import { SOVEREIGN_USERS } from './services/governanceAudit';
import { detectHardwareDevice } from './services/hardwareBenchmark';
import { localLlm } from './services/localLlmService';
import { Header } from './components/Navigation/Header';
import { FloodWorkflowView } from './components/Workflows/FloodWorkflowView';
import { HealthWorkflowView } from './components/Workflows/HealthWorkflowView';
import { MultisectoralMatrixView } from './components/Workflows/MultisectoralMatrixView';
import { AgentOrchestratorView } from './components/Agents/AgentOrchestratorView';
import { RagDocumentManager } from './components/RAG/RagDocumentManager';
import { AuditLogView } from './components/Governance/AuditLogView';
import { HardwareBenchmarkModal } from './components/Hardware/HardwareBenchmarkModal';
import { HackathonGuideModal } from './components/Demo/HackathonGuideModal';
import { TacticalVoiceAssistantModal } from './components/Voice/TacticalVoiceAssistantModal';
import { MassAlertBroadcastModal } from './components/Alerts/MassAlertBroadcastModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(SOVEREIGN_USERS[0]);
  const [activeSector, setActiveSector] = useState<SectorType | 'agents' | 'rag' | 'audit'>('flood');
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isAlertBroadcastOpen, setIsAlertBroadcastOpen] = useState(false);
  const [hardwareName, setHardwareName] = useState('CPU Multi-Thread');
  const [isOllamaOnline, setIsOllamaOnline] = useState(false);
  const [latestFloodResult, setLatestFloodResult] = useState<FloodAnalysisResult | null>(null);

  useEffect(() => {
    // Detect hardware engine
    const info = detectHardwareDevice();
    setHardwareName(info.detectedBackend);

    // Check local Ollama health
    localLlm.checkOllamaHealth().then(online => {
      setIsOllamaOnline(online);
    });
  }, []);

  const handleBenchmarkCompleted = (metrics: BenchmarkMetrics) => {
    setHardwareName(`${metrics.backend} (${metrics.throughputGflops} GFLOPS)`);
  };

  const handleJumpToDemoStep = (_step: number, sectorTab: string) => {
    setActiveSector(sectorTab as any);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* 1. Header with RBAC & Classification */}
      <Header
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        activeSector={activeSector}
        onSelectSector={setActiveSector}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        onOpenAlertBroadcast={() => setIsAlertBroadcastOpen(true)}
        hardwareBackendName={hardwareName}
        isOllamaOnline={isOllamaOnline}
      />

      {/* 2. Main Multisectoral Workspace Views */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeSector === 'flood' && (
          <FloodWorkflowView
            currentUser={currentUser}
            onAnalysisDone={setLatestFloodResult}
            onSelectAssetForHealth={(asset: CriticalAsset) => {
              // Smooth transition to Health crisis module
              setActiveSector('health');
            }}
          />
        )}

        {activeSector === 'health' && (
          <HealthWorkflowView currentUser={currentUser} />
        )}

        {activeSector === 'multisectoral' && (
          <MultisectoralMatrixView
            currentUser={currentUser}
            onNavigateToModule={(tab) => setActiveSector(tab as any)}
          />
        )}

        {activeSector === 'agents' && (
          <AgentOrchestratorView currentUser={currentUser} />
        )}

        {activeSector === 'rag' && (
          <RagDocumentManager currentUser={currentUser} />
        )}

        {activeSector === 'audit' && (
          <AuditLogView currentUser={currentUser} />
        )}
      </main>

      {/* 3. Hardware & GPU Benchmark Modal */}
      <HardwareBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        onBenchmarkCompleted={handleBenchmarkCompleted}
      />

      {/* 4. 5-Minute Hackathon Demo Script Modal */}
      <HackathonGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onJumpToStep={handleJumpToDemoStep}
      />

      {/* 5. Real-Time Tactical Voice Assistant Modal */}
      <TacticalVoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        onOpenAlertBroadcast={() => setIsAlertBroadcastOpen(true)}
      />

      {/* 6. Multi-Channel Mass Alert Broadcast Modal */}
      <MassAlertBroadcastModal
        isOpen={isAlertBroadcastOpen}
        onClose={() => setIsAlertBroadcastOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
