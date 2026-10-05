/**
 * QARVYEN 2.0 — Multisectoral Crisis Module: Health & Hospital Capacity Management
 * Models hospital network resilience, critical beds (ICU/Medicine), staffing,
 * emergency generator autonomy, patient influx and sovereign reallocation algorithms.
 * Note: Non-diagnostic tool; focuses strictly on operational capacity and logistics.
 */

import { HospitalNode, PatientReallocationPlan } from '../types/qarvyen';

export interface GlobalOutbreakCluster {
  id: string;
  pathogen: string;
  name: string;
  whoRegion: 'AFRO' | 'AMRO' | 'SEARO' | 'EURO' | 'EMRO' | 'WPRO';
  continent: string;
  affectedCountries: string[];
  activeCasesEstimated: number;
  reproductionRateR0: number;
  fatalityRatePercent: number;
  threatLevel: 'WATCH' | 'WARNING' | 'EMERGENCY' | 'PANDEMIC_RISK';
  transmissionVector: string;
  hospitalSurgeRisk: 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendedDirectives: string[];
  vaccineSupplyStatus: 'AVAILABLE' | 'CONSTRAINED' | 'CRITICAL_SHORTAGE';
}

export const HOSPITAL_REGIONS = [
  { id: 'senegal_river_valley', name: 'Vallée du Fleuve Sénégal', country: 'Sénégal', flag: '🇸🇳', continent: 'AFRICA' },
  { id: 'tchad_ndjamena', name: 'N\'Djamena / Bassin Chari-Logone', country: 'Tchad', flag: '🇹🇩', continent: 'AFRICA' },
  { id: 'mozambique_beira', name: 'Beira / Bassin Púnguè-Búzi', country: 'Mozambique', flag: '🇲🇿', continent: 'AFRICA' },
  { id: 'spain_valencia', name: 'Valence / Bassin du Turia', country: 'Espagne', flag: '🇪🇸', continent: 'EUROPE' },
  { id: 'france_rhin_meuse', name: 'Strasbourg / Bassin Rhin-Meuse', country: 'France / Allemagne', flag: '🇪🇺', continent: 'EUROPE' },
  { id: 'brazil_porto_alegre', name: 'Porto Alegre / Rio Grande do Sul', country: 'Brésil', flag: '🇧🇷', continent: 'AMERICAS' },
  { id: 'usa_mississippi', name: 'Nouvelle-Orléans / Delta Mississippi', country: 'États-Unis', flag: '🇺🇸', continent: 'AMERICAS' },
  { id: 'bangladesh_sylhet', name: 'District de Sylhet / Surma', country: 'Bangladesh', flag: '🇧🇩', continent: 'ASIA' },
  { id: 'pakistan_indus', name: 'Sindh / Bassin de l\'Indus', country: 'Pakistan', flag: '🇵🇰', continent: 'ASIA' },
];

