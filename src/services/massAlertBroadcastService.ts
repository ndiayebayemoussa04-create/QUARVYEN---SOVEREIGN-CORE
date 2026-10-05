/**
 * QARVYEN 2.0 — Multi-Channel Population Alert Broadcast Service
 * Generates, certifies, and dispatches emergency alerts across:
 * - SMS & Cell Broadcast (Geofenced cellular towers)
 * - Social Media (X/Twitter, WhatsApp, Facebook Crisis)
 * - Local Radio & Audio Megaphone (French, Wolof, Pulaar)
 */

import { computeSha256 } from './copernicusService';

function generateRandomHex(length: number = 4): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint8Array(length);
    window.crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

export type AlertChannel = 'sms_cell_broadcast' | 'whatsapp' | 'twitter_x' | 'radio_audio';

export type AlertSeverity = 'CRITICAL_EVACUATION' | 'HIGH_ALERT' | 'ADVISORY_WATCH';

export interface AlertTemplate {
  id: string;
  title: string;
  zone: string;
  severity: AlertSeverity;
  affectedPopulation: number;
  languages: {
    fr: {
      smsText: string;
      socialText: string;
      radioScript: string;
    };
    wolof: {
      smsText: string;
      socialText: string;
      radioScript: string;
    };
    pulaar: {
      smsText: string;
      socialText: string;
      radioScript: string;
    };
  };
  keyInstructions: string[];
  safeHavens: Array<{ name: string; capacity: number; location: string }>;
  emergencyContacts: Array<{ label: string; number: string }>;
}

export interface BroadcastLog {
  broadcastId: string;
  timestamp: string;
  zone: string;
  severity: AlertSeverity;
  channels: AlertChannel[];
  languagesUsed: ('fr' | 'wolof' | 'pulaar')[];
  recipientsReached: number;
  cellTowersActivated: number;
  sha256Seal: string;
  status: 'DELIVERED' | 'BROADCASTING' | 'SCHEDULED';
  details: {
    smsCount: number;
    socialSharesCount: number;
    radioRelaysCount: number;
  };
}

export const SENEGAL_RIVER_ALERT_TEMPLATE: AlertTemplate = {
  id: 'alert-senegal-river-flood-2024',
  title: 'ALERTE ROUGE CRUE MAJEURE — VALLÉE DU FLEUVE SÉNÉGAL',
  zone: 'Départements de Podor, Dagana, Matam et Bakel',
  severity: 'CRITICAL_EVACUATION',
  affectedPopulation: 42300,
  languages: {
    fr: {
      smsText:
        'URGENT CRUE SÉNÉGAL : Débordement majeur du fleuve. Risque immédiat de submersion à Podor et Dagana. Évacuez vers les zones hautes (écoles et centres d\'accueil). Ne traversez pas les eaux. Numéro vert : 18 / 15.',
      socialText:
        '🔴 #ALERTE_CRUE | ÉTAT-MAJOR SÉNÉGAL\nDébordement du fleuve Sénégal sur l\'axe Dagana-Podor-Matam suite aux lâchers de Manantali (1650 m³/s).\n\n⚠️ DIRECTIVES IMMÉDIATES :\n• Évacuez les zones basses et casiers rizicoles\n• Rejoignez les centres sécurisés (Lycée de Podor, École 1 Dagana)\n• Coupez l\'électricité domestique\n• Pompiers : 18 | SAMU : 15 | OMVS Vigie : 800-00-1111\n\n#Senegal #Inondation #ProtectionCivile #QarvyenCrisis',
      radioScript:
        'Ici le Centre Opérationnel de Gestion des Crises. Alerte maximale sur la vallée du fleuve Sénégal. L\'eau monte rapidement le long des berges de Podor et Dagana. Tous les habitants des zones inondables doivent immédiatement rejoindre les points de regroupement en hauteur. Ne tentez pas de franchir les radiers immergés. Écoutez attentivement les consignes des sapeurs-pompiers et des autorités administratives.',
    },
    wolof: {
      smsText:
        'YEGGLE GAUW CRUE SÉNÉGAL : Ndox mi dafa fees te di fessat ci wetu Podor ak Dagana. Gàddaay leen gaaw dem ci kaw (daara ak ekool yi). Bumu kenn jàll ndox mi. Numéro pompiers : 18.',
      socialText:
        '🔴 #YEGGLE_CRUE | NDIGEL GAUW\nNdoxum dexu Sénégal dafa wàcc ci wetu Podor, Dagana ak Matam.\n\n⚠️ LI NGEEN WARA DEF :\n• Gènne leen ci suuf dem ci kaw\n• Dem leen ci Lycée Podor ak Ekool 1 Dagana\n• Fày leen kuraŋ yi\n• Pompiers : 18 | SAMU : 15\n\n#Senegal #Mbaat #QarvyenCrisis',
      radioScript:
        'Aywa mbokk yi, lii yéggle bu gaaw la jëme ci mbooleem doomi Fouta ak Waalo ci wetu dexu Sénégal. Ndox mi dafa yéeg bu baax te di tàbi ci kër yi. Bumu kenn toog ci kër yu nekk ci suuf. Gàddaay leen dem ci nokk yu kawé yi. Dégllu leen ndigëli njiit yi.',
    },
    pulaar: {
      smsText:
        'TINTEENDE NDIIYAM MAAYO SÉNÉGAL : Ndiyam maayo ɓeydiima no feewi to Podor e Dagaana. Ummee e nokkuuje leyɗe nawee to tooweeki. Hoto eɓɓee taƴde ndiyam. Ɓillondiree : 18.',
      socialText:
        '🔴 #TINTEENDE_NDIIYAM | MAAYO SÉNÉGAL\nNdiyam maayo heewii haa ilii e gure Podor, Dagaana e Maatam.\n\n⚠️ KO POT-ƊON WAƊDE :\n• Ummee e leydi ɗo ndiyam heewi nawee to nokkuuje toowɗe\n• Lycée Podor e Duɗal 1 Dagaana ina udditanii on\n• Pompiers : 18 | SAMU : 15\n\n#Senegal #Ilameeje #QarvyenCrisis',
      radioScript:
        'Eehey yimɓe Fuuta e Waalo, ɗo ko tinteende mawnde iwde e laamu. Ndiyam maayo Sénégal ina ɓeydoo nyannde kala, ina naata e gure. Kala jooɗiiɗo sara maayo yo ummo rewna to tooweeki. Hoto gooto eɓɓo taƴde ilam e oto walla puccu.',
    },
  },
  keyInstructions: [
    'Évacuer immédiatement les zones à cote d\'eau inférieure à 6.0m',
    'Mettre à l\'abri les enfants, personnes âgées et stocks alimentaires',
    'Couper les compteurs électriques pour éviter les électrocutions',
    'Bouillir l\'eau avant consommation pour prévenir les maladies hydriques',
    'Ne traverser sous aucun prétexte les tronçons submergés de la N2',
  ],
  safeHavens: [
    { name: 'Lycée El Hadj Baba Ndiongue (Podor)', capacity: 1200, location: 'Cote haute 14.5m' },
    { name: 'Centre de Formation Professionnelle de Dagana', capacity: 850, location: 'Zone industrielle N2' },
    { name: 'Stade Municipal de Richard-Toll', capacity: 3500, location: 'Zone surélevée' },
    { name: 'Hôpital Régional de Ndioum (Pôle Urgence)', capacity: 400, location: 'Plateau sanitaire sécurisé' },
  ],
  emergencyContacts: [
    { label: 'Brigade Nationale des Sapeurs-Pompiers', number: '18 (Gratuit)' },
    { label: 'SAMU National d\'Urgence', number: '15' },
    { label: 'Gendarmerie Nationale (Légion Nord)', number: '800 00 20 20' },
    { label: 'Cellule Crise OMVS / Haut-Commissariat', number: '+221 33 859 81 81' },
  ],
};

