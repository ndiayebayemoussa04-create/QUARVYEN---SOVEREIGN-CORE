/**
 * QARVYEN 2.0 — Tactical Voice Assistant Modal
 * Enables hands-free real-time verbal communication with the crisis platform:
 * - Speech-to-Text (STT) for questions on flood, OMVS dams, hospitals & satellites
 * - Text-to-Speech (TTS) for vocal response and automated briefings
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  Waves,
  Activity,
  Satellite,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { tacticalVoiceService, type VoiceMessage, type VoiceState } from '../../services/tacticalVoiceService';

interface TacticalVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAlertBroadcast?: () => void;
}

export const TacticalVoiceAssistantModal: React.FC<TacticalVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenAlertBroadcast,
}) => {
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'init-1',
      sender: 'qarvyen',
      text: 'Centre de commandement QARVYEN 2.0 à votre écoute. Parlez dans votre micro ou choisissez une interrogation tactique pour recevoir un point de situation vocal.',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
    },
  ]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState({ stt: true, tts: true });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVoiceSupported(tacticalVoiceService.isVoiceSupported());

    const unsubState = tacticalVoiceService.onStateChange((state) => {
      setVoiceState(state);
    });

    const unsubTranscript = tacticalVoiceService.onTranscript((text) => {
      setCurrentTranscript(text);
    });

    const unsubMessage = tacticalVoiceService.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
      setCurrentTranscript('');
    });

    return () => {
      unsubState();
      unsubTranscript();
      unsubMessage();
      tacticalVoiceService.stopListening();
      tacticalVoiceService.stopSpeaking();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  if (!isOpen) return null;

  const handleToggleMic = () => {
    if (voiceState === 'listening') {
      tacticalVoiceService.stopListening();
    } else {
      tacticalVoiceService.startListening();
    }
  };

  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    const query = textInput.trim();
    setTextInput('');
    await tacticalVoiceService.handleOperatorInput(query);
  };

  const handleQuickPrompt = async (prompt: string) => {
    await tacticalVoiceService.handleOperatorInput(prompt);
  };

  const handleReplayVoice = (text: string) => {
    if (!isVoiceMuted) {
      tacticalVoiceService.speak(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-md">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-sans">
                  Communication Vocale Tactique — QARVYEN Live
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                  voiceState === 'listening'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : voiceState === 'speaking'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {voiceState === 'listening' ? 'Écoute Active...' : voiceState === 'speaking' ? 'Vocalisation En Cours...' : voiceState === 'thinking' ? 'Analyse...' : 'Prêt'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Reconnaissance vocale temps réel & Synthèse de commandement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isVoiceMuted) {
                  setIsVoiceMuted(false);
                } else {
                  tacticalVoiceService.stopSpeaking();
                  setIsVoiceMuted(true);
                }
              }}
              className={`p-2 rounded-lg border transition-colors ${
                isVoiceMuted
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800 hover:bg-rose-950'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isVoiceMuted ? 'Activer la voix' : 'Couper le son de la voix'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                tacticalVoiceService.stopListening();
                tacticalVoiceService.stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/60 min-h-[260px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'operator' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${
                msg.sender === 'operator'
                  ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-800 text-amber-300 border-slate-700'
              }`}>
                {msg.sender === 'operator' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed border ${
                msg.sender === 'operator'
                  ? 'bg-cyan-950/70 border-cyan-700/60 text-cyan-100 rounded-tr-none'
                  : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}>
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1 font-mono">
                  <span>{msg.sender === 'operator' ? 'Opérateur de Crise' : 'QARVYEN Core Engine'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-line text-[12px]">{msg.text}</p>

                {msg.sender === 'qarvyen' && (
                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => handleReplayVoice(msg.text)}
                      className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      title="Réécouter ce briefing"
                    >
                      <Volume2 className="w-3 h-3" />
                      Réécouter
                    </button>

                    {msg.category === 'alert' && onOpenAlertBroadcast && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAlertBroadcast();
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold"
                      >
                        Ouvrir le Module d'Alerte SMS & Réseaux
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Current Live Transcription display while speaking */}
          {voiceState === 'listening' && (
            <div className="flex items-start gap-3 flex-row-reverse animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/50 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="max-w-[80%] rounded-xl p-3 text-xs bg-rose-950/40 border border-rose-800 text-rose-200 rounded-tr-none italic">
                {currentTranscript || 'Parlez maintenant, le système retranscrit en direct...'}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Tactical Prompt Chips */}
        <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
          <span className="text-slate-500 font-mono flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Suggestions vocales :
          </span>
          {[
            { label: '🌊 Situation Fleuve Sénégal', query: 'Quelle est la situation des inondations sur le fleuve Sénégal ?' },
            { label: '💧 Débit Manantali & OMVS', query: 'Quel est le débit actuel du barrage de Manantali ?' },
            { label: '🏥 Hôpitaux menacés Podor', query: 'Combien de centres de santé et hôpitaux sont menacés à Podor ?' },
            { label: '📢 Alerte SMS Populations', query: 'Préparer un message d\'alerte SMS pour les populations de la vallée' },
            { label: '🛰️ Dernier passage Sentinel-1', query: 'Quel est le dernier passage satellite Sentinel-1 disponible ?' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(item.query)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 text-slate-300 whitespace-nowrap transition-all shrink-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Interactive Voice Command & Input Deck */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col gap-3">
          {/* Audio Waveform & Big Mic Button */}
          <div className="flex items-center justify-center gap-4 py-1">
            {/* Visualizer bars */}
            <div className="flex items-center gap-1 h-6">
              {[40, 70, 90, 60, 100, 75, 45].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    voiceState === 'listening'
                      ? 'bg-rose-400 animate-pulse'
                      : voiceState === 'speaking'
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: voiceState === 'listening' || voiceState === 'speaking' ? `${h}%` : '20%',
                  }}
                />
              ))}
            </div>

            {/* Central Push-to-Talk Mic Button */}
            <button
              onClick={handleToggleMic}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                voiceState === 'listening'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50 ring-4 ring-rose-500/40 animate-pulse'
                  : 'bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-950/50'
              }`}
              title={voiceState === 'listening' ? 'Arrêter l\'écoute' : 'Activer le micro pour parler'}
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-6 h-6 animate-bounce" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            {/* Visualizer bars (right) */}
            <div className="flex items-center gap-1 h-6">
              {[45, 75, 100, 60, 90, 70, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    voiceState === 'listening'
                      ? 'bg-rose-400 animate-pulse'
                      : voiceState === 'speaking'
                      ? 'bg-cyan-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: voiceState === 'listening' || voiceState === 'speaking' ? `${h}%` : '20%',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 font-mono -mt-1">
            {voiceState === 'listening'
              ? '🎤 Micro ouvert — parlez naturellement en français'
              : 'Cliquez sur le micro pour parler ou tapez votre question ci-dessous'}
          </div>

          {/* Text Fallback Form */}
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ou saisissez un message tactique (ex: niveau du barrage Manantali)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
