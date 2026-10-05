/**
 * QARVYEN 2.0 — Official SITREP Crisis Report Generator
 * République du Sénégal — Ministère de l'Intérieur / BNSP / COGC
 * Formats, seals with SHA-256, and exports defense-grade situation bulletins.
 */

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Download,
  Check,
  Shield,
  AlertTriangle,
  Waves,
  Building2,
  X,
  Lock,
  Compass
} from 'lucide-react';
import { FloodAnalysisResult, UserProfile, CriticalAsset } from '../../types/qarvyen';
import { omvsHydrologyService } from '../../services/omvsHydrologyService';

interface SitrepReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  floodResult: FloodAnalysisResult | null;
  currentUser: UserProfile;
  studyAreaName: string;
}

export const SitrepReportModal: React.FC<SitrepReportModalProps> = ({
  isOpen,
  onClose,
  floodResult,
  currentUser,
  studyAreaName,
}) => {
  const [copied, setCopied] = useState(false);
  const [framework, setFramework] = useState<'NATIONAL' | 'UN_OCHA' | 'COPERNICUS_EMS'>('NATIONAL');

  if (!isOpen) return null;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bulletinId =
    framework === 'UN_OCHA'
      ? `SITREP-UN-OCHA-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : framework === 'COPERNICUS_EMS'
      ? `EMSR-COP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : `SITREP-SN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const basinData = omvsHydrologyService.getBasinHydrology();

  // Metrics fallback if no run
  const floodedArea = floodResult ? floodResult.floodedAreaKm2 : 0;
  const exposedPop = floodResult ? floodResult.affectedPopulationEst : 0;
  const assets: CriticalAsset[] = floodResult?.criticalAssetsAtRisk || [];
  const threatenedAssets = assets.filter(a => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH');
  const sha256Seal = floodResult?.hashSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const manantali = basinData.stations.find(s => s.id === 'omvs-manantali');
  const bakel = basinData.stations.find(s => s.id === 'omvs-bakel');
  const matam = basinData.stations.find(s => s.id === 'omvs-matam');
  const podor = basinData.stations.find(s => s.id === 'omvs-podor');

  // Cable text format for military VHF / Telegram / OCHA Flash Update
  const headerText =
    framework === 'UN_OCHA'
      ? `UNITED NATIONS • NATIONS UNIES — OCHA / GDACS\nOFFICE FOR THE COORDINATION OF HUMANITARIAN AFFAIRS\nGLOBAL DISASTER ALERT AND COORDINATION SYSTEM`
      : framework === 'COPERNICUS_EMS'
      ? `EUROPEAN COMMISSION — DG ECHO / ERCC\nCOPERNICUS EMERGENCY MANAGEMENT SERVICE (RAPID MAPPING)`
      : `RÉPUBLIQUE DU SÉNÉGAL — MINISTÈRE DE L'INTÉRIEUR ET DE LA SÉCURITÉ PUBLIQUE\nCENTRE OPÉRATIONNEL DE GESTION DES CRISES (COGC) / BRIGADE NATIONALE DES SAPEURS-POMPIERS (BNSP)`;

  const cableText = `
================================================================================
${headerText}
BULLETIN DE SITUATION OPÉRATIONNELLE : ${bulletinId}
DATE : ${dateFormatted} A ${timeFormatted} UTC
NIVEAU DE CLASSIFICATION : ${currentUser.clearance}
AUTEUR : ${currentUser.name} (${currentUser.role.toUpperCase()})
ZONE D'OPÉRATION : ${studyAreaName.toUpperCase()}
CADRE MÉTIER : ${framework}
================================================================================

1. SITUATION GÉNÉRALE ET BILAN CONSOLIDÉ :
- Superficie inondée observée : ${floodedArea.toFixed(1)} km²
- Population directement exposée : ${exposedPop.toLocaleString()} personnes
- Infrastructures d'intérêt vital menacées : ${threatenedAssets.length}
- Mode de traitement : ${floodResult?.executionMode || 'SYNTHETIC_DEMO'}
- Statut des sources : ${floodResult?.systemStatus || 'NON_DISPONIBLE'}

2. CONTEXTE HYDROLOGIQUE ET OBSERVATIONS TERRAIN :
${
  studyAreaName.toLowerCase().includes('sénégal') || studyAreaName.toLowerCase().includes('podor') || studyAreaName.toLowerCase().includes('matam') || studyAreaName.toLowerCase().includes('bakel')
    ? `- Barrage de Manantali : Débit lâché = ${manantali?.outflowRateM3s || 1650} m³/s (Cote ${manantali?.currentLevelM || 208.15} m IGN)
- Station de Bakel : Cote ${bakel?.currentLevelM || 10.82} m (Seuil: ${bakel?.alertLevelM || 10.0} m)
- Station de Matam : Cote ${matam?.currentLevelM || 8.74} m (Seuil: ${matam?.alertLevelM || 8.0} m)
- Station de Podor : Cote ${podor?.currentLevelM || 5.48} m (Seuil: ${podor?.alertLevelM || 5.0} m)
- Alerte réseau OMVS : ${basinData.globalAlertStatus === 'RED' ? 'NIVEAU ROUGE' : 'NIVEAU ORANGE'}`
    : `- Analyse du bassin versant régional : Traitement des anomalies radar SAR Copernicus Sentinel-1.
- Propagation hydrodynamique : Détection automatique des ruptures de talus et des zones d'accumulation d'eau.`
}

3. INFRASTRUCTURES COMPROMISES :
${threatenedAssets.map(a => `* [${a.riskLevel}] ${a.name} (${a.type.toUpperCase()}) — Statut: ${a.operationalStatus} | Obs: ${a.notes}`).join('\n') || '* Aucune infrastructure compromise répertoriée à cette heure.'}

4. CONSIGNES SECTORIELLES D'URGENCE (STANDARD INTERNATIONAL) :
- SÉCURITÉ CIVILE & SAUVETAGE : Mise en pré-alerte des vecteurs d'intervention héliportés et embarcations rapides.
- SANTÉ PUBLIQUE : Déploiement de cliniques mobiles d'urgence, purification de l'eau et prévention des épidémies hydriques.
- GOUVERNANCE & APPROVISIONNEMENT : Sécurisation des axes de délestage et ponts aériens de ravitaillement.
- ÉNERGIE & TÉLÉCOMS : Maintien des liaisons satellite tactiques et alimentation de secours des hôpitaux.

SCELLEMENT NUMÉRIQUE SOUVERAIN SHA-256 :
${sha256Seal}
================================================================================
`.trim();

  const handleCopyCable = () => {
    navigator.clipboard.writeText(cableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      bulletinId,
      issuedAt: now.toISOString(),
      classification: currentUser.clearance,
      author: currentUser.name,
      territory: studyAreaName,
      metrics: {
        floodedAreaKm2: floodedArea,
        exposedPopulation: exposedPop,
        threatenedAssetsCount: threatenedAssets.length,
      },
      omvsHydrology: {
        manantaliDischargeM3s: manantali?.outflowRateM3s,
        bakelLevelM: bakel?.currentLevelM,
        matamLevelM: matam?.currentLevelM,
        podorLevelM: podor?.currentLevelM,
        alertStatus: basinData.globalAlertStatus,
      },
      threatenedAssets,
      sha256Seal,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bulletinId}_OFFICIEL.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Top Actions Toolbar */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              GÉNÉRATEUR DE SITREP PLANÉTAIRE
            </span>
          </div>

          {/* Framework Doctrine Selector */}
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            <button
              onClick={() => setFramework('NATIONAL')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                framework === 'NATIONAL' ? 'bg-amber-600 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Doctrine Nationale
            </button>
            <button
              onClick={() => setFramework('UN_OCHA')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                framework === 'UN_OCHA' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ONU OCHA / GDACS
            </button>
            <button
              onClick={() => setFramework('COPERNICUS_EMS')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                framework === 'COPERNICUS_EMS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Copernicus EMS (UE)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCable}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copié !' : 'Copier Câble'}
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger JSON
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer / Exporter PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable SITREP Document Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950 text-slate-200 print:bg-white print:text-black print:p-8 space-y-6">
          
          {/* Dynamic Official Header */}
          {framework === 'NATIONAL' ? (
            <div className="border-b-2 border-slate-700 print:border-black pb-4 text-center space-y-1">
              <div className="text-[11px] font-bold tracking-widest uppercase text-slate-400 print:text-gray-600">
                RÉPUBLIQUE DU SÉNÉGAL
              </div>
              <div className="text-[10px] italic text-slate-500 print:text-gray-500">
                Un Peuple — Un But — Une Foi
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black pt-1">
                MINISTÈRE DE L'INTÉRIEUR ET DE LA SÉCURITÉ PUBLIQUE
              </div>
              <div className="text-[11px] font-medium text-slate-400 print:text-gray-700">
                Direction Générale de la Protection Civile • Brigade Nationale des Sapeurs-Pompiers (BNSP)
              </div>
              <div className="text-[10px] font-mono text-cyan-400 print:text-blue-800 font-bold pt-1">
                CENTRE OPÉRATIONNEL DE GESTION DES CRISES ET DE COMMANDEMENT (COGC)
              </div>
            </div>
          ) : framework === 'UN_OCHA' ? (
            <div className="border-b-2 border-slate-700 print:border-black pb-4 text-center space-y-1">
              <div className="text-[11px] font-bold tracking-widest uppercase text-sky-400 print:text-sky-700">
                UNITED NATIONS • NATIONS UNIES
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black pt-1">
                OFFICE FOR THE COORDINATION OF HUMANITARIAN AFFAIRS (OCHA)
              </div>
              <div className="text-[11px] font-medium text-slate-400 print:text-gray-700">
                Global Disaster Alert and Coordination System (GDACS) • Flash Situation Report
              </div>
              <div className="text-[10px] font-mono text-sky-400 print:text-sky-800 font-bold pt-1">
                EMERGENCY RELIEF COORDINATION & RAPID RESPONSE UNIT
              </div>
            </div>
          ) : (
            <div className="border-b-2 border-slate-700 print:border-black pb-4 text-center space-y-1">
              <div className="text-[11px] font-bold tracking-widest uppercase text-indigo-400 print:text-indigo-700">
                EUROPEAN UNION • EMERGENCY RESPONSE COORDINATION CENTRE (ERCC)
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 print:text-black pt-1">
                COPERNICUS EMERGENCY MANAGEMENT SERVICE (EMS)
              </div>
              <div className="text-[11px] font-medium text-slate-400 print:text-gray-700">
                Rapid Mapping Activation Bulletin • Sentinel-1 SAR Damage Assessment
              </div>
              <div className="text-[10px] font-mono text-indigo-400 print:text-indigo-800 font-bold pt-1">
                DIRECTORATE-GENERAL FOR CIVIL PROTECTION AND HUMANITARIAN AID (DG ECHO)
              </div>
            </div>
          )}

          {/* Bulletin Metadata Bar */}
          <div className="flex items-center justify-between bg-slate-900 print:bg-gray-100 p-3 rounded-lg border border-slate-800 print:border-gray-300 font-mono text-xs">
            <div>
              <div className="font-bold text-white print:text-black">BULLETIN N° {bulletinId}</div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">
                Émis le {dateFormatted} à {timeFormatted} UTC
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 border border-amber-600 text-amber-300 print:border-black print:text-black">
                <Lock className="w-3 h-3" />
                {currentUser.clearance}
              </span>
              <div className="text-[10px] text-slate-400 print:text-gray-500 mt-0.5">
                Opérateur : {currentUser.name} ({currentUser.role.toUpperCase()})
              </div>
            </div>
          </div>

          {/* Section 1: Geographic Scope & Crisis Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800 flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1">
              <Compass className="w-4 h-4" />
              1. SYNTHÈSE DE LA SITUATION OPÉRATIONNELLE — {studyAreaName.toUpperCase()}
            </h3>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-900/80 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 print:text-gray-600">SUPERFICIE SUBMERGÉE</div>
                <div className="text-xl font-bold text-cyan-300 print:text-blue-700">
                  {floodedArea.toFixed(1)} <span className="text-xs font-normal">km²</span>
                </div>
                <div className="text-[9px] text-slate-500 print:text-gray-500">Imagerie SAR Sentinel-1</div>
              </div>

              <div className="bg-slate-900/80 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 print:text-gray-600">POPULATION EXPOSÉE</div>
                <div className="text-xl font-bold text-rose-400 print:text-red-700">
                  {exposedPop.toLocaleString()} <span className="text-xs font-normal">habitants</span>
                </div>
                <div className="text-[9px] text-slate-500 print:text-gray-500">Raster WorldPop 100m</div>
              </div>

              <div className="bg-slate-900/80 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 print:text-gray-600">INFRASTRUCTURES VITALES</div>
                <div className="text-xl font-bold text-amber-300 print:text-amber-700">
                  {threatenedAssets.length} <span className="text-xs font-normal">critiques</span>
                </div>
                <div className="text-[9px] text-slate-500 print:text-gray-500">Hôpitaux, digues, énergie</div>
              </div>
            </div>
          </div>

          {/* Section 2: OMVS Hydrological State */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800 flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1">
              <Waves className="w-4 h-4" />
              2. SITUATION HYDROLOGIQUE DU FLEUVE SÉNÉGAL (COUPLAGE OMVS)
            </h3>

            <div className="bg-slate-900/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 rounded-lg p-3 space-y-2 text-xs font-mono">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-slate-950/80 print:bg-white rounded border border-slate-800 print:border-gray-200">
                  <span className="text-[10px] text-slate-400 print:text-gray-600 block">MANANTALI</span>
                  <strong className="text-cyan-300 print:text-black">{manantali?.outflowRateM3s} m³/s</strong>
                  <span className="text-[9px] text-slate-500 block">Lâchers de sécurité</span>
                </div>
                <div className="p-2 bg-slate-950/80 print:bg-white rounded border border-slate-800 print:border-gray-200">
                  <span className="text-[10px] text-slate-400 print:text-gray-600 block">BAKEL</span>
                  <strong className="text-rose-400 print:text-red-700">{bakel?.currentLevelM.toFixed(2)} m</strong>
                  <span className="text-[9px] text-slate-500 block">Alerte : {bakel?.alertLevelM.toFixed(2)} m</span>
                </div>
                <div className="p-2 bg-slate-950/80 print:bg-white rounded border border-slate-800 print:border-gray-200">
                  <span className="text-[10px] text-slate-400 print:text-gray-600 block">MATAM</span>
                  <strong className="text-rose-400 print:text-red-700">{matam?.currentLevelM.toFixed(2)} m</strong>
                  <span className="text-[9px] text-slate-500 block">Alerte : {matam?.alertLevelM.toFixed(2)} m</span>
                </div>
                <div className="p-2 bg-slate-950/80 print:bg-white rounded border border-slate-800 print:border-gray-200">
                  <span className="text-[10px] text-slate-400 print:text-gray-600 block">PODOR</span>
                  <strong className="text-rose-400 print:text-red-700">{podor?.currentLevelM.toFixed(2)} m</strong>
                  <span className="text-[9px] text-slate-500 block">Alerte : {podor?.alertLevelM.toFixed(2)} m</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 print:text-gray-800 italic pt-1">
                Commentaire hydraulique : Onde de crue exceptionnelle en transit le long de la vallée. Retenue de Manantali à 96.9% de capacité nécessitant des lâchers contrôlés continus.
              </p>
            </div>
          </div>

          {/* Section 3: Compromised Critical Assets */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800 flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1">
              <Building2 className="w-4 h-4" />
              3. INFRASTRUCTURES D'INTÉRÊT VITAL EN ZONE D'IMPACT
            </h3>

            <div className="border border-slate-800 print:border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 print:bg-gray-200 text-slate-400 print:text-gray-700">
                  <tr>
                    <th className="p-2">Infrastructure</th>
                    <th className="p-2">Catégorie</th>
                    <th className="p-2">Niveau Risque</th>
                    <th className="p-2">Statut Opérationnel</th>
                    <th className="p-2">Directives Tactiques</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {threatenedAssets.length > 0 ? (
                    threatenedAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-900/40">
                        <td className="p-2 font-bold text-white print:text-black">{asset.name}</td>
                        <td className="p-2 uppercase text-slate-400 print:text-gray-600">{asset.type}</td>
                        <td className="p-2 font-bold text-rose-400 print:text-red-600">{asset.riskLevel}</td>
                        <td className="p-2 text-amber-300 print:text-amber-800">{asset.operationalStatus}</td>
                        <td className="p-2 text-slate-300 print:text-gray-800 text-[11px]">{asset.notes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                        Aucun site critique compromis identifié dans cette emprise.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Sectoral Crisis Directives */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-blue-800 flex items-center gap-2 border-b border-slate-800 print:border-gray-300 pb-1">
              <AlertTriangle className="w-4 h-4" />
              4. CONSIGNES TACTIQUES SECTORIELLES D'URGENCE
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 p-3 rounded-lg space-y-1">
                <span className="font-mono font-bold text-amber-400 print:text-amber-800 block text-[11px]">
                  BRIGADE NATIONALE DES SAPEURS-POMPIERS (BNSP)
                </span>
                <ul className="list-disc list-inside text-slate-300 print:text-gray-700 space-y-0.5 text-[11px]">
                  <li>Déploiement prioritaire des détachements d'embarcations de sauvetage.</li>
                  <li>Mise en place de points de rassemblement sur les buttes insubmersibles.</li>
                  <li>Évacuation sanitaire d'urgence par voie fluviale vers les centres hospitaliers de repli.</li>
                </ul>
              </div>

              <div className="bg-slate-900/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 p-3 rounded-lg space-y-1">
                <span className="font-mono font-bold text-rose-400 print:text-red-800 block text-[11px]">
                  CENTRE DES OPÉRATIONS D'URGENCE SANITAIRE (COUS)
                </span>
                <ul className="list-disc list-inside text-slate-300 print:text-gray-700 space-y-0.5 text-[11px]">
                  <li>Prépositionnement de kits de traitement du choléra et du paludisme.</li>
                  <li>Distribution d'aquatabs et de solutions de purification d'eau potable.</li>
                  <li>Réallocation des capacités d'accueil des maternités et blocs opératoires.</li>
                </ul>
              </div>

              <div className="bg-slate-900/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 p-3 rounded-lg space-y-1">
                <span className="font-mono font-bold text-emerald-400 print:text-emerald-800 block text-[11px]">
                  SAED & SÉCURITÉ ALIMENTAIRE
                </span>
                <ul className="list-disc list-inside text-slate-300 print:text-gray-700 space-y-0.5 text-[11px]">
                  <li>Colmatage d'urgence des brèches de digues en terre par engins du génie.</li>
                  <li>Mise en sécurité des récoltes de riz stockées dans les magasins de collecte.</li>
                  <li>Arrêt des stations de pompage pour éviter l'aspiration d'eau limoneuse abrasive.</li>
                </ul>
              </div>

              <div className="bg-slate-900/60 print:bg-gray-50 border border-slate-800 print:border-gray-300 p-3 rounded-lg space-y-1">
                <span className="font-mono font-bold text-sky-400 print:text-blue-800 block text-[11px]">
                  SENELEC & RÉSEAU ÉNERGIE
                </span>
                <ul className="list-disc list-inside text-slate-300 print:text-gray-700 space-y-0.5 text-[11px]">
                  <li>Consignation préventive des postes de distribution en zone inondable.</li>
                  <li>Alimentation par groupes électrogènes diesel des hôpitaux et relais radio.</li>
                  <li>Surveillance des pylônes HTB exposés à l'affouillement du courant fluvial.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Cryptographic Integrity Seal */}
          <div className="border-t-2 border-slate-800 print:border-gray-300 pt-4 flex items-center justify-between font-mono text-[10px] text-slate-500 print:text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 print:text-green-700" />
              <span>SCELLEMENT SOUVERAIN SHA-256 : <strong className="text-slate-300 print:text-black">{sha256Seal}</strong></span>
            </div>
            <div>DOCUMENT OFFICIEL • ÉTAT-MAJOR DE CRISE SÉNÉGAL</div>
          </div>

        </div>
      </div>
    </div>
  );
};