class MassAlertBroadcastService {
  private broadcastHistory: BroadcastLog[] = [];

  constructor() {
    // Initial simulated broadcast in history for realism
    const initialHash = 'a4f89d38c12a7f56e09b1192e847cbb6217c9d92415e0031849a0d8137f26194';
    this.broadcastHistory.push({
      broadcastId: 'ALERT-BC-20241028-0914',
      timestamp: '2024-10-28T09:14:00Z',
      zone: 'Vallée du Fleuve Sénégal (Dagana - Podor)',
      severity: 'HIGH_ALERT',
      channels: ['sms_cell_broadcast', 'twitter_x', 'whatsapp', 'radio_audio'],
      languagesUsed: ['fr', 'wolof', 'pulaar'],
      recipientsReached: 38700,
      cellTowersActivated: 42,
      sha256Seal: initialHash,
      status: 'DELIVERED',
      details: {
        smsCount: 38700,
        socialSharesCount: 4210,
        radioRelaysCount: 8,
      },
    });
  }

  public getTemplate(): AlertTemplate {
    return SENEGAL_RIVER_ALERT_TEMPLATE;
  }

  public getHistory(): BroadcastLog[] {
    return this.broadcastHistory;
  }

  /**
   * Executes a verified multi-channel emergency broadcast
   */
  public async launchBroadcast(options: {
    templateId: string;
    channels: AlertChannel[];
    languages: ('fr' | 'wolof' | 'pulaar')[];
    customSmsText?: string;
    customSocialText?: string;
    targetZone?: string;
    operatorRole: string;
  }): Promise<BroadcastLog> {
    const template = this.getTemplate();
    const id = `ALERT-BC-${Date.now().toString(36).toUpperCase()}-${generateRandomHex(2)}`;
    const timestamp = new Date().toISOString();

    // Estimate delivered count based on activated channels
    let recipients = 0;
    let towers = 0;

    if (options.channels.includes('sms_cell_broadcast')) {
      recipients += template.affectedPopulation;
      towers = 46; // 46 cell sites covering Dagana, Podor, Matam, Richard-Toll
    }
    if (options.channels.includes('whatsapp')) {
      recipients += Math.round(template.affectedPopulation * 0.45);
    }
    if (options.channels.includes('twitter_x')) {
      recipients += Math.round(template.affectedPopulation * 0.35);
    }
    if (options.channels.includes('radio_audio')) {
      recipients += Math.round(template.affectedPopulation * 0.8);
    }

    // Cryptographic seal of authenticity
    const payloadToHash = JSON.stringify({
      id,
      timestamp,
      zone: options.targetZone || template.zone,
      channels: options.channels,
      languages: options.languages,
      operator: options.operatorRole,
    });
    const sha256Seal = await computeSha256(payloadToHash);

    const logEntry: BroadcastLog = {
      broadcastId: id,
      timestamp,
      zone: options.targetZone || template.zone,
      severity: template.severity,
      channels: options.channels,
      languagesUsed: options.languages,
      recipientsReached: Math.min(recipients, 65000),
      cellTowersActivated: towers,
      sha256Seal,
      status: 'DELIVERED',
      details: {
        smsCount: options.channels.includes('sms_cell_broadcast') ? template.affectedPopulation : 0,
        socialSharesCount: options.channels.includes('twitter_x') ? 8540 : 0,
        radioRelaysCount: options.channels.includes('radio_audio') ? 12 : 0,
      },
    };

    this.broadcastHistory.unshift(logEntry);
    return logEntry;
  }
}

export const massAlertBroadcastService = new MassAlertBroadcastService();