export const GLOBAL_OUTBREAK_CLUSTERS: GlobalOutbreakCluster[] = [
  {
    id: 'outbreak-cholera-sahel',
    pathogen: 'Vibrio cholerae O1',
    name: 'Épidémie de Choléra Fluviale — Bassin du Sénégal & Niger',
    whoRegion: 'AFRO',
    continent: 'Afrique de l\'Ouest',
    affectedCountries: ['Sénégal', 'Mali', 'Mauritanie', 'Niger'],
    activeCasesEstimated: 14200,
    reproductionRateR0: 2.4,
    fatalityRatePercent: 2.8,
    threatLevel: 'EMERGENCY',
    transmissionVector: 'Eau potable contaminée par submersion des puits et rupture des stations de pompage.',
    hospitalSurgeRisk: 'CRITICAL',
    recommendedDirectives: [
      'Activation du protocole WASH Sphère : 15L d\'eau potable chlorée/habitant/jour.',
      'Mise en place immédiate de Centres de Traitement du Choléra (CTC) isolés à 50m des cours d\'eau.',
      'Déploiement du stock de réhydratation orale (SRO) et solutés Ringer Lactate.',
      'Vaccination réactive orale (VCO) en cordon sanitaire transfrontalier.'
    ],
    vaccineSupplyStatus: 'CONSTRAINED'
  },
  {
    id: 'outbreak-dengue-americas',
    pathogen: 'Virus de la Dengue (DENV-1 / DENV-2 / DENV-3)',
    name: 'Flambée Pandémique d\'Arbovirose — Amérique du Sud',
    whoRegion: 'AMRO',
    continent: 'Amérique du Sud',
    affectedCountries: ['Brésil', 'Argentine', 'Paraguay', 'Colombie'],
    activeCasesEstimated: 4500000,
    reproductionRateR0: 1.85,
    fatalityRatePercent: 0.12,
    threatLevel: 'PANDEMIC_RISK',
    transmissionVector: 'Prolifération du moustique Aedes aegypti dans les poches d\'eaux stagnantes post-crue.',
    hospitalSurgeRisk: 'CRITICAL',
    recommendedDirectives: [
      'Délestage des lits de médecine pour admission des formes de Dengue Sévère avec extravasation plasmatique.',
      'Surveillance hématologique continue des plaquettes (<50 000/mm³).',
      'Traitement larvicide massif par nébulisation et élimination des gîtes péri-domiciliaires.'
    ],
    vaccineSupplyStatus: 'CRITICAL_SHORTAGE'
  },
  {
    id: 'outbreak-leptospirosis-europe',
    pathogen: 'Leptospira interrogans',
    name: 'Leptospirose Post-Submersion — Bassin Méditerranéen & Valence',
    whoRegion: 'EURO',
    continent: 'Europe',
    affectedCountries: ['Espagne', 'Italie', 'Grèce'],
    activeCasesEstimated: 850,
    reproductionRateR0: 1.3,
    fatalityRatePercent: 5.4,
    threatLevel: 'WARNING',
    transmissionVector: 'Infiltration cutanée de bactéries issues des déjections de rongeurs diluées dans la boue et les limons.',
    hospitalSurgeRisk: 'HIGH',
    recommendedDirectives: [
      'Distribution obligatoire d\'Équipements de Protection Individuelle (bottes étanches, gants nitriles) aux équipes de déblaiement.',
      'Chimioprophylaxie par Doxycycline 200mg pour les personnels intervenant en zone de boues.',
      'Alerte précoce sur les ictères et insuffisances rénales aiguës (syndrome de Weil).'
    ],
    vaccineSupplyStatus: 'AVAILABLE'
  },
  {
    id: 'outbreak-malaria-asia',
    pathogen: 'Plasmodium falciparum & vivax',
    name: 'Pic d\'Hyper-Endémicité Palustre — Confluences Mousson',
    whoRegion: 'SEARO',
    continent: 'Asie du Sud',
    affectedCountries: ['Bangladesh', 'Inde', 'Pakistan'],
    activeCasesEstimated: 280000,
    reproductionRateR0: 1.95,
    fatalityRatePercent: 1.1,
    threatLevel: 'EMERGENCY',
    transmissionVector: 'Explosion des populations anophéliennes suite à la stagnation des eaux de mousson.',
    hospitalSurgeRisk: 'HIGH',
    recommendedDirectives: [
      'Distribution d\'urgence de Moustiquaires Imprégnées d\'Insecticide à Longue Durée d\'Action (MILDA).',
      'Pré-positionnement des combinaisons thérapeutiques à base d\'artémisinine (ACT).',
      'Test de diagnostic rapide (TDR) systématique pour tout syndrome fébrile aigu.'
    ],
    vaccineSupplyStatus: 'AVAILABLE'
  },
  {
    id: 'outbreak-marburg-congo',
    pathogen: 'Virus de Marburg (Filoviridae)',
    name: 'Cluster de Fièvre Hémorragique Virale — Bassin du Congo',
    whoRegion: 'AFRO',
    continent: 'Afrique Centrale',
    affectedCountries: ['RD Congo', 'Rwanda', 'Ouganda'],
    activeCasesEstimated: 95,
    reproductionRateR0: 1.5,
    fatalityRatePercent: 82.0,
    threatLevel: 'EMERGENCY',
    transmissionVector: 'Contact direct avec fluides corporels et chauves-souris frugivores (Rousettus aegyptiacus).',
    hospitalSurgeRisk: 'CRITICAL',
    recommendedDirectives: [
      'Activation du niveau d\'isolement BSL-4 / P4 et création de zones d\'étanchéité biologique négative.',
      'Suivi exhaustif des contacts sous 21 jours avec surveillance thermique bi-quotidienne.',
      'Mise en place de corridors funéraires sécurisés et dignes.'
    ],
    vaccineSupplyStatus: 'CRITICAL_SHORTAGE'
  }
];

