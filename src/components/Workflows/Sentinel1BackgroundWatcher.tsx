/**
 * QARVYEN 2.0 — Sentinel-1 Background Watcher & Real-Time Alert Notification
 * Periodically queries Copernicus CDSE for new radar scenes over the Senegal River Valley,
 * alerts operators in real-time, and enables immediate loading into the SAR flood pipeline.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Satellite,
  RefreshCw,
  Bell,
  CheckCircle,
  Radio,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  Zap,
  Shield,
  Layers,
  MapPin,
  X
} from 'lucide-react';

export interface Sentinel1SceneMeta {
  id: string;
  title: string;
  acquisitionDate: string;
  platform: string;
  instrument: string;
  mode: string;
  polarizations: string[];
  orbitDirection: 'ascending' | 'descending' | 'unknown';
  relativeOrbit?: number;
  bbox: [number, number, number, number];
  quicklookUrl?: string;
  detectedAt: string;
  isNew: boolean;
}

export interface WatcherStatusResponse {
  enabled: boolean;
  intervalSeconds: number;
  lastCheckTime: string | null;
  lastSceneDetected: Sentinel1SceneMeta | null;
  hasNewAlert: boolean;
  alertAcknowledged: boolean;
  totalScenesMonitored: number;
  studyAreaName: string;
  bbox: [number, number, number, number];
  backendEndpoint: string;
  recentScenes: Sentinel1SceneMeta[];
  logs: Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warn' | 'alert' }>;
}

interface Sentinel1BackgroundWatcherProps {
  onLoadNewScene?: (scene: Sentinel1SceneMeta) => void;
  currentAreaName?: string;
}

export const Sentinel1BackgroundWatcher: React.FC<Sentinel1BackgroundWatcherProps> = ({
  onLoadNewScene,
  currentAreaName = 'Vallée du Fleuve Sénégal',
}) => {
  const [watcherStatus, setWatcherStatus] = useState<WatcherStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [pollInterval, setPollInterval] = useState(60);
  const [isCheckingNow, setIsCheckingNow] = useState(false);
  const [secondsUntilNextCheck, setSecondsUntilNextCheck] = useState(60);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [alertDismissedLocal, setAlertDismissedLocal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch status from server
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/real/copernicus/sentinel1/watch');
      if (res.ok) {
        const data: WatcherStatusResponse = await res.json();
        setWatcherStatus(data);
        setIsPolling(data.enabled);
        setPollInterval(data.intervalSeconds);
      }
    } catch {
      // Backend temporarily unreachable, keep quiet
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Periodic polling & countdown
  useEffect(() => {
    if (!isPolling) return;

    // Reset countdown
    setSecondsUntilNextCheck(pollInterval);

    countdownRef.current = setInterval(() => {
      setSecondsUntilNextCheck((prev) => {
        if (prev <= 1) {
          fetchStatus();
          return pollInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isPolling, pollInterval, fetchStatus]);

  // Handle Manual check
  const handleCheckNow = async () => {
    setIsCheckingNow(true);
    try {
      const res = await fetch('/api/real/copernicus/sentinel1/watch/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setWatcherStatus(data.status);
        setSecondsUntilNextCheck(pollInterval);
      }
    } catch (err) {
      console.error('Erreur vérification live:', err);
    } finally {
      setIsCheckingNow(false);
    }
  };

  // Handle Toggle Polling
  const handleTogglePolling = async () => {
    const nextState = !isPolling;
    setIsPolling(nextState);
    try {
      const res = await fetch('/api/real/copernicus/sentinel1/watch/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState, intervalSeconds: pollInterval }),
      });
      if (res.ok) {
        const data = await res.json();
        setWatcherStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Change Interval
  const handleChangeInterval = async (newInterval: number) => {
    setPollInterval(newInterval);
    setSecondsUntilNextCheck(newInterval);
    try {
      const res = await fetch('/api/real/copernicus/sentinel1/watch/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: isPolling, intervalSeconds: newInterval }),
      });
      if (res.ok) {
        const data = await res.json();
        setWatcherStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Acknowledge Alert
  const handleAcknowledge = async () => {
    setAlertDismissedLocal(true);
    try {
      const res = await fetch('/api/real/copernicus/sentinel1/watch/ack', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWatcherStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Simulate New Scene (Test)
  const handleSimulateNewScene = async () => {
    setIsCheckingNow(true);
    setAlertDismissedLocal(false);
    try {
      const res = await fetch('/api/real/copernicus/sentinel1/watch/test-trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWatcherStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingNow(false);
    }
  };

  const hasActiveAlert = watcherStatus?.hasNewAlert && !alertDismissedLocal;
  const latestScene = watcherStatus?.lastSceneDetected;

  return (
    <div className="w-full mb-4 space-y-2">
      {/* ========================================================================= */}
      {/* 1. NOTIFICATION BANNER — NEW SENTINEL-1 SCENE DETECTED                    */}
      {/* ========================================================================= */}
      {hasActiveAlert && latestScene && (
        <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/70 bg-gradient-to-r from-amber-950/80 via-slate-900/90 to-amber-950/80 p-4 shadow-xl shadow-amber-950/40 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="relative mt-1">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
                  <Satellite className="w-5 h-5 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                    Nouvelle Image SAR Détectée
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {latestScene.acquisitionDate.replace('T', ' à ').replace('Z', ' UTC')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Zone : {currentAreaName}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mt-1">
                  Passage radar Sentinel-1 récent disponible sur la Vallée du Fleuve Sénégal
                </h4>

                <p className="text-xs text-slate-300 font-mono mt-0.5 line-clamp-1">
                  ID Produit : <span className="text-amber-200">{latestScene.id}</span>
                </p>

                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span>Polarisation : <strong className="text-slate-200">{latestScene.polarizations.join('+')}</strong></span>
                  <span>•</span>
                  <span>Orbite : <strong className="text-slate-200 capitalize">{latestScene.orbitDirection}</strong></span>
                  <span>•</span>
                  <span>Résolution : <strong className="text-slate-200">10 mètres</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {onLoadNewScene && (
                <button
                  onClick={() => {
                    onLoadNewScene(latestScene);
                    handleAcknowledge();
                  }}
                  className="flex-1 md:flex-none px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4" />
                  Charger dans l'Analyse
                </button>
              )}

              <button
                onClick={handleAcknowledge}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                title="Acquitter l'alerte"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Acquitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BACKGROUND WATCHER BAR & REAL-TIME TELEMETRY                           */}
      {/* ========================================================================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-md backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isPolling 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                <Radio className={`w-4 h-4 ${isPolling ? 'animate-pulse' : ''}`} />
              </div>
              {isPolling && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Tâche de Fond : Veille Orbitale Sentinel-1
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold border ${
                  isPolling
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isPolling ? 'Active' : 'En Pause'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <strong className="text-slate-300">Vallée du Fleuve Sénégal</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {isPolling ? (
                    <>Scan auto dans <strong className="text-cyan-300">{secondsUntilNextCheck}s</strong></>
                  ) : (
                    <span>Surveillance en pause</span>
                  )}
                </span>
                {watcherStatus?.totalScenesMonitored !== undefined && (
                  <>
                    <span>•</span>
                    <span className="font-mono">
                      <strong className="text-slate-300">{watcherStatus.totalScenesMonitored}</strong> scènes répertoriées
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleCheckNow}
              disabled={isCheckingNow}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 disabled:opacity-50 transition-all font-mono"
              title="Interroger immédiatement le catalogue Copernicus"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isCheckingNow ? 'animate-spin' : ''}`} />
              {isCheckingNow ? 'Vérification...' : 'Scanner CDSE'}
            </button>

            <button
              onClick={handleTogglePolling}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                isPolling
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
              }`}
            >
              {isPolling ? 'Suspendre' : 'Reprendre'}
            </button>

            <button
              onClick={handleSimulateNewScene}
              disabled={isCheckingNow}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1 transition-all"
              title="Simule une nouvelle acquisition satellite pour tester la notification"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simuler Orbite</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
              title="Afficher les détails de la veille"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. EXPANDABLE DETAILS & ARCHIVE LIST                                     */}
        {/* ======================================================================= */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs">
            {/* Settings row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Fréquence de vérification :</span>
                {[30, 60, 300].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => handleChangeInterval(interval)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                      pollInterval === interval
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {interval === 30 ? '30s' : interval === 60 ? '1 min' : '5 min'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono"
                >
                  {showLogs ? 'Masquer les logs système' : 'Voir les logs système'}
                </button>
              </div>
            </div>

            {/* System logs view */}
            {showLogs && watcherStatus?.logs && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
                <div className="text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Journal de la veille orbitale (CDSE Copernicus)
                </div>
                {watcherStatus.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="text-slate-500 text-[10px] shrink-0">
                      {log.timestamp.split('T')[1]?.split('.')[0] || log.timestamp}
                    </span>
                    <span className={`shrink-0 ${
                      log.type === 'alert' ? 'text-amber-400 font-bold' :
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'warn' ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="line-clamp-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Sentinel-1 acquisitions list */}
            {watcherStatus?.recentScenes && watcherStatus.recentScenes.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                    Dernières acquisitions Sentinel-1 sur le bassin du Fleuve Sénégal
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Source : Copernicus CDSE Open Access
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {watcherStatus.recentScenes.slice(0, 4).map((scene) => (
                    <div
                      key={scene.id}
                      className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-200 truncate">
                            {scene.title}
                          </span>
                          {scene.isNew && (
                            <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">
                              RÉCENT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {scene.id}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Orbite : {scene.orbitDirection} • Pol : {scene.polarizations.join('+')}
                        </div>
                      </div>

                      {onLoadNewScene && (
                        <button
                          onClick={() => onLoadNewScene(scene)}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] font-mono transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          Charger
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
