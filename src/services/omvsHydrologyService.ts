/**
 * QARVYEN 2.0 — OMVS Hydrological Coupling Service
 * Organisation pour la Mise en Valeur du fleuve Sénégal (OMVS)
 * Connects barrage metrics (Manantali, Diama, Gouina, Félou)
 * and limnimetric gauging stations (Bakel, Matam, Podor, Dagana)
 * to crisis hydrodynamic forecasting and SITREP intelligence.
 */

import { OmvsStation, OmvsBasinHydrology } from '../types/qarvyen';

export const OMVS_STATIONS: OmvsStation[] = [
  {
    id: 'omvs-manantali',
    name: 'Barrage Réservoir de Manantali',
    river: 'Bafing (Haut-Bassin)',
    type: 'dam',
    coordinates: [13.197, -10.432], // [lat, lon] Mali
    currentLevelM: 208.15,
    normalRetentionLevelM: 208.00,
    alertLevelM: 208.00,
    dangerLevelM: 208.50,
    inflowRateM3s: 1890,
    outflowRateM3s: 1650,
    spillwayGatesOpen: 'Évacuateur de crue ouvert (2 vannes à 45%)',
    trend: 'STABLE',
    trendRateM24h: 0.02,
    alertStatus: 'RED_DANGER',
    storageRatePercent: 96.9,
    lastUpdated: '2024-10-18T06:00:00Z',
    operationalNotes: 'Cote de sécurité atteinte. Lâchers graduels obligatoires pour préserver l\'intégrité de l\'ouvrage.',
  },
  {
    id: 'omvs-gouina',
    name: 'Ouvrage Hydroélectrique de Gouina',
    river: 'Sénégal',
    type: 'hydropower',
    coordinates: [14.015, -11.066], // Mali
    currentLevelM: 114.20,
    normalRetentionLevelM: 115.00,
    alertLevelM: 114.50,
    dangerLevelM: 116.00,
    inflowRateM3s: 1780,
    outflowRateM3s: 1780,
    spillwayGatesOpen: 'Au fil de l\'eau',
    trend: 'FALLING',
    trendRateM24h: -0.05,
    alertStatus: 'ORANGE_ALERT',
    storageRatePercent: 92.0,
    lastUpdated: '2024-10-18T06:00:00Z',
    operationalNotes: 'Transit direct des débits vers le bief aval.',
  },
  {
    id: 'omvs-felou',
    name: 'Centrale Hydroélectrique de Félou',
    river: 'Sénégal',
    type: 'hydropower',
    coordinates: [14.354, -11.353], // Mali
    currentLevelM: 88.40,
    normalRetentionLevelM: 88.00,
    alertLevelM: 88.50,
    dangerLevelM: 90.00,
    inflowRateM3s: 1810,
    outflowRateM3s: 1810,
    spillwayGatesOpen: 'Au fil de l\'eau',
    trend: 'FALLING',
    trendRateM24h: -0.04,
    alertStatus: 'ORANGE_ALERT',
    storageRatePercent: 90.5,
    lastUpdated: '2024-10-18T06:00:00Z',
    operationalNotes: 'Débit en décrue relative sur le haut-bassin.',
  },
  {
    id: 'omvs-bakel',
    name: 'Station Limnimétrique de Bakel (Référence)',
    river: 'Sénégal (Confluence Falémé)',
    type: 'gauge_station',
    coordinates: [14.898, -12.458], // Sénégal
    currentLevelM: 10.82,
    normalRetentionLevelM: 7.50,
    alertLevelM: 10.00,
    dangerLevelM: 11.00,
    inflowRateM3s: 2450,
    outflowRateM3s: 2450,
    trend: 'FALLING',
    trendRateM24h: -0.08,
    alertStatus: 'RED_DANGER',
    lastUpdated: '2024-10-18T07:00:00Z',
    operationalNotes: 'Cote d\'alerte 10.00 m dépassée. Pic historique de 11.45 m enregistré le 14 octobre. Amorçage lente décrue.',
  },
  {
    id: 'omvs-matam',
    name: 'Station Limnimétrique de Matam',
    river: 'Sénégal (Moyenne Vallée)',
    type: 'gauge_station',
    coordinates: [15.658, -13.254], // Sénégal
    currentLevelM: 8.74,
    normalRetentionLevelM: 6.00,
    alertLevelM: 8.00,
    dangerLevelM: 8.50,
    inflowRateM3s: 2180,
    outflowRateM3s: 2180,
    trend: 'RISING',
    trendRateM24h: 0.12,
    alertStatus: 'RED_DANGER',
    lastUpdated: '2024-10-18T07:00:00Z',
    operationalNotes: 'Seuil de débordement 8.00 m largement franchi. Onde de crue de Bakel en cours de propagation.',
  },
  {
    id: 'omvs-podor',
    name: 'Station Limnimétrique de Podor',
    river: 'Sénégal (Basse Vallée / Île à Morphil)',
    type: 'gauge_station',
    coordinates: [16.654, -14.962], // Sénégal
    currentLevelM: 5.48,
    normalRetentionLevelM: 3.80,
    alertLevelM: 5.00,
    dangerLevelM: 5.30,
    inflowRateM3s: 1650,
    outflowRateM3s: 1650,
    trend: 'RISING',
    trendRateM24h: 0.25,
    alertStatus: 'RED_DANGER',
    lastUpdated: '2024-10-18T07:00:00Z',
    operationalNotes: 'Cote critique franchie (5.48 m). Submersion des pistes communales et forte pression sur les digues SAED.',
  },
  {
    id: 'omvs-dagana',
    name: 'Station Limnimétrique de Dagana',
    river: 'Sénégal (Delta Aval)',
    type: 'gauge_station',
    coordinates: [16.518, -15.502], // Sénégal
    currentLevelM: 3.65,
    normalRetentionLevelM: 2.50,
    alertLevelM: 3.50,
    dangerLevelM: 3.80,
    inflowRateM3s: 1510,
    outflowRateM3s: 1510,
    trend: 'RISING',
    trendRateM24h: 0.10,
    alertStatus: 'ORANGE_ALERT',
    lastUpdated: '2024-10-18T07:00:00Z',
    operationalNotes: 'Entrée en phase de vigilance crue. Menace sur les stations de pompage de Richard-Toll.',
  },
  {
    id: 'omvs-diama',
    name: 'Barrage Régulateur Anti-Sel de Diama',
    river: 'Sénégal (Estuaire)',
    type: 'dam',
    coordinates: [16.216, -16.417], // Sénégal / Mauritanie
    currentLevelM: 1.75,
    normalRetentionLevelM: 1.50,
    alertLevelM: 2.15,
    dangerLevelM: 2.40,
    inflowRateM3s: 1420,
    outflowRateM3s: 1420,
    spillwayGatesOpen: '7 / 7 vannes ouvertes à 100%',
    trend: 'RISING',
    trendRateM24h: 0.08,
    alertStatus: 'YELLOW_VIGILANCE',
    storageRatePercent: 78.5,
    lastUpdated: '2024-10-18T07:30:00Z',
    operationalNotes: 'Toutes les vannes ouvertes pour évacuation maximale de l\'onde de crue vers l\'Océan Atlantique.',
  }
];

