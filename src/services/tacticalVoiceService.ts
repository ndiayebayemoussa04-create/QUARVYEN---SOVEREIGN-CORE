/**
 * QARVYEN 2.0 — Tactical Real-Time Voice Communication Service
 * Provides bidirectional voice interaction:
 * - Speech-to-Text (STT) for operator commands and tactical questions
 * - Text-to-Speech (TTS) for vocal briefings, crisis alerts and status reports
 */

export interface VoiceMessage {
  id: string;
  sender: 'operator' | 'qarvyen';
  text: string;
  timestamp: string;
  category?: 'telemetry' | 'hydro' | 'alert' | 'health' | 'general';
}

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

class TacticalVoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private onStateChangeCallbacks: Array<(state: VoiceState) => void> = [];
  private onTranscriptCallbacks: Array<(text: string, isFinal: boolean) => void> = [];
  private onMessageCallbacks: Array<(msg: VoiceMessage) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      // Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
        this.loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
          this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
      }

      // Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'fr-FR';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.notifyState('listening');
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          this.onTranscriptCallbacks.forEach((cb) => cb(currentText, !!finalTranscript));

          if (finalTranscript) {
            this.handleOperatorInput(finalTranscript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Voice Recognition Error:', event.error);
          this.isListening = false;
          this.notifyState('idle');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (!this.isSpeaking) {
            this.notifyState('idle');
          }
        };
      }
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    // Prioritize high-quality French voices
    const frVoice =
      voices.find((v) => v.lang.startsWith('fr') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))) ||
      voices.find((v) => v.lang.startsWith('fr')) ||
      voices[0];
    this.selectedVoice = frVoice || null;
  }

  public isVoiceSupported(): { stt: boolean; tts: boolean } {
    return {
      stt: typeof window !== 'undefined' && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition),
      tts: typeof window !== 'undefined' && 'speechSynthesis' in window,
    };
  }

  public startListening() {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn('Failed to start recognition:', err);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();
    this.isSpeaking = true;
    this.notifyState('speaking');

    // Clean markdown/asterisks before vocalizing
    const vocalText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/·/g, ', ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(vocalText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05; // Slightly decisive military cadence
    utterance.pitch = 0.95; // Crisp command tone

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notifyState('idle');
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.notifyState('idle');
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.isSpeaking = false;
    this.notifyState('idle');
  }

  public onStateChange(callback: (state: VoiceState) => void) {
    this.onStateChangeCallbacks.push(callback);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onTranscript(callback: (text: string, isFinal: boolean) => void) {
    this.onTranscriptCallbacks.push(callback);
    return () => {
      this.onTranscriptCallbacks = this.onTranscriptCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onMessage(callback: (msg: VoiceMessage) => void) {
    this.onMessageCallbacks.push(callback);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyState(state: VoiceState) {
    this.onStateChangeCallbacks.forEach((cb) => cb(state));
  }

  /**
   * Processes verbal command from operator and answers with tactical speech
   */
  public async handleOperatorInput(query: string): Promise<string> {
    const operatorMsg: VoiceMessage = {
      id: `op-${Date.now()}`,
      sender: 'operator',
      text: query,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    this.onMessageCallbacks.forEach((cb) => cb(operatorMsg));

    this.notifyState('thinking');

    // Generate responsive tactical intelligence
    const normalized = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let response = '';
    let category: VoiceMessage['category'] = 'general';

    if (normalized.includes('fleuve') || normalized.includes('senegal') || normalized.includes('crue') || normalized.includes('inondation')) {
      category = 'telemetry';
      response = `Situation opérationnelle sur la Vallée du Fleuve Sénégal : Le radar Sentinel-1 a détecté 148 kilomètres carrés sous les eaux entre Dagana et Podor. 42 300 personnes se trouvent en zone inondable. La crue est active avec une surcote majeure de 1 mètre 50.`;
    } else if (normalized.includes('barrage') || normalized.includes('manantali') || normalized.includes('omvs') || normalized.includes('debit')) {
      category = 'hydro';
      response = `Télémesure hydrologique OMVS : Le barrage de Manantali est à la cote d'alerte de 208,15 mètres avec un débit déversé de 1 650 mètres cubes par seconde. À Bakel, la cote mesurée est de 10,82 mètres, dépassant le seuil de danger. L'onde de crue transite actuellement vers Matam et Podor.`;
    } else if (normalized.includes('hopital') || normalized.includes('sante') || normalized.includes('centre de sante') || normalized.includes('podor')) {
      category = 'health';
      response = `Diagnostic sanitaire d'urgence : Le Centre de Santé de Podor et l'Hôpital de Dagana sont sous surveillance prioritaire. Deux dépôts de vaccins nécessitent des groupes électrogènes de secours pour préserver la chaîne du froid. Un plan d'évacuation préventif est recommandé pour le pavillon maternité.`;
    } else if (normalized.includes('alerte') || normalized.includes('sms') || normalized.includes('population') || normalized.includes('reseau')) {
      category = 'alert';
      response = `Système de diffusion de masse prêt : Le module d'alerte SMS et réseaux sociaux peut diffuser immédiatement un message de mise en sécurité vers les 42 300 résidents des zones inondables de Dagana et Podor. Voulez-vous ouvrir le centre de diffusion d'alertes ?`;
    } else if (normalized.includes('satellite') || normalized.includes('sentinel') || normalized.includes('radar') || normalized.includes('passage')) {
      category = 'telemetry';
      response = `Veille orbitale Copernicus : Le dernier passage radar Sentinel-1 date du 28 octobre à 19h10 UTC. La résolution est de 10 mètres en double polarisation VV et VH. La tâche de fond vérifie le catalogue toutes les 60 secondes.`;
    } else {
      category = 'general';
      response = `QARVYEN 2.0 à vos ordres. Données disponibles : imagerie radar Sentinel-1, niveaux des barrages OMVS, diagnostic des centres de santé et diffusion d'alerte SMS aux populations. Comment puis-je vous assister ?`;
    }

    const qarvyenMsg: VoiceMessage = {
      id: `qarv-${Date.now()}`,
      sender: 'qarvyen',
      text: response,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      category,
    };
    this.onMessageCallbacks.forEach((cb) => cb(qarvyenMsg));

    // Speak aloud in real time
    this.speak(response);

    return response;
  }
}

export const tacticalVoiceService = new TacticalVoiceService();
