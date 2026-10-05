/**
 * QARVYEN 2.0 — Sovereign Cryptographic Audit Ledger & Governance
 * Priority 7: Data provenance, cryptographic SHA-256 chain,
 * model parameters, cited RAG documents, and ISO/IEC 27001 verifiable audit export.
 */

import React, { useState } from 'react';
import { auditLedger } from '../../services/governanceAudit';
import { AuditLogEntry, UserProfile } from '../../types/qarvyen';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  AlertTriangle,
  Clock,
  User,
  Database,
  Search,
  Hash,
  Globe,
  Award,
  FileCheck
} from 'lucide-react';

interface AuditLogViewProps {
  currentUser: UserProfile;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ currentUser }) => {
  const [entries, setEntries] = useState<AuditLogEntry[]>(auditLedger.getEntries());
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [integrityStatus, setIntegrityStatus] = useState<'UNVERIFIED' | 'VALID' | 'CORRUPTED'>('UNVERIFIED');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(entries[entries.length - 1] || null);

  const filteredEntries = selectedSector === 'ALL'
    ? entries
    : entries.filter(e => e.sector === selectedSector);

  const handleVerifyIntegrity = async () => {
    const res = await auditLedger.verifyLedgerIntegrity();
    setIntegrityStatus(res.valid ? 'VALID' : 'CORRUPTED');
  };

  const handleDownloadLedger = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QARVYEN_AUDIT_LEDGER_SHA256_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase text-emerald-300 font-bold">
              REGISTRE D'AUDIT CRYPTOGRAPHIQUE SOUVERAIN
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Grand Livre des Décisions, Provenances & Signatures SHA-256
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Chaque inférence, requête satellitaire et réallocation hospitalière est scellée de manière immuable avec horodatage certifié et chaînage de hachage.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleVerifyIntegrity}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Vérifier l'Intégrité de la Chaîne
          </button>
          <button
            onClick={handleDownloadLedger}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exporter JSON
          </button>
        </div>
      </div>

      {/* Planetary Compliance Matrix & Sovereign Standards */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-200 uppercase tracking-wide block">
              Cadre de Conformité & Admissibilité des Preuves Planétaires :
            </span>
            <span className="text-[11px] text-slate-400">
              Traçabilité inviolable conforme aux standards internationaux de crise et d'arbitrage.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="px-2 py-1 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-bold">
            UN OCHA DATA GUIDELINES
          </span>
          <span className="px-2 py-1 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-bold">
            ISO/IEC 27001 & 22301
          </span>
          <span className="px-2 py-1 rounded bg-purple-950/70 border border-purple-800 text-purple-300 font-bold">
            RFC 3161 TIMESTAMP
          </span>
          <span className="px-2 py-1 rounded bg-blue-950/70 border border-blue-800 text-blue-300 font-bold">
            CONV. 108+ / RGPD ART. 9
          </span>
        </div>
      </div>

      {/* Sector Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase">Filtrer par Secteur Planétaire :</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `Tous (${entries.length})` },
            { id: 'flood', label: 'Inondation SAR' },
            { id: 'health', label: 'Santé & Pandémies' },
            { id: 'agents', label: 'Multi-Agents IA' },
            { id: 'rag', label: 'Doctrine RAG' },
            { id: 'governance', label: 'Gouvernance' },
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer font-medium ${
                selectedSector === sec.id
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Integrity Banner */}
      {integrityStatus !== 'UNVERIFIED' && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between font-mono text-xs ${
          integrityStatus === 'VALID'
            ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-300'
            : 'bg-red-950/50 border-red-500/80 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {integrityStatus === 'VALID' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>
              {integrityStatus === 'VALID'
                ? 'INTÉGRITÉ VÉRIFIÉE : Tous les blocs SHA-256 sont cohérents. Aucune altération détectée.'
                : 'ALERTE DE SÉCURITÉ : Rupture du chaînage de hachage détectée !'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{filteredEntries.length} Blocs Validés</span>
        </div>
      )}

      {/* Main Grid: Entries List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: List of Audit Blocks */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-300 uppercase">Blocs Scellés ({filteredEntries.length})</span>
            <span className="text-cyan-400">Ordre Chronologique</span>
          </div>

          <div className="p-2 space-y-2 max-h-[560px] overflow-y-auto">
            {filteredEntries.slice().reverse().map(entry => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedEntry?.id === entry.id
                    ? 'bg-cyan-950/50 border-cyan-500/80 ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="font-bold text-white truncate max-w-[170px]">{entry.action}</span>
                  <span className="text-emerald-400 font-bold">{entry.status}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-cyan-400/80 font-mono truncate mt-1">
                  SHA-256 : {entry.hashSha256.slice(0, 22)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Inspection of Selected Entry */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
          {selectedEntry ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
                    {selectedEntry.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{selectedEntry.action}</h3>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="text-slate-400">SECTEUR : <span className="text-white font-bold">{selectedEntry.sector.toUpperCase()}</span></div>
                  <div className="text-amber-400 text-[11px] mt-0.5">HABILITATION : {selectedEntry.clearance}</div>
                </div>
              </div>

              {/* Cryptographic Hashes */}
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
                  <Hash className="w-3.5 h-3.5" />
                  <span>SIGNATURE NUMÉRIQUE DU BLOC</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">HASH SHA-256 ACTUEL :</span>
                  <span className="text-emerald-400 font-semibold break-all text-[11px]">{selectedEntry.hashSha256}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CHAÎNAGE AVEC LE BLOC PRÉCÉDENT :</span>
                  <span className="text-slate-400 font-semibold break-all text-[11px]">{selectedEntry.previousHashSha256}</span>
                </div>
              </div>

              {/* Context & Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">OPÉRATEUR / AUTORITÉ</span>
                  <span className="text-white font-semibold">{selectedEntry.user}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Rôle RBAC : {selectedEntry.role}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">TEMPS & MOTEUR</span>
                  <span className="text-cyan-300 font-semibold">{selectedEntry.executionTimeMs} ms</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{selectedEntry.hardwareBackend}</span>
                </div>
              </div>

              {/* Parameters Payload */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase font-mono block mb-1.5">
                  Paramètres Opérationnels Enregistrés
                </span>
                <pre className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedEntry.parameters, null, 2)}
                </pre>
              </div>

              {/* Associated RAG & Satellite Provenance */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">DOCUMENTS RAG ASSOCIÉS</span>
                  {selectedEntry.ragDocsUsed.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                      {selectedEntry.ragDocsUsed.map((doc, idx) => (
                        <li key={idx} className="truncate">{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Aucun document doctrinal rattaché</span>
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">SCÈNES SENTINEL-1 COPERNICUS</span>
                  {selectedEntry.copernicusSceneIds.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                      {selectedEntry.copernicusSceneIds.map((sc, idx) => (
                        <li key={idx} className="truncate">{sc}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500 italic text-[11px]">Non applicable pour cette opération</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Sélectionnez un bloc d'audit dans la liste pour examiner son certificat d'intégrité.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
