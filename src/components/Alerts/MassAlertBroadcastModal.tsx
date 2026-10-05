/**
 * QARVYEN 2.0 — Multi-Channel Mass Alert Launch Center
 * Dispatches emergency alerts to populations via:
 * 1. SMS & Geofenced Cell Broadcast
 * 2. Social Media (X/Twitter, WhatsApp)
 * 3. Audio Megaphone & Local Radio Relays (Wolof, Pulaar, French)
 */

import React, { useState } from 'react';
import {
  Radio,
  Send,
  Smartphone,
  Share2,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldAlert,
  Copy,
  Check,
  Globe,
  MapPin,
  Lock,
  Layers,
  Sparkles,
  Users
} from 'lucide-react';
import {
  massAlertBroadcastService,
  type AlertChannel,
  type BroadcastLog,
} from '../../services/massAlertBroadcastService';
import { tacticalVoiceService } from '../../services/tacticalVoiceService';
import { UserProfile } from '../../types/qarvyen';

interface MassAlertBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const MassAlertBroadcastModal: React.FC<MassAlertBroadcastModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const template = massAlertBroadcastService.getTemplate();
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'wolof' | 'pulaar'>('fr');
  const [activeTab, setActiveTab] = useState<'sms' | 'social' | 'radio' | 'history'>('sms');
  const [selectedChannels, setSelectedChannels] = useState<AlertChannel[]>([
    'sms_cell_broadcast',
    'twitter_x',
    'whatsapp',
    'radio_audio',
  ]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [lastBroadcast, setLastBroadcast] = useState<BroadcastLog | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const currentLangData = template.languages[selectedLanguage];

  const handleToggleChannel = (channel: AlertChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePlayVoiceAlert = () => {
    if (isPlayingAudio) {
      tacticalVoiceService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      tacticalVoiceService.speak(currentLangData.radioScript, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleLaunchBroadcast = async () => {
    if (selectedChannels.length === 0) return;
    setIsBroadcasting(true);
    setBroadcastProgress(15);

    setTimeout(() => setBroadcastProgress(45), 500);
    setTimeout(() => setBroadcastProgress(80), 1100);

    setTimeout(async () => {
      const result = await massAlertBroadcastService.launchBroadcast({
        templateId: template.id,
        channels: selectedChannels,
        languages: [selectedLanguage, 'fr'],
        operatorRole: currentUser.role,
      });

      setBroadcastProgress(100);
      setLastBroadcast(result);
      setIsBroadcasting(false);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-950 to-slate-950 px-5 py-4 border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                  CENTRE DE DIFFUSION D'URGENCE
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Sénégal · Fleuve & Bassin OMVS
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-sans mt-0.5">
                Diffusion Multi-Canaux d'Alerte aux Populations (SMS & Réseaux Sociaux)
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              tacticalVoiceService.stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Population & Severity HUD Banner */}
        <div className="bg-slate-950 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zone : <strong className="text-white">{template.zone}</strong></span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Users className="w-3.5 h-3.5" />
              <span>Population ciblée : <strong className="text-white">42 300 habitants</strong></span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
              <span>NIVEAU : ÉVACUATION IMMÉDIATE</span>
            </div>
          </div>
        </div>

        {/* Channel & Language Bar */}
        <div className="bg-slate-900/80 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Channel selector checkboxes */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold mr-1">Canaux activés :</span>
            {[
              { id: 'sms_cell_broadcast', label: '📱 SMS & Cell Broadcast', icon: Smartphone },
              { id: 'twitter_x', label: '🐦 Réseau X (Twitter)', icon: Share2 },
              { id: 'whatsapp', label: '💬 WhatsApp Info-Crise', icon: Radio },
              { id: 'radio_audio', label: '📻 Radios & Voix FM', icon: Volume2 },
            ].map((ch) => {
              const active = selectedChannels.includes(ch.id as AlertChannel);
              return (
                <button
                  key={ch.id}
                  onClick={() => handleToggleChannel(ch.id as AlertChannel)}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                  {ch.label}
                </button>
              );
            })}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {[
              { id: 'fr', label: '🇫🇷 Français' },
              { id: 'wolof', label: '🇸🇳 Wolof' },
              { id: 'pulaar', label: '🇸🇳 Pulaar' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id as any)}
                className={`px-2.5 py-1 rounded transition-colors font-bold ${
                  selectedLanguage === lang.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation: Preview per channel */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 text-xs font-medium">
          {[
            { id: 'sms', label: 'Format SMS d\'Urgence (160 Car.)', count: `${currentLangData.smsText.length} car.` },
            { id: 'social', label: 'Dépêche Réseaux Sociaux (X & WhatsApp)' },
            { id: 'radio', label: 'Message Vocal & Radio Communautaire' },
            { id: 'history', label: 'Historique des Émissions Certifiées' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 font-mono transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/70">
          {/* TAB 1: SMS Cell Broadcast */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Aperçu de la notification SMS envoyée sur les téléphones mobiles de la zone :
                </span>
                <button
                  onClick={() => handleCopyText(currentLangData.smsText, 'sms')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  {copiedField === 'sms' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'sms' ? 'Copié' : 'Copier le texte'}
                </button>
              </div>

              {/* Realistic Mobile SMS Preview Mockup */}
              <div className="max-w-md mx-auto rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 shadow-xl font-sans">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                  <span className="font-bold text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    ALERTE CELLULAIRE D'URGENCE
                  </span>
                  <span>Opérateurs : Sonatel / Free</span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-100 leading-relaxed font-mono">
                  {currentLangData.smsText}
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex justify-between font-mono">
                  <span>Antennes relais : Dagana, Podor, Matam</span>
                  <span>Priorité : Haute (Broadcast 1)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Social Media (X / WhatsApp) */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Dépêche officielle prête pour publication sur Twitter / X & WhatsApp Info-Crise :
                </span>
                <button
                  onClick={() => handleCopyText(currentLangData.socialText, 'social')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  {copiedField === 'social' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'social' ? 'Copié' : 'Copier pour Réseaux'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs whitespace-pre-wrap text-slate-200 leading-relaxed shadow-inner">
                {currentLangData.socialText}
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentLangData.socialText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Publier sur X (Twitter)
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(currentLangData.socialText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Diffuser sur WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: Radio & Spoken Voice */}
          {activeTab === 'radio' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-300 uppercase font-mono flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    Script d'Alerte Vocale pour Radios FM et Mégaphones
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Destiné à être lu ou synthétisé sur la RTS Saint-Louis, Radio Podor FM, Radio Waalo et les véhicules équipés de haut-parleurs.
                  </p>
                </div>

                <button
                  onClick={handlePlayVoiceAlert}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  {isPlayingAudio ? 'Arrêter la Voix' : 'Écouter la Voix'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans italic">
                « {currentLangData.radioScript} »
              </div>
            </div>
          )}

          {/* TAB 4: History */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-mono mb-2">
                Registre cryptographique des alertes transmises aux populations :
              </div>
              {massAlertBroadcastService.getHistory().map((item) => (
                <div
                  key={item.broadcastId}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400 font-mono">{item.broadcastId}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-slate-300 font-mono text-[11px]">{item.zone}</div>
                  <div className="text-slate-500 text-[10px] flex gap-3 font-mono">
                    <span>Destinataires : {item.recipientsReached.toLocaleString()}</span>
                    <span>·</span>
                    <span>Canaux : {item.channels.join(', ')}</span>
                    <span>·</span>
                    <span>Date : {item.timestamp.replace('T', ' à ').slice(0, 16)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate pt-1 border-t border-slate-800/60">
                    Sceau SHA-256 : <span className="text-slate-400">{item.sha256Seal}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Safe Havens & Shelters Accordion */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-300 font-mono uppercase text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Points de Regroupement et Havres Sécurisés Intégrés dans l'Alerte :
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {template.safeHavens.map((sh, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="font-medium text-white">{sh.name}</div>
                  <div className="text-slate-400 text-[10px]">
                    Capacité : {sh.capacity} personnes · {sh.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer & Trigger Deck */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Opérateur : <strong>{currentUser.name}</strong> ({currentUser.role})</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                tacticalVoiceService.stopSpeaking();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Fermer
            </button>

            <button
              onClick={handleLaunchBroadcast}
              disabled={isBroadcasting || selectedChannels.length === 0}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isBroadcasting
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/50'
              }`}
            >
              {isBroadcasting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Diffusion en cours ({broadcastProgress}%)...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>DÉCLENCHER LA DIFFUSION NATIONALE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Modal Toast if broadcast completed */}
        {lastBroadcast && !isBroadcasting && (
          <div className="bg-emerald-950 border-t border-emerald-700 p-3 text-xs text-emerald-200 flex items-center justify-between px-5 font-mono animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Diffusion réussie : <strong>{lastBroadcast.recipientsReached.toLocaleString()}</strong> habitants alertés via {lastBroadcast.channels.length} canaux (Sceau : {lastBroadcast.sha256Seal.slice(0, 10)}...).
              </span>
            </div>
            <button
              onClick={() => setLastBroadcast(null)}
              className="text-emerald-400 hover:text-white underline text-[11px]"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