export const GLOBAL_HOSPITAL_NETWORKS: Record<string, HospitalNode[]> = {
  senegal_river_valley: [
    {
      id: 'hosp-podor',
      name: 'Centre Hospitalier Régional de Podor (Zone Menacée)',
      location: [16.654, -14.962],
      totalBeds: 120,
      occupiedBeds: 108,
      icuBeds: 12,
      occupiedIcuBeds: 11,
      staffOnDuty: 42,
      ambulancesAvailable: 3,
      generatorAutonomyHours: 36,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 45,
    },
    {
      id: 'hosp-demette',
      name: 'Centre de Santé Rural de Démette (Rive Nord Fleuve)',
      location: [16.671, -14.950],
      totalBeds: 35,
      occupiedBeds: 32,
      icuBeds: 4,
      occupiedIcuBeds: 4,
      staffOnDuty: 14,
      ambulancesAvailable: 1,
      generatorAutonomyHours: 18,
      floodRisk: 'EVACUATING',
      assignedPatientsFromCrisis: 15,
    },
    {
      id: 'hosp-ndioum',
      name: 'Hôpital de District de Ndioum (Pivot Intérieur Hors d\'Eau)',
      location: [16.512, -14.654],
      totalBeds: 180,
      occupiedBeds: 122,
      icuBeds: 18,
      occupiedIcuBeds: 9,
      staffOnDuty: 68,
      ambulancesAvailable: 6,
      generatorAutonomyHours: 96,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 0,
    },
    {
      id: 'hosp-matam',
      name: 'Centre Hospitalier Régional de Ourossogui / Matam',
      location: [15.602, -13.321],
      totalBeds: 210,
      occupiedBeds: 145,
      icuBeds: 22,
      occupiedIcuBeds: 12,
      staffOnDuty: 85,
      ambulancesAvailable: 7,
      generatorAutonomyHours: 120,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 0,
    },
    {
      id: 'hosp-stlouis',
      name: 'Hôpital Régional de Saint-Louis (Base Arrière Zonale)',
      location: [16.032, -16.498],
      totalBeds: 320,
      occupiedBeds: 240,
      icuBeds: 36,
      occupiedIcuBeds: 20,
      staffOnDuty: 140,
      ambulancesAvailable: 12,
      generatorAutonomyHours: 144,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 0,
    }
  ],
  brazil_porto_alegre: [
    {
      id: 'hosp-poa-hcpa',
      name: 'Hospital de Clínicas de Porto Alegre (HCPA - Pivot Fédéral)',
      location: [-30.038, -51.206],
      totalBeds: 850,
      occupiedBeds: 720,
      icuBeds: 95,
      occupiedIcuBeds: 68,
      staffOnDuty: 350,
      ambulancesAvailable: 18,
      generatorAutonomyHours: 120,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 110,
    },
    {
      id: 'hosp-poa-hps',
      name: 'Hospital Municipal de Pronto Socorro (HPS - Zone Basse)',
      location: [-30.043, -51.214],
      totalBeds: 140,
      occupiedBeds: 135,
      icuBeds: 20,
      occupiedIcuBeds: 19,
      staffOnDuty: 65,
      ambulancesAvailable: 4,
      generatorAutonomyHours: 24,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 40,
    },
    {
      id: 'hosp-poa-vila-nova',
      name: 'Hospital Vila Nova (Zone Submergée Zone Sud)',
      location: [-30.125, -51.218],
      totalBeds: 220,
      occupiedBeds: 210,
      icuBeds: 15,
      occupiedIcuBeds: 15,
      staffOnDuty: 70,
      ambulancesAvailable: 2,
      generatorAutonomyHours: 14,
      floodRisk: 'EVACUATING',
      assignedPatientsFromCrisis: 85,
    },
    {
      id: 'hosp-poa-moinhos',
      name: 'Hospital Moinhos de Vento (Plateau Haute Altitude)',
      location: [-30.027, -51.201],
      totalBeds: 450,
      occupiedBeds: 340,
      icuBeds: 60,
      occupiedIcuBeds: 32,
      staffOnDuty: 210,
      ambulancesAvailable: 10,
      generatorAutonomyHours: 140,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 0,
    },
  ],
  bangladesh_sylhet: [
    {
      id: 'hosp-syl-osmani',
      name: 'Sylhet MAG Osmani Medical College (Centre National)',
      location: [24.899, 91.854],
      totalBeds: 900,
      occupiedBeds: 860,
      icuBeds: 40,
      occupiedIcuBeds: 38,
      staffOnDuty: 280,
      ambulancesAvailable: 8,
      generatorAutonomyHours: 32,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 140,
    },
    {
      id: 'hosp-syl-sunamganj',
      name: 'Sunamganj 250-Bed District Hospital (Isolé par les Eaux)',
      location: [25.068, 91.405],
      totalBeds: 250,
      occupiedBeds: 245,
      icuBeds: 10,
      occupiedIcuBeds: 10,
      staffOnDuty: 45,
      ambulancesAvailable: 1,
      generatorAutonomyHours: 12,
      floodRisk: 'EVACUATING',
      assignedPatientsFromCrisis: 60,
    },
    {
      id: 'hosp-syl-mount-adora',
      name: 'Mount Adora Hospital Akhalia (Hors d\'Eau)',
      location: [24.912, 91.838],
      totalBeds: 350,
      occupiedBeds: 210,
      icuBeds: 35,
      occupiedIcuBeds: 16,
      staffOnDuty: 130,
      ambulancesAvailable: 6,
      generatorAutonomyHours: 96,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 0,
    }
  ],
  tchad_ndjamena: [
    {
      id: 'hosp-tcd-hgrn',
      name: 'Hôpital Général de Référence Nationale (HGRN N\'Djamena)',
      location: [12.115, 15.042],
      totalBeds: 600,
      occupiedBeds: 480,
      icuBeds: 30,
      occupiedIcuBeds: 18,
      staffOnDuty: 190,
      ambulancesAvailable: 9,
      generatorAutonomyHours: 110,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 65,
    },
    {
      id: 'hosp-tcd-walia',
      name: 'Hôpital de District de Walia (9ème Arrondissement Inondé)',
      location: [12.078, 15.071],
      totalBeds: 120,
      occupiedBeds: 115,
      icuBeds: 8,
      occupiedIcuBeds: 8,
      staffOnDuty: 35,
      ambulancesAvailable: 2,
      generatorAutonomyHours: 16,
      floodRisk: 'EVACUATING',
      assignedPatientsFromCrisis: 45,
    },
    {
      id: 'hosp-tcd-kousseri',
      name: 'Hôpital Régional Annexe de Kousseri (Rive Logone)',
      location: [12.085, 15.034],
      totalBeds: 180,
      occupiedBeds: 160,
      icuBeds: 12,
      occupiedIcuBeds: 10,
      staffOnDuty: 55,
      ambulancesAvailable: 3,
      generatorAutonomyHours: 28,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 30,
    }
  ],
  spain_valencia: [
    {
      id: 'hosp-es-lafe',
      name: 'Hospital Universitari i Politècnic La Fe (Pôle Métropolitain)',
      location: [39.444, -0.376],
      totalBeds: 1000,
      occupiedBeds: 810,
      icuBeds: 110,
      occupiedIcuBeds: 72,
      staffOnDuty: 480,
      ambulancesAvailable: 24,
      generatorAutonomyHours: 160,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 95,
    },
    {
      id: 'hosp-es-general',
      name: 'Hospital General Universitari de València',
      location: [39.467, -0.404],
      totalBeds: 480,
      occupiedBeds: 420,
      icuBeds: 45,
      occupiedIcuBeds: 38,
      staffOnDuty: 190,
      ambulancesAvailable: 12,
      generatorAutonomyHours: 72,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 40,
    },
    {
      id: 'hosp-es-peset',
      name: 'Hospital Universitari Doctor Peset (Corridor Sud Ravin Poio)',
      location: [39.453, -0.395],
      totalBeds: 360,
      occupiedBeds: 340,
      icuBeds: 30,
      occupiedIcuBeds: 28,
      staffOnDuty: 120,
      ambulancesAvailable: 6,
      generatorAutonomyHours: 36,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 50,
    }
  ],
  france_rhin_meuse: [
    {
      id: 'hosp-fr-strasbourg',
      name: 'Hôpitaux Universitaires de Strasbourg (Nouvel Hôpital Civil - Pivot)',
      location: [48.575, 7.736],
      totalBeds: 1100,
      occupiedBeds: 890,
      icuBeds: 120,
      occupiedIcuBeds: 82,
      staffOnDuty: 510,
      ambulancesAvailable: 28,
      generatorAutonomyHours: 192,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 60,
    },
    {
      id: 'hosp-fr-colmar',
      name: 'Hôpitaux Civils de Colmar (Pasteur)',
      location: [48.083, 7.348],
      totalBeds: 620,
      occupiedBeds: 540,
      icuBeds: 45,
      occupiedIcuBeds: 38,
      staffOnDuty: 220,
      ambulancesAvailable: 14,
      generatorAutonomyHours: 96,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 35,
    },
    {
      id: 'hosp-fr-mulhouse',
      name: 'Centre Hospitalier Émile Muller (Mulhouse)',
      location: [47.738, 7.319],
      totalBeds: 750,
      occupiedBeds: 680,
      icuBeds: 55,
      occupiedIcuBeds: 49,
      staffOnDuty: 290,
      ambulancesAvailable: 16,
      generatorAutonomyHours: 84,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 45,
    }
  ],
  mozambique_beira: [
    {
      id: 'hosp-moz-beira-central',
      name: 'Hospital Central da Beira (Pivot Provincial Sofala)',
      location: [-19.825, 34.845],
      totalBeds: 500,
      occupiedBeds: 470,
      icuBeds: 16,
      occupiedIcuBeds: 15,
      staffOnDuty: 140,
      ambulancesAvailable: 3,
      generatorAutonomyHours: 24,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 80,
    },
    {
      id: 'hosp-moz-dondo',
      name: 'Hospital Distrital de Dondo (Zone Fluviale Púnguè)',
      location: [-19.608, 34.743],
      totalBeds: 140,
      occupiedBeds: 135,
      icuBeds: 6,
      occupiedIcuBeds: 6,
      staffOnDuty: 35,
      ambulancesAvailable: 1,
      generatorAutonomyHours: 12,
      floodRisk: 'EVACUATING',
      assignedPatientsFromCrisis: 40,
    }
  ],
  usa_mississippi: [
    {
      id: 'hosp-usa-ochsner',
      name: 'Ochsner Medical Center (New Orleans Central Pivot)',
      location: [29.966, -90.147],
      totalBeds: 780,
      occupiedBeds: 650,
      icuBeds: 85,
      occupiedIcuBeds: 58,
      staffOnDuty: 380,
      ambulancesAvailable: 22,
      generatorAutonomyHours: 144,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 70,
    },
    {
      id: 'hosp-usa-umc',
      name: 'University Medical Center New Orleans (Trauma Center 1)',
      location: [29.957, -90.082],
      totalBeds: 440,
      occupiedBeds: 395,
      icuBeds: 60,
      occupiedIcuBeds: 48,
      staffOnDuty: 240,
      ambulancesAvailable: 18,
      generatorAutonomyHours: 120,
      floodRisk: 'SAFE',
      assignedPatientsFromCrisis: 50,
    }
  ],
  pakistan_indus: [
    {
      id: 'hosp-pak-sukkur',
      name: 'Civil Hospital Sukkur (Barrage de Sukkur / Sindh)',
      location: [27.705, 68.857],
      totalBeds: 450,
      occupiedBeds: 435,
      icuBeds: 20,
      occupiedIcuBeds: 19,
      staffOnDuty: 110,
      ambulancesAvailable: 4,
      generatorAutonomyHours: 20,
      floodRisk: 'ALERT',
      assignedPatientsFromCrisis: 90,
    },
    {
      id: 'hosp-pak-larkana',
      name: 'Chandka Medical College Hospital (Larkana)',
      location: [27.558, 68.204],
      totalBeds: 600,
      occupiedBeds: 580,
      icuBeds: 25,
      occupiedIcuBeds: 24,
      staffOnDuty: 160,
      ambulancesAvailable: 5,
      generatorAutonomyHours: 18,
      floodRisk: 'EVACUATING',
      assignedPatientsFromCrisis: 110,
    }
  ]
};

