/**
 * QARVYEN 2.0 — Hardware Acceleration & Real GPU Benchmark Modal
 * Priority 6: Detects CPU, AMD ROCm, NVIDIA CUDA, Apple Metal.
 * Executes genuine mathematical convolution & GEMM benchmarks to compute real GFLOPS.
 */

import React, { useState, useEffect } from 'react';
import {
  detectHardwareDevice,
  runRealHardwareBenchmark,
  HardwareDeviceInfo
} from '../../services/hardwareBenchmark';
import { BenchmarkMetrics, HardwareBackend } from '../../types/qarvyen';
import {
  Cpu,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  Layers,
  HardDrive
} from 'lucide-react';

interface HardwareBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBenchmarkCompleted?: (metrics: BenchmarkMetrics) => void;
}

export const HardwareBenchmarkModal: React.FC<HardwareBenchmarkModalProps> = ({
  isOpen,
  onClose,
  onBenchmarkCompleted,
}) => {
  const [deviceInfo, setDeviceInfo] = useState<HardwareDeviceInfo | null>(null);
  const [selectedBackend, setSelectedBackend] = useState<HardwareBackend>('CPU_MultiThread');
  const [matrixDim, setMatrixDim] = useState<number>(512);
  const [iterations, setIterations] = useState<number>(25);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [result, setResult] = useState<BenchmarkMetrics | null>(null);

  useEffect(() => {
    if (isOpen) {
      const info = detectHardwareDevice();
      setDeviceInfo(info);
      setSelectedBackend(info.detectedBackend);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    setResult(null);

    try {
      const metrics = await runRealHardwareBenchmark(selectedBackend, matrixDim, iterations);
      setResult(metrics);
      if (onBenchmarkCompleted) {
        onBenchmarkCompleted(metrics);
      }
    } catch (err) {
      console.error('Benchmark failed', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Benchmark Matériel & Détection GPU Souveraine
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Évaluation réelle du débit mathématique (GFLOPS & Convolution SAR 2D)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Detected Device Card */}
          {deviceInfo && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase font-mono text-[10px] font-bold">
                  DISPOSITIF DÉTECTÉ PAR LE NOYAU QARVYEN
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {deviceInfo.detectedBackend}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">RENDERER / ACCÉLÉRATEUR</span>
                  <span className="text-white font-semibold text-[11px] truncate block">{deviceInfo.renderer}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">FOURNISSEUR</span>
                  <span className="text-white font-semibold text-[11px]">{deviceInfo.vendor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">COEURS CPU PHYSIQUES ESTIMÉS</span>
                  <span className="text-amber-400 font-bold">{deviceInfo.coresEstimated} threads</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SUPPORT WEBGPU / TENSOR</span>
                  <span className={deviceInfo.supportsWebGpu ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {deviceInfo.supportsWebGpu ? 'Actif (WebGPU Compute)' : 'Fallback SIMD / WebGL'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Benchmark Configuration */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider font-mono text-[11px] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Configuration du Test de Charge Mathématique
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cible d'Accélération</label>
                <select
                  value={selectedBackend}
                  onChange={e => setSelectedBackend(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                >
                  <option value="CUDA">NVIDIA CUDA</option>
                  <option value="ROCm">AMD ROCm</option>
                  <option value="Apple_Metal">Apple Metal (M1/M2/M3/M4)</option>
                  <option value="CPU_MultiThread">CPU Multi-Thread</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Taille Tensor (Grille)</label>
                <select
                  value={matrixDim}
                  onChange={e => setMatrixDim(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                >
                  <option value="256">256 x 256 (65K cellules)</option>
                  <option value="512">512 x 512 (262K cellules)</option>
                  <option value="1024">1024 x 1024 (1M cellules)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Itérations de Filtre Lee</label>
                <select
                  value={iterations}
                  onChange={e => setIterations(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                >
                  <option value="10">10 passes</option>
                  <option value="25">25 passes (Standard)</option>
                  <option value="50">50 passes (Stress Test)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isBenchmarking
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-cyan-950/50'
            }`}
          >
            {isBenchmarking ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>Calcul en cours sur tenseurs réels...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Exécuter le Benchmark Réel ({iterations} itérations)</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div className="bg-slate-950 border border-emerald-800/80 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  BENCHMARK EFFECTUÉ AVEC SUCCÈS
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{result.timestamp.slice(11, 19)}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">DÉBIT RÉEL</span>
                  <span className="text-base font-bold text-cyan-300">{result.throughputGflops} GFLOPS</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BANDE PASSANTE</span>
                  <span className="text-base font-bold text-amber-300">{result.memoryBandwidthGbps} GB/s</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">TEMPS D'EXÉCUTION</span>
                  <span className="text-base font-bold text-white">{result.executionTimeMs} ms</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ITÉRATIONS</span>
                  <span className="text-base font-bold text-emerald-300">{result.iterations}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800 font-sans">
                {result.details}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
