/**
 * QARVYEN 2.0 — Sovereign Multisectoral Resilience & Polyvalent Agents Service
 * Comprehensive integration of 9 critical sovereign sectors:
 * 1. Défense & Sécurité Civile
 * 2. Énergie & Réseaux Électriques
 * 3. Agriculture & Sécurité Alimentaire
 * 4. Élevage & Pastoralisme
 * 5. Économie, Marchés & Approvisionnement
 * 6. Aménagement du Territoire & Habitat
 * 7. Santé & Pandémies
 * 8. Télécoms & Connectivité Résiliente
 * 9. Éducation & Abris d'Urgence
 */

import { SectorType, AgentType, UserProfile } from '../types/qarvyen';
import { auditLedger } from './governanceAudit';

export interface SectorKpi {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface SectorActionDirective {
  id: string;
  code: string;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  description: string;
  targetEntity: string;
  leadTimeHours: number;
  intersectorImpact: string;
  status: 'PROPOSED' | 'APPROVED' | 'EXECUTING' | 'COMPLETED';
}

export interface SectorAgentProfile {
  agentType: AgentType;
  codename: string;
  name: string;
  callsign: string;
  avatarIcon: string;
  specialty: string;
  doctrineSource: string;
  operationalMissions: string[];
  autonomousCapabilities: string[];
  dataSensors: string[];
  currentAssessment: string;
  recommendedDirectives: SectorActionDirective[];
}

export interface MultisectoralSector {
  id: SectorType;
  code: string;
  title: string;
  shortName: string;
  badge: string;
  category: 'SECURITY' | 'INFRASTRUCTURE' | 'LIVELIHOOD' | 'SOCIAL_HUMAN';
  leadMinistry: string;
  legalMandate: string;
  missionOverview: string;
  tacticalRoleInCrisis: string;
  kpis: SectorKpi[];
  agent: SectorAgentProfile;
  intersectoralSynergies: {
    targetSector: string;
    relationship: 'PROVIDES' | 'REQUIRES' | 'CONFLICT_ARBITRATION';
    description: string;
  }[];
}

export const MULTISECTORAL_SECTORS: MultisectoralSector[] = [
  // 1. DÉFENSE & SÉCURITÉ CIVILE
  {
    id: 'defense_resilience',
    code: 'SEC-DEF',
    title: 'Défense, Sécurité Civile & Résilience Stratégique',
    shortName: 'Défense & Sécurité',
    badge: '🛡️ SOUVERAINETÉ & C2',
    category: 'SECURITY',
    leadMinistry: 'Ministère des Forces Armées & Ministère de l\'Intérieur (BNSP / COGC)',
    legalMandate: 'Code de la Sécurité Civile, Décret d\'engagement des Armées en mission de service public, Plan National ORSEC.',
    missionOverview: 'Protection des populations, maintien de l\'ordre républicain, opérations héliportées et amphibies de sauvetage, sécurisation des corridors logistiques et des frontières fluviales.',
    tacticalRoleInCrisis: 'Déploiement des vedettes rapides des sapeurs-pompiers (BNSP), héliportage des urgences absolues par l\'Armée de l\'Air, bouclage des digues en rupture et sécurisation anti-pillage des zones évacuées.',
    kpis: [
      { id: 'def-1', label: 'Personnes Secourues / Évacuées', value: '4 820', subValue: '24h glissantes', status: 'CRITICAL', trend: 'UP' },
      { id: 'def-2', label: 'Vecteurs Nautiques Engagés', value: '38 Embarcations', subValue: 'BNSP / Marine Nat.', status: 'NORMAL', trend: 'STABLE' },
      { id: 'def-3', label: 'Héliportages Tactiques', value: '14 Rotations', subValue: 'Armée de l\'Air', status: 'WARNING', trend: 'UP' },
      { id: 'def-4', label: 'Points de Filtrage & Sécurisation', value: '26 Checkpoints', subValue: 'Gendarmerie Terr.', status: 'NORMAL', trend: 'STABLE' }
    ],
    agent: {
      agentType: 'agent_defense',
      codename: 'SENTINEL-DEFENSE',
      name: 'Agent Défense & Protection Civile',
      callsign: 'BOUCLIER-1',
      avatarIcon: 'ShieldAlert',
      specialty: 'Coordination Tactique C2, Sauvetage Héliporté & Amphibie, Zonage d\'Exclusion',
      doctrineSource: 'Plan ORSEC National, Lignes directrices INSARAG USAR, Directive C2 Interarmées',
      operationalMissions: [
        'Établissement du Poste de Commandement Opérationnel (PCO) avancé.',
        'Arbitrage du déploiement des moyens lourds du Génie Militaire pour consolidation des digues.',
        'Organisation des corridors nautiques sécurisés pour le franchissement fluvial.',
        'Maintien de la chaîne radio HF/VHF tactique de secours.'
      ],
      autonomousCapabilities: [
        'Calcul des isochrones d\'évacuation par embarcation légère.',
        'Cartographie instantanée des zones d\'atterrissage d\'urgence (DZ hélicoptères).',
        'Priorisation algorithmique des sauvetages en eau vive selon la vulnérabilité.'
      ],
      dataSensors: ['Copernicus Sentinel-1 SAR (détection des berges rompues)', 'Flux radio BNSP', 'Réseau radars météorologiques'],
      currentAssessment: 'Niveau d\'engagement ORSEC Échelon 3. Pression extrême sur le corridor Podor-Guédé. Réquisition de 6 chaloupes supplémentaires validée.',
      recommendedDirectives: [
        {
          id: 'dir-def-01',
          code: 'DEF-ORD-01',
          title: 'Déploiement du Bataillon du Génie Militaire à Guédé Chantier',
          priority: 'URGENT',
          description: 'Héliportage de gabions métalliques et engins de terrassement pour colmater la brèche de 45m sur la digue agricole.',
          targetEntity: 'Génie Militaire / BNSP Zone 2',
          leadTimeHours: 3,
          intersectorImpact: 'Conditionne la sauvegarde de 1 200 ha de riziculture (Secteur Agriculture).',
          status: 'PROPOSED'
        },
        {
          id: 'dir-def-02',
          code: 'DEF-ORD-02',
          title: 'Couvre-feu fluvial nocturne sur le marigot de Doué',
          priority: 'HIGH',
          description: 'Interdiction de navigation non coordonnée de 19h00 à 06h00 pour prévenir les chavirements par fort courant.',
          targetEntity: 'Gendarmerie Fluviale',
          leadTimeHours: 6,
          intersectorImpact: 'Sécurise les rotations sanitaires d\'urgence.',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'health', relationship: 'PROVIDES', description: 'Évacuation des blessés graves par vecteur héliporté vers les hôpitaux pivots.' },
      { targetSector: 'energy', relationship: 'PROVIDES', description: 'Protection militaire des centrales thermiques et postes HTB isolés.' },
      { targetSector: 'agriculture', relationship: 'CONFLICT_ARBITRATION', description: 'Décision d\'inondation contrôlée d\'un casier agricole pour sauver une digue protégeant une ville.' }
    ]
  },

  // 2. ÉNERGIE & RÉSEAUX
  {
    id: 'energy',
    code: 'SEC-NRG',
    title: 'Énergie, Réseaux Électriques & Barrages Hydroélectriques',
    shortName: 'Énergie & Réseaux',
    badge: '⚡ INFRASTRUCTURE CRITIQUE',
    category: 'INFRASTRUCTURE',
    leadMinistry: 'Ministère du Pétrole et des Énergies (SENELEC / OMVS / SOGEM)',
    legalMandate: 'Règlement de Sécurité des Ouvrages Hydroélectriques OMVS, Code de l\'Électricité.',
    missionOverview: 'Maintien de la continuité de service électrique, gestion des débits des usines hydroélectriques de Manantali et Gouina, sécurisation des postes HTB/HTA et autonomie des générateurs.',
    tacticalRoleInCrisis: 'Prévention du blackout régional en cas de submersion d\'un poste source, arbitrage de délestage vers les stations de pompage vitales et approvisionnement en gasoil des hôpitaux.',
    kpis: [
      { id: 'nrg-1', label: 'Postes Sources HTB Menacés', value: '2 Postes', subValue: 'Matam 225kV / Podor 30kV', status: 'WARNING', trend: 'STABLE' },
      { id: 'nrg-2', label: 'Production Hydroélectrique Manantali', value: '185 MW', subValue: 'Plein régime déversement', status: 'NORMAL', trend: 'STABLE' },
      { id: 'nrg-3', label: 'Autonomie Carburant Hôpitaux Réseau', value: '58 Heures', subValue: 'Moyenne réseau (Seuil 72h)', status: 'WARNING', trend: 'DOWN' },
      { id: 'nrg-4', label: 'Foyers Coupés pour Sécurité Inondation', value: '14 200', subValue: 'Déconnexion préventive', status: 'NORMAL', trend: 'UP' }
    ],
    agent: {
      agentType: 'agent_energy',
      codename: 'VOLT-SOVEREIGN',
      name: 'Agent Énergie & Réseaux',
      callsign: 'ENERGIE-1',
      avatarIcon: 'Zap',
      specialty: 'Équilibrage de Réseau en Crise, Préservation Postes HTB, Gestion des Débits de Turbinage',
      doctrineSource: 'Protocole de Sauvegarde du Réseau Interconnecté OMVS, Plan de Continuité Électrique SENELEC',
      operationalMissions: [
        'Surveillance de la ligne d\'eau au niveau des transformateurs des postes sources.',
        'Ordonnancement prioritaire des rotations de camions-citernes de gasoil vers les générateurs d\'hôpitaux.',
        'Mise en îlotage automatique des microréseaux résilients.',
        'Protection cathodique et coupure sélective des départs basse tension submergés pour éviter l\'électrocution.'
      ],
      autonomousCapabilities: [
        'Calcul prédictif de l\'épuisement des cuves de groupes électrogènes.',
        'Simulation des impacts d\'un déclenchement de ligne 225kV sur la boucle régionale.',
        'Optimisation de l\'effacement de charge industrielle pour sanctuariser l\'eau potable.'
      ],
      dataSensors: ['SCADA SENELEC en direct', 'Télémesure barrage Manantali', 'Capteurs de niveau d\'eau sous-stations'],
      currentAssessment: 'Alerte sur le poste de Podor : l\'eau est à 38 cm des travées 30kV. Érection immédiate d\'un merlon étanche nécessaire.',
      recommendedDirectives: [
        {
          id: 'dir-nrg-01',
          code: 'NRG-ORD-01',
          title: 'Convoi prioritaire de 40 000 L de gasoil vers le CHR de Podor',
          priority: 'URGENT',
          description: 'Ravitaillement sous escorte militaire de la cuve centrale du groupe électrogène pour rétablir une marge > 72h.',
          targetEntity: 'SENELEC Logistique / Escorte Gendarmerie',
          leadTimeHours: 4,
          intersectorImpact: 'Évite l\'arrêt des respirateurs de réanimation (Secteur Santé).',
          status: 'PROPOSED'
        },
        {
          id: 'dir-nrg-02',
          code: 'NRG-ORD-02',
          title: 'Surélévation des moteurs de pompage SAED Ndioum',
          priority: 'HIGH',
          description: 'Mise sur berceau métallique étanche des armoires de commande électrique.',
          targetEntity: 'SAED / SENELEC Division Hydraulique',
          leadTimeHours: 8,
          intersectorImpact: 'Maintient la capacité de drainage agricole.',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'health', relationship: 'PROVIDES', description: 'Fourniture ininterrompue d\'électricité aux blocs opératoires et chaînes de froid vaccinales.' },
      { targetSector: 'telecom', relationship: 'PROVIDES', description: 'Alimentation des relais hertziens et tours télécoms de secours.' },
      { targetSector: 'agriculture', relationship: 'CONFLICT_ARBITRATION', description: 'Arbitrage entre énergie pour le pompage d\'exhaure agricole vs alimentation domestique.' }
    ]
  },

  // 3. AGRICULTURE & SÉCURITÉ ALIMENTAIRE
  {
    id: 'agriculture',
    code: 'SEC-AGR',
    title: 'Agriculture, Cultures Irriguées & Sécurité Alimentaire',
    shortName: 'Agriculture & Récoltes',
    badge: '🌾 SÉCURITÉ ALIMENTAIRE',
    category: 'LIVELIHOOD',
    leadMinistry: 'Ministère de l\'Agriculture, de la Souveraineté Alimentaire et de l\'Élevage (SAED / SODAGRI)',
    legalMandate: 'Loi d\'Orientation Agro-Sylvo-Pastorale (LOASP), Programme National d\'Autosuffisance en Riz (PNAR).',
    missionOverview: 'Protection des casiers rizicoles et maraîchers irrigués, sauvegarde des récoltes en grange, pompage d\'exhaure des cuvettes submergées et prévention des ruptures de greniers céréaliers.',
    tacticalRoleInCrisis: 'Évaluation satellitaire Sentinel-1 des surfaces rizicoles noyées, activation des motopompes géantes de drainage, sauvetage des stocks de paddy et réorientation semencière post-retrait des eaux.',
    kpis: [
      { id: 'agr-1', label: 'Casiers Rizicoles Submergés', value: '18 450 ha', subValue: 'SAED Podor / Matam', status: 'CRITICAL', trend: 'UP' },
      { id: 'agr-2', label: 'Pertes Récolte de Riz Paddy Estimées', value: '82 000 Tonnes', subValue: 'Campagne Hivernage 2024', status: 'CRITICAL', trend: 'UP' },
      { id: 'agr-3', label: 'Stations de Pompage d\'Exhaure Actives', value: '19 / 24', subValue: '5 noyées ou hors service', status: 'WARNING', trend: 'DOWN' },
      { id: 'agr-4', label: 'Greniers & Silos Sanctuarisés', value: '94%', subValue: 'Stocks de sécurité préservés', status: 'NORMAL', trend: 'STABLE' }
    ],
    agent: {
      agentType: 'agent_agriculture',
      codename: 'CERES-AGRI',
      name: 'Agent Agriculture & Sécurité Alimentaire',
      callsign: 'AGRI-1',
      avatarIcon: 'Wheat',
      specialty: 'Télédétection SAR de Submersion Agricole, Bilan Prédictif de Récolte, Résilience Rizicole',
      doctrineSource: 'Directives de Sauvegarde des Aménagements Hydro-Agricoles SAED, Protocole d\'Urgence PAM/FAO',
      operationalMissions: [
        'Cartographie radar haute résolution des périmètres irrigués sous l\'eau.',
        'Calcul des pertes économiques et volumétriques en riz paddy.',
        'Coordination du déploiement des électropompes de vidange des casiers.',
        'Planification de la campagne de contre-saison chaude précoce pour compenser les pertes.'
      ],
      autonomousCapabilities: [
        'Estimation des durées de survie des plants de riz selon la hauteur et turbidité de la lame d\'eau.',
        'Modélisation des besoins en engrais et semences certifiées de remplacement.',
        'Détection des brèches de canaux d\'irrigation par comparaison SAR pré/post inondation.'
      ],
      dataSensors: ['Copernicus Sentinel-1 SAR & Sentinel-2 MSI', 'Base parcellaire SAED', 'Capteurs limnimétriques des casiers'],
      currentAssessment: 'Submersion à 90% des cuvettes de Podor et Guédé. Les plants de riz au stade floraison ne survivront pas à plus de 72h d\'immersion totale. Pompage urgent requis.',
      recommendedDirectives: [
        {
          id: 'dir-agr-01',
          code: 'AGR-ORD-01',
          title: 'Déploiement de 8 motopompes haute capacité (1 000 m³/h)',
          priority: 'URGENT',
          description: 'Vidange d\'urgence de la cuvette rizicole de Démette pour sauver 3 200 ha avant pourrissement racinaire.',
          targetEntity: 'SAED / Génie Rural',
          leadTimeHours: 6,
          intersectorImpact: 'Sauve 15 000 tonnes de riz paddy (Secteur Économie).',
          status: 'PROPOSED'
        },
        {
          id: 'dir-agr-02',
          code: 'AGR-ORD-02',
          title: 'Constitution du stock de semences à cycle court (90 jours)',
          priority: 'HIGH',
          description: 'Acheminement de 500 tonnes de semences Sahel 108 vers les magasins de stockage de Ndioum pour le post-crue.',
          targetEntity: 'Direction de l\'Agriculture / ISRA',
          leadTimeHours: 24,
          intersectorImpact: 'Prévient la disette au premier trimestre suivant.',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'energy', relationship: 'REQUIRES', description: 'Énergie électrique continue pour les stations de pompage de drainage SAED.' },
      { targetSector: 'economy', relationship: 'PROVIDES', description: 'Approvisionnement en céréales des marchés ruraux pour stabiliser les cours.' },
      { targetSector: 'livestock', relationship: 'CONFLICT_ARBITRATION', description: 'Gestion de l\'intrusion du bétail fuyant la crue dans les casiers rizicoles non inondés.' }
    ]
  },

  // 4. ÉLEVAGE & PASTORALISME
  {
    id: 'livestock',
    code: 'SEC-ELV',
    title: 'Élevage, Pastoralisme & Santé Animale Transfrontalière',
    shortName: 'Élevage & Pastoralisme',
    badge: '🐄 PATRIMOINE PASTORAL',
    category: 'LIVELIHOOD',
    leadMinistry: 'Ministère de l\'Élevage et des Productions Animales (DIREL / Services Vétérinaires)',
    legalMandate: 'Code Pastoral, Accords OMVS de transhumance transfrontalière, Directives OMSA (Santé Animale).',
    missionOverview: 'Sécurisation des troupeaux bovins, ovins et caprins face à la montée des eaux, réorientation des couloirs de transhumance, prévention des noyades de bétail et surveillance des épizooties post-inondation.',
    tacticalRoleInCrisis: 'Détournement des troupeaux vers les zones hautes du Diéri (hors crue), aménagement de parcs de vaccination temporaires, apport en aliments de bétail concentrés et enfouissement sanitaire des carcasses.',
    kpis: [
      { id: 'elv-1', label: 'Têtes de Bétail Déplacées en Zone Haute', value: '142 000 Têtes', subValue: 'Bovins, ovins, caprins', status: 'NORMAL', trend: 'UP' },
      { id: 'elv-2', label: 'Pâturages Submergés / Inaccessibles', value: '45 000 ha', subValue: 'Zones de décrue (Walo)', status: 'CRITICAL', trend: 'UP' },
      { id: 'elv-3', label: 'Pertes & Noyades de Bétail Confirmées', value: '1 240 Têtes', subValue: 'Principalement petits ruminants', status: 'WARNING', trend: 'UP' },
      { id: 'elv-4', label: 'Couloirs de Transhumance Sécurisés', value: '6 / 8 Tracés', subValue: 'Vers le Diéri / Ferlo', status: 'NORMAL', trend: 'STABLE' }
    ],
    agent: {
      agentType: 'agent_livestock',
      codename: 'PASTOR-SHIELD',
      name: 'Agent Élevage & Pastoralisme',
      callsign: 'PASTOR-1',
      avatarIcon: 'Milestone',
      specialty: 'Traçabilité des Couloirs Pastoraux, Surveillance Épizootique, Évacuation des Troupeaux',
      doctrineSource: 'Plan National de Contingence Élevage, Protocole OMSA / FAO de Gestion des Crises Pastorales',
      operationalMissions: [
        'Cartographie radar des axes de transhumance coupés par l\'eau.',
        'Identification des points de regroupement hors d\'eau pour les troupeaux pastoraux.',
        'Mise en place de barrières sanitaires contre le charbon bactéridien et la fièvre de la vallée du Rift.',
        'Gestion de l\'approvisionnement d\'urgence en tourteaux d\'arachide et foin.'
      ],
      autonomousCapabilities: [
        'Calcul des capacités de charge des pâturages de repli dans le Ferlo.',
        'Prédiction des risques d\'épizooties hydriques vectorielles chez les ruminants.',
        'Médiation spatiale entre agriculteurs et éleveurs pour éviter les conflits d\'usage des terres émergées.'
      ],
      dataSensors: ['Sentinel-1 SAR (zones d\'isolement du bétail)', 'Système d\'alerte vétérinaire DIREL', 'Données pluviométriques et biomasses NDVI'],
      currentAssessment: 'Fort risque de surmortalité des veaux et agneaux sur l\'Île à Morphil. Urgence de déployer des barges d\'évacuation de bétail vers le Diéri.',
      recommendedDirectives: [
        {
          id: 'dir-elv-01',
          code: 'ELV-ORD-01',
          title: 'Ouverture du couloir pastoral d\'urgence Ndioum-Linguère',
          priority: 'URGENT',
          description: 'Balisage et sécurisation du tracé transhumant vers le Ferlo profond avec approvisionnement en eau aux forages pastoraux.',
          targetEntity: 'Direction de l\'Élevage / Garde Forestière',
          leadTimeHours: 12,
          intersectorImpact: 'Évite l\'engorgement des zones urbaines par le bétail.',
          status: 'PROPOSED'
        },
        {
          id: 'dir-elv-02',
          code: 'ELV-ORD-02',
          title: 'Campagne de vaccination d\'urgence contre le charbon symptomatique',
          priority: 'HIGH',
          description: 'Déploiement de 50 000 doses de vaccins aux parcs de contention de Ourossogui et Bakel.',
          targetEntity: 'Ordre National des Vétérinaires / DIREL',
          leadTimeHours: 24,
          intersectorImpact: 'Prévient la transmission de zoonoses aux populations (Secteur Santé).',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'agriculture', relationship: 'CONFLICT_ARBITRATION', description: 'Empêcher la divagation des troupeaux affamés sur les casiers agricoles rescapés.' },
      { targetSector: 'health', relationship: 'PROVIDES', description: 'Contrôle des zoonoses (Rift Valley Fever, leptospirose animale) transmissibles à l\'homme.' },
      { targetSector: 'economy', relationship: 'PROVIDES', description: 'Préservation du capital cheptel des ménages pastoraux vulnérables.' }
    ]
  },

  // 5. ÉCONOMIE, MARCHÉS & APPROVISIONNEMENT
  {
    id: 'economy',
    code: 'SEC-ECO',
    title: 'Économie, Chaînes d\'Approvisionnement & Marchés Ruraux',
    shortName: 'Économie & Marchés',
    badge: '📈 FLUX & PRIX CRITIQUES',
    category: 'LIVELIHOOD',
    leadMinistry: 'Ministère de l\'Économie, des Finances et du Plan & Ministère du Commerce',
    legalMandate: 'Réglementation des Prix des Denrées de Première Nécessité, Fonds National de Solidarité et Résilience.',
    missionOverview: 'Surveillance des cours des produits de première nécessité (riz, huile, sucre, gaz), détection des pénuries de carburant, approvisionnement des marchés hebdomadaires (Loumas) et soutien financier d\'urgence.',
    tacticalRoleInCrisis: 'Contrôle des prix pour réprimer la spéculation sur les denrées d\'urgence, mise en place de convois de ravitaillement escorted, évaluation macro-économique des dégâts et déploiement de transferts monétaires d\'urgence (Cash Transfer).',
    kpis: [
      { id: 'eco-1', label: 'Indice de Flambée des Prix Locaux', value: '+14.2%', subValue: 'Pression sur riz/carburant', status: 'WARNING', trend: 'UP' },
      { id: 'eco-2', label: 'Marchés Hebdomadaires Isolés (Loumas)', value: '11 Loumas', subValue: 'Accès routier impraticable', status: 'CRITICAL', trend: 'UP' },
      { id: 'eco-3', label: 'Pertes d\'Activité Économique Directes', value: '4.8 Mds FCFA', subValue: 'Estimation globale vallée', status: 'CRITICAL', trend: 'UP' },
      { id: 'eco-4', label: 'Bénéficiaires Filets Sociaux d\'Urgence', value: '32 000 Foyers', subValue: 'Transferts monétaires activés', status: 'NORMAL', trend: 'UP' }
    ],
    agent: {
      agentType: 'agent_economy',
      codename: 'MARKET-SOVEREIGN',
      name: 'Agent Économie & Approvisionnement',
      callsign: 'MERCUR-1',
      avatarIcon: 'TrendingUp',
      specialty: 'Traçabilité des Prix des Denrées, Détection des Ruptures d\'Approvisionnement, Transferts Monétaires',
      doctrineSource: 'Cadre National de Régulation des Marchés en Crise, Directives PAM Cash-Transfer',
      operationalMissions: [
        'Surveillance automatisée des prix de détail dans les communes sinistrées.',
        'Identification des goulots d\'étranglement logistiques coupant les approvisionnements.',
        'Modélisation du choc économique territorial et projection des besoins de refinancement.',
        'Suivi du décaissement des fonds d\'urgence de solidarité nationale.'
      ],
      autonomousCapabilities: [
        'Détection d\'anomalies tarifaires révélant des pratiques spéculatives illicites.',
        'Calcul des corridors d\'approvisionnement à coût et délai minimaux.',
        'Ciblage spatialisé des ménages prioritaires pour les secours financiers.'
      ],
      dataSensors: ['Réseau des brigades du commerce intérieur', 'Flux bancaires et mobile money', 'Données douanières transfrontalières'],
      currentAssessment: 'Rupture d\'huile de palme et de gaz butane constatée à Démette. Flambée de +25% du sac de riz brisé à Podor ville. Régulation urgente ordonnée.',
      recommendedDirectives: [
        {
          id: 'dir-eco-01',
          code: 'ECO-ORD-01',
          title: 'Plafonnement autoritaire des prix du riz, sucre et carburant',
          priority: 'URGENT',
          description: 'Publication de l\'arrêté préfectoral d\'urgence et déploiement des inspecteurs du commerce sous escorte.',
          targetEntity: 'Direction du Commerce Intérieur / Préfectures',
          leadTimeHours: 2,
          intersectorImpact: 'Maintient le pouvoir d\'achat de survie des sinistrés.',
          status: 'PROPOSED'
        },
        {
          id: 'dir-eco-02',
          code: 'ECO-ORD-02',
          title: 'Déblocage de 1.5 milliard FCFA en cash transferts d\'urgence',
          priority: 'HIGH',
          description: 'Versement de 50 000 FCFA par ménage sinistré via portefeuille mobile sécurisé.',
          targetEntity: 'Délégation Générale à la Solidarité Nationale (DGSN)',
          leadTimeHours: 12,
          intersectorImpact: 'Relance la demande locale sans engorger les distributions physiques.',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'agriculture', relationship: 'REQUIRES', description: 'Données de récolte pour anticiper les déséquilibres offre/demande.' },
      { targetSector: 'defense_resilience', relationship: 'REQUIRES', description: 'Sécurisation des convois marchands sur les tronçons de déviation.' },
      { targetSector: 'territory', relationship: 'PROVIDES', description: 'Financement de la reconstruction des ponts et axes détruits.' }
    ]
  },

  // 6. AMÉNAGEMENT DU TERRITOIRE, INFRASTRUCTURES & HABITAT
  {
    id: 'territory',
    code: 'SEC-TER',
    title: 'Aménagement du Territoire, Infrastructures & Habitat Résilient',
    shortName: 'Territoire & Habitat',
    badge: '🗺️ TOPOGRAPHIE & OUVRAGES',
    category: 'INFRASTRUCTURE',
    leadMinistry: 'Ministère de l\'Urbanisme, du Logement et de l\'Hygiène Publique (AGEROUTE / ANAT)',
    legalMandate: 'Code de l\'Urbanisme, Plan National d\'Aménagement et de Développement Territorial (PNADT).',
    missionOverview: 'Cartographie des zones inconstructibles, gestion des brèches de voirie, surveillance des ponts stratégiques, aménagement des sites d\'hébergement temporaire et résilience de l\'habitat.',
    tacticalRoleInCrisis: 'Diagnostic technique de portance des chaussées submergées, déviation du trafic lourd, érection de merlons de protection urbains et viabilisation des plateformes de tentes de sinistrés.',
    kpis: [
      { id: 'ter-1', label: 'Tronçons Routiers Majeurs Submergés', value: '4 Tronçons', subValue: 'RN2 coupée à 2 endroits', status: 'CRITICAL', trend: 'UP' },
      { id: 'ter-2', label: 'Ponts Stratégiques sous Surveillance', value: '7 Ouvrages', subValue: 'Affouillement des piles', status: 'WARNING', trend: 'STABLE' },
      { id: 'ter-3', label: 'Habitations Submergées ou Effondrées', value: '6 420 Maisons', subValue: 'Principalement banco/briques', status: 'CRITICAL', trend: 'UP' },
      { id: 'ter-4', label: 'Sites d\'Accueil de Sinistrés Viabilisés', value: '12 Sites', subValue: 'Capacité 18 000 pers.', status: 'NORMAL', trend: 'UP' }
    ],
    agent: {
      agentType: 'agent_territory',
      codename: 'TERRA-GEO',
      name: 'Agent Aménagement du Territoire & Infrastructures',
      callsign: 'TERRA-1',
      avatarIcon: 'MapPin',
      specialty: 'Diagnostic Géotechnique de Voirie, Zonage d\'Exposition, Viabilisation des Sites d\'Urgence',
      doctrineSource: 'Directives AGEROUTE de Viabilité Hivernale, Guide ONU-Habitat d\'Aménagement de Camp d\'Urgence',
      operationalMissions: [
        'Analyse radar des axes routiers coupés et calcul des itinéraires de délestage.',
        'Suivi de la stabilité structurale des digues et culées de ponts.',
        'Sélection des parcelles hautes pour l\'implantation des camps de toile.',
        'Élaboration du plan de zonage post-crue avec interdiction de reconstruction en cuvette.'
      ],
      autonomousCapabilities: [
        'Modélisation MNT (Modèle Numérique de Terrain) de la pente d\'écoulement.',
        'Calcul des cubatures de remblai requises pour surélever les accès vitaux.',
        'Évaluation de la portance résiduelle des chaussées bitumées inondées.'
      ],
      dataSensors: ['Copernicus DEM 30m & Sentinel-1', 'Base de données AGEROUTE', 'Cadastre communal numérisé'],
      currentAssessment: 'Coupure nette de la RN2 sur 600m entre Tarédji et Podor. Tirant d\'eau de 45 cm avec fort courant. Voie déclarée impraticable aux véhicules légers.',
      recommendedDirectives: [
        {
          id: 'dir-ter-01',
          code: 'TER-ORD-01',
          title: 'Installation d\'un pont Bailey métallique provisoire sur la RN2',
          priority: 'URGENT',
          description: 'Mobilisation d\'une travée Bailey modulaire de 30m par l\'Armée et AGEROUTE pour désenclaver Podor.',
          targetEntity: 'AGEROUTE / Génie Militaire',
          leadTimeHours: 18,
          intersectorImpact: 'Rétablit l\'axe logistique pour tout le nord (Secteurs Santé, Économie, Énergie).',
          status: 'PROPOSED'
        },
        {
          id: 'dir-ter-02',
          code: 'TER-ORD-02',
          title: 'Raccordement WASH du site de relogement de Ndioum 2',
          priority: 'HIGH',
          description: 'Pose d\'une canalisation PEHD de 2 km pour alimenter 120 tentes familiales en eau potable.',
          targetEntity: 'OFOR (Office des Forages Ruraux) / Croix-Rouge',
          leadTimeHours: 10,
          intersectorImpact: 'Prévient les foyers épidémiologiques dans les camps.',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'education', relationship: 'PROVIDES', description: 'Aménagement de sites dédiés évitant la saturation des écoles.' },
      { targetSector: 'defense_resilience', relationship: 'PROVIDES', description: 'Cartes topographiques d\'accessibilité terrestre et fluviale.' },
      { targetSector: 'telecom', relationship: 'REQUIRES', description: 'Accès physique aux sites d\'antennes pour réparations d\'urgence.' }
    ]
  },

  // 7. SANTÉ & PANDÉMIES
  {
    id: 'health',
    code: 'SEC-SAN',
    title: 'Santé Publique, Urgences Hospitalières & Sécurité Sanitaire',
    shortName: 'Santé & Pandémies',
    badge: '🏥 SÉCURITÉ BIOLOGIQUE',
    category: 'SOCIAL_HUMAN',
    leadMinistry: 'Ministère de la Santé et de l\'Action Sociale (COUS / SAMU National)',
    legalMandate: 'Règlement Sanitaire International (RSI / IHR 2005 OMS), Plan ORSAN Réseau Hospitalier.',
    missionOverview: 'Surveillance épidémiologique des maladies hydriques (choléra, typhoïde, leptospirose), maintien capacitaire des lits d\'hospitalisation et réanimation, évacuation sanitaire et eau potable.',
    tacticalRoleInCrisis: 'Régulation des transferts de patients par le SAMU, déploiement des Centres de Traitement du Choléra (CTC), sécurisation des stocks de sang et sérums antivenimeux, chloration des puits.',
    kpis: [
      { id: 'san-1', label: 'Taux d\'Occupation Global des Lits', value: '84%', subValue: 'Seuil de saturation 90%', status: 'WARNING', trend: 'UP' },
      { id: 'san-2', label: 'Saturation Lits de Réanimation (ICU)', value: '92%', subValue: 'Situation critique', status: 'CRITICAL', trend: 'UP' },
      { id: 'san-3', label: 'Hôpitaux en Procédure d\'Évacuation', value: '2 Centres', subValue: 'Démette & Walia', status: 'CRITICAL', trend: 'STABLE' },
      { id: 'san-4', label: 'Cas Suspects de Choléra / Diarrhées', value: '18 Cas', subValue: 'Sous isolement immédiat', status: 'WARNING', trend: 'UP' }
    ],
    agent: {
      agentType: 'agent_health',
      codename: 'HYGIE-SOVEREIGN',
      name: 'Agent Santé & Urgences Hospitalières',
      callsign: 'ESCULAPE-1',
      avatarIcon: 'Activity',
      specialty: 'Régulation Capacitaire Hospitalière, Alerte Épidémique Précoce, Logistique Sanitaire',
      doctrineSource: 'Doctrine ORSEC Sanitaire, Lignes Directrices OMS de Lutte contre le Choléra en Crise',
      operationalMissions: [
        'Surveillance de l\'état de saturation des blocs de réanimation et maternités.',
        'Génération automatique des plans de réallocation capacitaire inter-hospitalière.',
        'Suivi de la chaîne de froid des vaccins et produits sanguins labiles.',
        'Mise en place de cordons sanitaires autour des points d\'eau suspects.'
      ],
      autonomousCapabilities: [
        'Algorithme d\'évacuation pondérée par gravité médicale et accessibilité routière.',
        'Calcul de l\'incidence épidémique prévisionnelle selon la température et stagnation des eaux.',
        'Optimisation de l\'affectation des dotations d\'oxygène médical.'
      ],
      dataSensors: ['Réseau COUS (Centre des Opérations d\'Urgence Sanitaire)', 'Système DHIS2', 'Alertes laboratoires Institut Pasteur'],
      currentAssessment: 'Alerte maximale sur le dispensaire de Démette : générateurs sous 18h d\'autonomie et 4 patients sous assistance respiratoire. Évacuation ordonnée.',
      recommendedDirectives: [
        {
          id: 'dir-san-01',
          code: 'SAN-ORD-01',
          title: 'Évacuation prioritaire de 4 patients de réanimation de Démette',
          priority: 'URGENT',
          description: 'Transfert par hélicoptère médicalisé vers le Centre Hospitalier Régional d\'Ourossogui.',
          targetEntity: 'SAMU National / Armée de l\'Air',
          leadTimeHours: 2,
          intersectorImpact: 'Mobilise un vecteur aérien du secteur Défense.',
          status: 'PROPOSED'
        },
        {
          id: 'dir-san-02',
          code: 'SAN-ORD-02',
          title: 'Distribution de 100 000 comprimés Aquatabs de purification d\'eau',
          priority: 'HIGH',
          description: 'Dotation des comités villageois de santé pour désinfection de l\'eau de boisson.',
          targetEntity: 'Direction de la Prévention / Croix-Rouge',
          leadTimeHours: 8,
          intersectorImpact: 'Enraye le pic d\'infections gastro-intestinales.',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'energy', relationship: 'REQUIRES', description: 'Garantie de non-délestage électrique pour les blocs opératoires.' },
      { targetSector: 'defense_resilience', relationship: 'REQUIRES', description: 'Moyens héliportés et fluviaux pour le transport d\'urgence de malades.' },
      { targetSector: 'education', relationship: 'PROVIDES', description: 'Dépistage sanitaire des enfants regroupés dans les écoles abris.' }
    ]
  },

  // 8. TÉLÉCOMS, RÉSEAUX & CONNECTIVITÉ RÉSILIENTE
  {
    id: 'telecom',
    code: 'SEC-TEL',
    title: 'Télécommunications, Réseaux Tactiques & Connectivité Résiliente',
    shortName: 'Télécoms & Connectivité',
    badge: '📡 CONNECTIVITÉ VITALE',
    category: 'INFRASTRUCTURE',
    leadMinistry: 'Ministère de la Communication, des Télécommunications et du Numérique (ARTP)',
    legalMandate: 'Plan de Continuité des Télécommunications d\'Urgence (PCTU), Convention de Tampere (UIT).',
    missionOverview: 'Maintien de la couverture GSM/4G/5G, résilience des backbones de fibre optique, déploiement des liaisons satellitaires tactiques (VSAT/Starlink) et réseaux radio HF/VHF de crise.',
    tacticalRoleInCrisis: 'Rétablissement des liaisons data pour les postes de commandement, fourniture de bornes Wi-Fi d\'urgence dans les camps de sinistrés, diffusion des SMS d\'alerte aux populations (Cell Broadcast).',
    kpis: [
      { id: 'tel-1', label: 'Pylônes GSM Hors Service (Submergés)', value: '7 Antennes', subValue: 'Sur 64 dans la zone', status: 'WARNING', trend: 'STABLE' },
      { id: 'tel-2', label: 'Coupures sur Backbone Fibre Optique', value: '1 Coupure', subValue: 'Axe Ndioum-Podor', status: 'CRITICAL', trend: 'DOWN' },
      { id: 'tel-3', label: 'Kits Satellitaires VSAT / Starlink Actifs', value: '12 Terminaux', subValue: 'PCO et centres de santé', status: 'NORMAL', trend: 'UP' },
      { id: 'tel-4', label: 'Taux de Délivrance des SMS d\'Alerte', value: '98.4%', subValue: '120 000 alertes diffusées', status: 'NORMAL', trend: 'STABLE' }
    ],
    agent: {
      agentType: 'agent_telecom',
      codename: 'NEXUS-COM',
      name: 'Agent Télécoms & Connectivité Résiliente',
      callsign: 'RELAIS-1',
      avatarIcon: 'Radio',
      specialty: 'Surveillance des Infrastructures Réseau, Routage Satellitaire d\'Urgence, Diffusion Cell Broadcast',
      doctrineSource: 'Convention de Tampere sur les Télécommunications d\'Urgence, Plan National de Secours Télécom ARTP',
      operationalMissions: [
        'Diagnostic en temps réel de l\'état de marche des stations de base cellulaires (BTS).',
        'Bascule automatique du trafic voix/données vers les faisceaux hertziens redondants.',
        'Déploiement des valises satellitaires légères pour les équipes de sauvetage isolées.',
        'Coordination avec les opérateurs mobiles (Orange, Free, Expresso) pour roaming de crise gratuit.'
      ],
      autonomousCapabilities: [
        'Modélisation de la zone de couverture radio résiduelle post-extinction de pylônes.',
        'Priorisation de la bande passante pour le C2 militaire et les flux médicaux.',
        'Déclenchement géofencé des alertes Cell Broadcast en multilingue.'
      ],
      dataSensors: ['Supervision réseau des opérateurs télécoms (NOC)', 'Télémétrie constellations LEO/GEO', 'Capteurs d\'alimentation solaire des BTS'],
      currentAssessment: 'Rupture de la fibre optique souterraine suite à un affouillement au niveau du pont de Navel. Bascule réussie sur liaison hertzienne de secours (débit bridé à 60%).',
      recommendedDirectives: [
        {
          id: 'dir-tel-01',
          code: 'TEL-ORD-01',
          title: 'Déploiement de 4 terminaux satellitaires tactiques à Guédé et Démette',
          priority: 'URGENT',
          description: 'Fourniture de liaisons data haut débit autonomes sur batterie pour le PCO et les centres de soins isolés.',
          targetEntity: 'ARTP / Opérateurs Télécoms / SENUM SA',
          leadTimeHours: 3,
          intersectorImpact: 'Rétablit les transmissions médicales et de commandement.',
          status: 'PROPOSED'
        },
        {
          id: 'dir-tel-02',
          code: 'TEL-ORD-02',
          title: 'Activation du Roaming National Gratuit d\'Urgence',
          priority: 'HIGH',
          description: 'Autorisation accordée à tout abonné mobile de se connecter à n\'importe quel réseau disponible dans la zone de crue.',
          targetEntity: 'ARTP / Direction Générale des Opérateurs',
          leadTimeHours: 1,
          intersectorImpact: 'Permet aux citoyens d\'émettre leurs appels de détresse (18 / 15).',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'defense_resilience', relationship: 'PROVIDES', description: 'Infrastructures de communication pour la coordination opérationnelle interarmées.' },
      { targetSector: 'energy', relationship: 'REQUIRES', description: 'Alimentation secourue pour les centres de commutation et nœuds de transit.' },
      { targetSector: 'education', relationship: 'PROVIDES', description: 'Accès Internet aux abris scolaires pour rassurer les familles déplacées.' }
    ]
  },

  // 9. ÉDUCATION, ÉTABLISSEMENTS SCOLAIRES & ABRIS D'URGENCE
  {
    id: 'education',
    code: 'SEC-EDU',
    title: 'Éducation, Établissements Scolaires & Abris Temporaires',
    shortName: 'Éducation & Abris',
    badge: '🎓 PROTECTION & CONTINUITÉ',
    category: 'SOCIAL_HUMAN',
    leadMinistry: 'Ministère de l\'Éducation Nationale (IA / IEF Podor & Matam)',
    legalMandate: 'Loi d\'Orientation de l\'Éducation Nationale, Protocole Interministériel d\'Usage des Écoles en Crise.',
    missionOverview: 'Gestion de la réquisition temporaire des écoles comme centres d\'accueil pour les familles sinistrées, protection de l\'enfance, sauvegarde du matériel pédagogique et organisation de la continuité scolaire.',
    tacticalRoleInCrisis: 'Recensement des salles de classe émergées, cohabitation ordonnée entre accueil des déplacés et scolarité, cantines scolaires d\'urgence et mise en place de classes provisoires sous tente.',
    kpis: [
      { id: 'edu-1', label: 'Écoles Réquisitionnées en Abris', value: '28 Écoles', subValue: 'Hébergeant 8 400 sinistrés', status: 'WARNING', trend: 'UP' },
      { id: 'edu-2', label: 'Écoles Partiellement Inondées', value: '19 Bâtiments', subValue: 'Cours intérieures sous l\'eau', status: 'CRITICAL', trend: 'UP' },
      { id: 'edu-3', label: 'Élèves Temporairement Déscolarisés', value: '14 500 Élèves', subValue: 'Attente de solution modulaire', status: 'WARNING', trend: 'UP' },
      { id: 'edu-4', label: 'Kits Scolaires d\'Urgence Disponibles', value: '8 000 Kits', subValue: 'Stock UNICEF / MEN', status: 'NORMAL', trend: 'STABLE' }
    ],
    agent: {
      agentType: 'agent_education',
      codename: 'MINERVA-EDU',
      name: 'Agent Éducation & Continuité Scolaire',
      callsign: 'PAGODE-1',
      avatarIcon: 'GraduationCap',
      specialty: 'Gestion des Abris Scolaires, Protection des Enfants en Crise, Continuité des Apprentissages',
      doctrineSource: 'Standards Minimums INEE pour l\'Éducation en Situations d\'Urgence, Protocole MEN de Gestion des Abris',
      operationalMissions: [
        'Suivi rigoureux de l\'état d\'occupation des salles de classe réquisitionnées.',
        'Mise en place d\'espaces amis des enfants (EAE) pour soutien psycho-social.',
        'Planification du calendrier de libération des écoles avec remise en état sanitaire (désinfection).',
        'Diffusion de cours radiophoniques et livrets d\'auto-apprentissage pendant la fermeture des classes.'
      ],
      autonomousCapabilities: [
        'Calcul du ratio d\'occupation par mètre carré pour éviter la surpopulation des classes-abris.',
        'Planification de la réouverture échelonnée des collèges et lycées pour les examens d\'État.',
        'Coordination logistique de l\'acheminement des cantines scolaires solidaires.'
      ],
      dataSensors: ['Réseau des Inspections d\'Académie (IA)', 'Base SIG des infrastructures scolaires MEN', 'Données Croix-Rouge gestion de camp'],
      currentAssessment: 'Le lycée de Podor accueille 1 200 personnes déplacées. Risque de dégradation des laboratoires et sanitaires. Nécessité de basculer vers un camp de toiles viabilisé sous 10 jours.',
      recommendedDirectives: [
        {
          id: 'dir-edu-01',
          code: 'EDU-ORD-01',
          title: 'Désinfection et libération de 10 écoles avant la reprise des cours',
          priority: 'HIGH',
          description: 'Nettoyage des boues, chaulage des murs et chloration des blocs sanitaires dès le repli des eaux.',
          targetEntity: 'Service Régional d\'Hygiène / Inspection d\'Académie',
          leadTimeHours: 48,
          intersectorImpact: 'Permet le retour en classe de 4 500 élèves.',
          status: 'PROPOSED'
        },
        {
          id: 'dir-edu-02',
          code: 'EDU-ORD-02',
          title: 'Mise en place de 20 tentes-classes provisoires UNICEF',
          priority: 'MEDIUM',
          description: 'Installation d\'espaces pédagogiques modulaires hors d\'eau pour maintenir l\'enseignement primaire.',
          targetEntity: 'Inspection de l\'Éducation et de la Formation (IEF) / UNICEF',
          leadTimeHours: 72,
          intersectorImpact: 'Protège les enfants contre l\'oisiveté et les noyades aux abords des crues.',
          status: 'PROPOSED'
        }
      ]
    },
    intersectoralSynergies: [
      { targetSector: 'territory', relationship: 'CONFLICT_ARBITRATION', description: 'Arbitrage entre garder les écoles ouvertes ou les réquisitionner pour abriter les sinistrés.' },
      { targetSector: 'health', relationship: 'PROVIDES', description: 'Points d\'accès pour les campagnes vaccinales et distributions de moustiquaires aux enfants.' },
      { targetSector: 'defense_resilience', relationship: 'REQUIRES', description: 'Sécurisation des périmètres scolaires hébergeant des réfugiés.' }
    ]
  }
];

export class MultisectoralRegistryService {
  private sectors: MultisectoralSector[] = [...MULTISECTORAL_SECTORS];

  public getAllSectors(): MultisectoralSector[] {
    return this.sectors;
  }

  public getSectorById(id: SectorType): MultisectoralSector | undefined {
    return this.sectors.find(s => s.id === id);
  }

  public async approveDirective(
    sectorId: SectorType,
    directiveId: string,
    currentUser: UserProfile
  ): Promise<{ success: boolean; hashSha256: string }> {
    const sector = this.getSectorById(sectorId);
    if (!sector) throw new Error(`Sector ${sectorId} not found`);

    const directive = sector.agent.recommendedDirectives.find(d => d.id === directiveId);
    if (!directive) throw new Error(`Directive ${directiveId} not found`);

    directive.status = 'APPROVED';

    // Log in Sovereign SHA-256 Audit Ledger
    const record = await auditLedger.logAction(
      currentUser,
      `MULTISECTORAL_DIRECTIVE_APPROVED_${sector.code}_${directive.code}`,
      sectorId,
      {
        directiveId: directive.id,
        directiveCode: directive.code,
        title: directive.title,
        targetEntity: directive.targetEntity,
        priority: directive.priority,
        leadTimeHours: directive.leadTimeHours,
        intersectorImpact: directive.intersectorImpact
      },
      ['doc-plan-orsec-evac-sanitaire'],
      [],
      45,
      'QARVYEN Multisectoral Engine'
    );

    return { success: true, hashSha256: record.hashSha256 };
  }
}

export const multisectoralRegistry = new MultisectoralRegistryService();