export const INITIAL_HOSPITALS: HospitalNode[] = GLOBAL_HOSPITAL_NETWORKS.senegal_river_valley;

export function getHospitalsForNetwork(networkId: string): HospitalNode[] {
  return GLOBAL_HOSPITAL_NETWORKS[networkId] || GLOBAL_HOSPITAL_NETWORKS.senegal_river_valley;
}

export interface HospitalNetworkSummary {
  totalCapacity: number;
  totalOccupied: number;
  occupancyRatePercent: number;
  totalIcuCapacity: number;
  totalIcuOccupied: number;
  icuOccupancyRatePercent: number;
  criticalHospitalsCount: number;
  totalAmbulancesReady: number;
}

export function computeHospitalNetworkSummary(hospitals: HospitalNode[]): HospitalNetworkSummary {
  let totalBeds = 0;
  let occupiedBeds = 0;
  let icuBeds = 0;
  let occupiedIcuBeds = 0;
  let criticalCount = 0;
  let ambulances = 0;

  for (const h of hospitals) {
    totalBeds += h.totalBeds;
    occupiedBeds += h.occupiedBeds;
    icuBeds += h.icuBeds;
    occupiedIcuBeds += h.occupiedIcuBeds;
    ambulances += h.ambulancesAvailable;
    if (h.floodRisk === 'ALERT' || h.floodRisk === 'EVACUATING' || h.floodRisk === 'SUBMERGED') {
      criticalCount++;
    }
  }

  return {
    totalCapacity: totalBeds,
    totalOccupied: occupiedBeds,
    occupancyRatePercent: Math.round((occupiedBeds / (totalBeds || 1)) * 100),
    totalIcuCapacity: icuBeds,
    totalIcuOccupied: occupiedIcuBeds,
    icuOccupancyRatePercent: Math.round((occupiedIcuBeds / (icuBeds || 1)) * 100),
    criticalHospitalsCount: criticalCount,
    totalAmbulancesReady: ambulances,
  };
}