export class OmvsHydrologyService {
  /**
   * Return full basin hydrological picture
   */
  public getBasinHydrology(): OmvsBasinHydrology {
    const redCount = OMVS_STATIONS.filter(s => s.alertStatus === 'RED_DANGER').length;
    const orangeCount = OMVS_STATIONS.filter(s => s.alertStatus === 'ORANGE_ALERT').length;

    let globalAlertStatus: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' = 'GREEN';
    if (redCount > 0) globalAlertStatus = 'RED';
    else if (orangeCount > 0) globalAlertStatus = 'ORANGE';

    const manantali = OMVS_STATIONS.find(s => s.id === 'omvs-manantali');

    return {
      timestamp: new Date().toISOString(),
      globalAlertStatus,
      activeAlertCount: redCount + orangeCount,
      totalOutflowM3s: OMVS_STATIONS.reduce((acc, s) => acc + s.outflowRateM3s, 0),
      manantaliDischargeM3s: manantali ? manantali.outflowRateM3s : 1650,
      wavePropagationEstimateDays: {
        manantaliToBakel: 3.5, // 3 à 4 jours
        bakelToMatam: 2.0,     // 2 jours
        matamToPodor: 3.0,     // 3 jours
        podorToDiama: 2.5,     // 2 à 3 jours
      },
      stations: OMVS_STATIONS,
    };
  }