/**
 * Calculates optimal patient reallocation plans from flood-threatened facilities
 * to secure inland pivot hospitals.
 */
export function generatePatientReallocations(hospitals: HospitalNode[]): PatientReallocationPlan[] {
  const plans: PatientReallocationPlan[] = [];

  const sourceHospitals = hospitals.filter(
    h => h.floodRisk === 'ALERT' || h.floodRisk === 'EVACUATING' || h.floodRisk === 'SUBMERGED'
  );
  const targetHospitals = hospitals.filter(h => h.floodRisk === 'SAFE');

  for (const source of sourceHospitals) {
    // 1. Critical ICU Patients
    if (source.occupiedIcuBeds > 0) {
      // Find safest target with ICU headroom
      const target = targetHospitals.find(t => (t.icuBeds - t.occupiedIcuBeds) >= 3) || targetHospitals[0];
      if (target) {
        const patientsToMove = Math.min(source.occupiedIcuBeds, target.icuBeds - target.occupiedIcuBeds);
        plans.push({
          id: `PLAN-ICU-${source.id}-${target.id}`,
          sourceHospitalId: source.id,
          sourceHospitalName: source.name,
          targetHospitalId: target.id,
          targetHospitalName: target.name,
          patientCount: patientsToMove,
          category: 'ICU_REANIMATION',
          evacuationRoute: source.floodRisk === 'EVACUATING' ? 'HELICOPTER' : 'ROAD_DETOUR_FLOOD',
          distanceKm: 48,
          etaMinutes: source.floodRisk === 'EVACUATING' ? 25 : 65,
          riskAssessment: 'Transfert prioritaire sous assistance ventilatoire mobile. Convoi escorté par la gendarmerie.',
        });
      }
    }

    // 2. Standard Acute Medicine Patients
    const standardPatientsToEvacuate = Math.min(25, source.occupiedBeds - source.occupiedIcuBeds);
    if (standardPatientsToEvacuate > 0) {
      const target = targetHospitals[0];
      if (target) {
        plans.push({
          id: `PLAN-MED-${source.id}-${target.id}`,
          sourceHospitalId: source.id,
          sourceHospitalName: source.name,
          targetHospitalId: target.id,
          targetHospitalName: target.name,
          patientCount: standardPatientsToEvacuate,
          category: 'STANDARD_MEDICINE',
          evacuationRoute: 'ROAD_DETOUR_FLOOD',
          distanceKm: 52,
          etaMinutes: 70,
          riskAssessment: 'Évacuation par bus sanitaires départementaux via déviation RN2 sécurisée.',
        });
      }
    }
  }

  return plans;
}