  /**
   * Retrieve station by identifier
   */
  public getStationById(id: string): OmvsStation | undefined {
    return OMVS_STATIONS.find(s => s.id === id);
  }

  /**
   * Evaluates hydrodynamic pressure for a given study area
   */
  public getHydrologicalPressureForArea(studyAreaId: string): {
    relevance: 'DIRECT_OMVS_INFLUENCE' | 'REGIONAL_WATERSHED' | 'NOT_APPLICABLE';
    governingStation?: OmvsStation;
    upstreamDischargeM3s: number;
    floodWaveTrend: string;
    actionableDirective: string;
  } {
    if (studyAreaId.includes('podor') || studyAreaId === 'senegal_river_valley') {
      const podor = this.getStationById('omvs-podor')!;
      return {
        relevance: 'DIRECT_OMVS_INFLUENCE',
        governingStation: podor,
        upstreamDischargeM3s: 1650,
        floodWaveTrend: 'Onde de crue active (+0.25 m/24h) en provenance de Matam',
        actionableDirective: 'Maintien de la vigilance maximale sur les digues de l\'Île à Morphil et Guédé.',
      };
    }

    if (studyAreaId.includes('matam')) {
      const matam = this.getStationById('omvs-matam')!;
      return {
        relevance: 'DIRECT_OMVS_INFLUENCE',
        governingStation: matam,
        upstreamDischargeM3s: 2180,
        floodWaveTrend: 'Pic de crue en cours (+0.12 m/24h), surcote fluviale majeure',
        actionableDirective: 'Évacuation des secteurs Soubalo et Diamel, renforcement merlons Matam.',
      };
    }

    if (studyAreaId.includes('bakel')) {
      const bakel = this.getStationById('omvs-bakel')!;
      return {
        relevance: 'DIRECT_OMVS_INFLUENCE',
        governingStation: bakel,
        upstreamDischargeM3s: 2450,
        floodWaveTrend: 'Début de décrue (-0.08 m/24h), maintien de fortes charges aval',
        actionableDirective: 'Surveillance des retours d\'eau et appuis sanitaires aux populations déplacées.',
      };
    }

    if (studyAreaId.includes('anambe')) {
      return {
        relevance: 'REGIONAL_WATERSHED',
        upstreamDischargeM3s: 480,
        floodWaveTrend: 'Bassin versant de la Kayanga saturé, déversement du barrage de retenue Anambé',
        actionableDirective: 'Maintien de l\'ouverture du déversoir de crue et arrêt des stations de pompage SODAGRI.',
      };
    }

    if (studyAreaId.includes('saloum')) {
      return {
        relevance: 'REGIONAL_WATERSHED',
        upstreamDischargeM3s: 620,
        floodWaveTrend: 'Interaction estuarienne : marée d\'équinoxe bloquant l\'écoulement fluvial du Sine-Saloum',
        actionableDirective: 'Vigilance submersion marine sur Foundiougne, Kaolack et polders salicoles.',
      };
    }

    return {
      relevance: 'NOT_APPLICABLE',
      upstreamDischargeM3s: 0,
      floodWaveTrend: 'Non rattaché au réseau hydrologique du fleuve Sénégal',
      actionableDirective: 'Suivi météorologique local standard.',
    };
  }
}

export const omvsHydrologyService = new OmvsHydrologyService();
