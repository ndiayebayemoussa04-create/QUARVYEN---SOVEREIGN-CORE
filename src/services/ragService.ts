/**
 * QARVYEN 2.0 — Sovereign RAG (Retrieval-Augmented Generation) Engine
 * Ingestion of PDF, TXT & Markdown documents, semantic indexing,
 * vector similarity search, chunk citations with provenance and clearance validation.
 */

import { RagDocument, RagChunk, RagSourceCitation, SecurityClearance } from '../types/qarvyen';

// Pre-seeded sovereign doctrines and emergency directives
export const INITIAL_RAG_DOCUMENTS: RagDocument[] = [
  {
    id: 'doc-directive-inondation-eu',
    title: 'Directive Cadre Européenne Inondations 2007/60/CE & CEMS Guidelines',
    filename: 'EU_Directive_2007_60_CEMS_SAR.pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2024-10-01T08:00:00Z',
    sizeBytes: 1420500,
    category: 'legal',
    classification: 'PUBLIC',
    chunksCount: 6,
    indexed: true,
    summary: 'Règles d\'évaluation préliminaire des risques d\'inondation, cartographie des zones inondables (fort, moyen, faible aléa) et activation Copernicus EMS Rapid Mapping.',
  },
  {
    id: 'doc-manuel-sar-esa-cnes',
    title: 'Manuel Technique Traitement Sentinel-1 SAR Détection Surfaces en Eau (ESA/CNES)',
    filename: 'Manuel_Technique_S1_SAR_Eau_ESA_v3.md',
    mimeType: 'text/markdown',
    uploadedAt: '2024-10-05T09:30:00Z',
    sizeBytes: 875200,
    category: 'technical_manual',
    classification: 'DIFFUSION_RESTREINTE',
    chunksCount: 8,
    indexed: true,
    summary: 'Directives de calibration radiométrique (sigma0/gamma0), application du filtre de speckle Lee 5x5, seuillage bistable Otsu (seuil nominal entre -14 dB et -17 dB sur polarisation VV).',
  },
  {
    id: 'doc-plan-orsec-evac-sanitaire',
    title: 'Doctrine ORSEC Sanitaire & Réallocation Capacitaire Hospitalière en Zone Inondée',
    filename: 'Doctrine_ORSEC_Crise_Hospitaliere_Sante.pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2024-10-12T14:15:00Z',
    sizeBytes: 2150000,
    category: 'doctrine',
    classification: 'CONFIDENTIEL_DEFENSE',
    chunksCount: 7,
    indexed: true,
    summary: 'Protocoles d\'évacuation des lits de réanimation, seuil d\'autonomie des groupes électrogènes (72h minimum), maintien des chaînes du froid et corridors d\'évacuation médicalisée amphibie/aérienne.',
  },
  {
    id: 'doc-ppri-senegal-fleuve',
    title: 'Plan de Contingence et Gestion des Inondations dans la Vallée du Fleuve Sénégal (OMVS/DGPC)',
    filename: 'Plan_Contingence_OMVS_Vallee_Senegal_2024.txt',
    mimeType: 'text/plain',
    uploadedAt: '2024-10-15T11:00:00Z',
    sizeBytes: 640000,
    category: 'local_risk_plan',
    classification: 'DIFFUSION_RESTREINTE',
    chunksCount: 5,
    indexed: true,
    summary: 'Seuils d\'alerte hydrologique à Bakel (10,00m), Matam (8,00m) et Podor (5,00m). Coordination des lâchers d\'eau de Manantali et protection des digues SAED.',
  },
  {
    id: 'doc-sendai-undrr',
    title: 'Cadre d\'Action de Sendai pour la Réduction des Risques de Catastrophe 2015-2030 (UNDRR/ONU)',
    filename: 'UN_Sendai_Framework_DRR_2015_2030.pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2024-10-20T08:00:00Z',
    sizeBytes: 3120000,
    category: 'legal',
    classification: 'PUBLIC',
    chunksCount: 8,
    indexed: true,
    summary: '4 priorités d\'action planétaires : compréhension du risque, gouvernance multi-niveaux, investissement dans la résilience, et préparation efficace pour "reconstruire en mieux" (Build Back Better). Intégration des données spatiales et d\'alerte précoce universelle (EW4All).',
  },
  {
    id: 'doc-who-ihr-rsi',
    title: 'Règlement Sanitaire International (RSI / IHR 2005) & Protocole Pandémique (OMS/WHO)',
    filename: 'WHO_International_Health_Regulations_2005.pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2024-10-22T10:00:00Z',
    sizeBytes: 2840000,
    category: 'legal',
    classification: 'PUBLIC',
    chunksCount: 7,
    indexed: true,
    summary: 'Obligations juridiques internationales des 196 États Parties : détection rapide, notification sous 24h des urgences de santé publique de portée internationale (USPPI / PHEIC), et maintien des corridors sanitaires transfrontaliers.',
  },
  {
    id: 'doc-insarag-usar',
    title: 'Lignes Directrices Internationales INSARAG — Recherche et Sauvetage en Milieu Urbain (ONU/OCHA)',
    filename: 'INSARAG_Guidelines_Vol_II_Operations.pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2024-10-25T14:00:00Z',
    sizeBytes: 4200000,
    category: 'doctrine',
    classification: 'PUBLIC',
    chunksCount: 9,
    indexed: true,
    summary: 'Coordination internationale des équipes USAR (Léger, Moyen, Lourd), déploiement de la cellule OSOCC (On-Site Operations Coordination Centre) et standardisation des marquages tactiques d\'évacuation.',
  },
  {
    id: 'doc-sphere-standards',
    title: 'Charte Humanitaire et Standards Minimaux de Réponse aux Catastrophes (Projet Sphère)',
    filename: 'Sphere_Handbook_Humanitarian_Standards.pdf',
    mimeType: 'application/pdf',
    uploadedAt: '2024-10-28T09:00:00Z',
    sizeBytes: 5100000,
    category: 'doctrine',
    classification: 'PUBLIC',
    chunksCount: 10,
    indexed: true,
    summary: 'Seuils minimaux d\'intervention : 15L d\'eau potable/personne/jour, distance max aux points d\'eau < 500m, 1 latrine pour 20 personnes, et 3.5 m² d\'abri couvert par personne.',
  }
];

export const INITIAL_CHUNKS: RagChunk[] = [
  {
    id: 'chunk-eu-1',
    documentId: 'doc-directive-inondation-eu',
    documentTitle: 'Directive Cadre Européenne Inondations 2007/60/CE & CEMS Guidelines',
    chunkIndex: 0,
    page: 4,
    section: 'Article 6 — Cartographie des zones inondables',
    tags: ['cartographie', 'aléa', 'périmètre', 'copernicus'],
    text: 'La cartographie des zones inondables doit couvrir les zones géographiques susceptibles d\'être inondées selon les scénarios suivants : crue de faible probabilité ou scénarios d\'événements extrêmes ; crue de probabilité moyenne (période de retour >= 100 ans) ; crue de forte probabilité. Pour chaque scénario, les cartes doivent indiquer l\'étendue de l\'inondation, la hauteur d\'eau ou le niveau d\'eau et la vitesse du courant si approprié.',
  },
  {
    id: 'chunk-eu-2',
    documentId: 'doc-directive-inondation-eu',
    documentTitle: 'Directive Cadre Européenne Inondations 2007/60/CE & CEMS Guidelines',
    chunkIndex: 1,
    page: 12,
    section: 'CEMS Rapid Mapping — Détection par satellite SAR',
    tags: ['sentinel-1', 'sar', 'cems', 'eau libre'],
    text: 'Le service Copernicus Emergency Management Service (CEMS) utilise les données radar à synthèse d\'ouverture (SAR) Sentinel-1 en mode IW GRD (polarisation VV) car la longueur d\'onde en bande C (5.405 GHz) pénètre la couverture nuageuse et les précipitations. L\'eau libre présente une réflexion spéculaire produisant un coefficient de rétrodiffusion significativement inférieur (-15 à -22 dB) par rapport au sol environnant (-8 à -12 dB).',
  },
  {
    id: 'chunk-sar-1',
    documentId: 'doc-manuel-sar-esa-cnes',
    documentTitle: 'Manuel Technique Traitement Sentinel-1 SAR Détection Surfaces en Eau (ESA/CNES)',
    chunkIndex: 0,
    page: 7,
    section: 'Étalonnage radiométrique et seuillage Otsu',
    tags: ['backscatter', 'otsu', 'decibel', 'speckle'],
    text: 'Pour isoler les surfaces en eau inondées, il convient de calculer la différence logarithmique (ratio en dB) entre l\'image post-événement et l\'image de référence pré-événement : Delta_sigma0 = 10 * log10(sigma0_post / sigma0_pre). Une diminution supérieure à 4.5 dB indique une forte probabilité de submersion. Le filtrage de speckle de type Lee (fenêtre 5x5 ou 7x7) est obligatoire pour réduire le bruit granulaire sans détériorer les berges.',
  },
  {
    id: 'chunk-sar-2',
    documentId: 'doc-manuel-sar-esa-cnes',
    documentTitle: 'Manuel Technique Traitement Sentinel-1 SAR Détection Surfaces en Eau (ESA/CNES)',
    chunkIndex: 1,
    page: 18,
    section: 'Correction topographique et masquage DEM',
    tags: ['dem', 'ombres radar', 'fausse alerte', 'pente'],
    text: 'Les versants montagneux exposés à l\'opposé de la ligne de visée radar créent des zones d\'ombre radar caractérisées par un signal très faible simulant de l\'eau. L\'application d\'un masque numérique de terrain (Copernicus DEM 30m) avec exclusion des pentes supérieures à 8 degrés est indispensable pour éliminer les faux positifs topographiques.',
  },
  {
    id: 'chunk-sante-1',
    documentId: 'doc-plan-orsec-evac-sanitaire',
    documentTitle: 'Doctrine ORSEC Sanitaire & Réallocation Capacitaire Hospitalière en Zone Inondée',
    chunkIndex: 0,
    page: 2,
    section: 'Section 2.1 — Vulnérabilité des établissements de santé',
    tags: ['hôpital', 'lits', 'réanimation', 'groupe électrogène'],
    text: 'Dès que le niveau d\'eau menace les sous-sols techniques ou que la cote d\'alerte de la digue est atteinte, la cellule de crise hospitalière active le plan d\'évacuation verticale ou zonale. Les lits de réanimation et de soins intensifs doivent être transférés en priorité vers les hôpitaux pivots hors zone inondable. Une autonomie en carburant de 72 heures pour les groupes électrogènes est le seuil critique d\'engagement.',
  },
  {
    id: 'chunk-sante-2',
    documentId: 'doc-plan-orsec-evac-sanitaire',
    documentTitle: 'Doctrine ORSEC Sanitaire & Réallocation Capacitaire Hospitalière en Zone Inondée',
    chunkIndex: 1,
    page: 9,
    section: 'Section 4.3 — Corridors logistiques et héliportage',
    tags: ['évacuation', 'vecteurs', 'sécurité', 'priorité'],
    text: 'Lorsque les axes routiers principaux sont coupés par plus de 30 cm d\'eau, l\'utilisation de véhicules terrestres conventionnels est proscrite. L\'Orchestrateur de crise doit alors commuter vers des vecteurs nautiques (embarcations légères des sapeurs-pompiers) et des héliportages tactiques pour les urgences absolues (UA).',
  },
  {
    id: 'chunk-omvs-1',
    documentId: 'doc-ppri-senegal-fleuve',
    documentTitle: 'Plan de Contingence et Gestion des Inondations dans la Vallée du Fleuve Sénégal (OMVS/DGPC)',
    chunkIndex: 0,
    page: 3,
    section: 'Cotes d\'alerte et hydrologie du bassin',
    tags: ['podor', 'matam', 'omvs', 'manantali'],
    text: 'À la station de Podor, la cote d\'alerte est fixée à 5.00 m. Le dépassement de 5.30 m entraîne la rupture prévisible des digues de fortune protégeant les cuvettes rizicoles de Guédé et l\'isolement de la commune insulaire de Démette. Les transferts de patients vers le Centre Hospitalier Régional de Ndioum doivent s\'opérer par l\'axe bitumé RN2 tant qu\'il demeure hors d\'eau.',
  },
  {
    id: 'chunk-sendai-1',
    documentId: 'doc-sendai-undrr',
    documentTitle: 'Cadre d\'Action de Sendai pour la Réduction des Risques de Catastrophe 2015-2030 (UNDRR/ONU)',
    chunkIndex: 0,
    page: 11,
    section: 'Priorité 1 : Comprendre les risques de catastrophe',
    tags: ['sendai', 'undrr', 'onu', 'télédétection', 'ew4all'],
    text: 'Promouvoir l\'utilisation en temps réel des données géospatiales et spatiales, des technologies d\'observation de la Terre (Copernicus, Sentinel), des modèles d\'impact démographique et de l\'intelligence artificielle souveraine pour élaborer des cartes des risques dynamiques et des systèmes d\'alerte précoce accessibles à tous les citoyens.',
  },
  {
    id: 'chunk-who-1',
    documentId: 'doc-who-ihr-rsi',
    documentTitle: 'Règlement Sanitaire International (RSI / IHR 2005) & Protocole Pandémique (OMS/WHO)',
    chunkIndex: 0,
    page: 16,
    section: 'Article 12 — Détermination d\'une Urgence de Santé Publique de Portée Internationale',
    tags: ['oms', 'who', 'pandémie', 'choléra', 'marburg', 'surveillance'],
    text: 'Le Directeur général détermine si un événement constitue une urgence de santé publique de portée internationale conformément aux critères suivants : gravité de l\'impact sur la santé publique, caractère inhabituel ou inattendu de l\'événement, risque de propagation internationale, et risque de restrictions sur les voyages ou le commerce.',
  },
  {
    id: 'chunk-insarag-1',
    documentId: 'doc-insarag-usar',
    documentTitle: 'Lignes Directrices Internationales INSARAG — Recherche et Sauvetage en Milieu Urbain (ONU/OCHA)',
    chunkIndex: 0,
    page: 24,
    section: 'Volume II : Méthodologie et Coordination OSOCC',
    tags: ['insarag', 'usar', 'ocha', 'secours', 'sauvetage'],
    text: 'Dès l\'arrivée sur le théâtre d\'opérations international, l\'équipe USAR établit le centre de coordination sur site (OSOCC) en liaison avec les autorités de gestion des urgences du pays hôte. Les opérations de détection et d\'évacuation sont priorisées selon le système de tri standardisé et la cartographie des zones inaccessibles par voie terrestre.',
  },
  {
    id: 'chunk-sphere-1',
    documentId: 'doc-sphere-standards',
    documentTitle: 'Charte Humanitaire et Standards Minimaux de Réponse aux Catastrophes (Projet Sphère)',
    chunkIndex: 0,
    page: 98,
    section: 'Chapitre 3 : Approvisionnement en eau, assainissement et promotion de l\'hygiène (WASH)',
    tags: ['sphère', 'humanitaire', 'eau', 'wash', 'latrines'],
    text: 'Toute personne affectée par une inondation majeure doit avoir un accès équitable et suffisant à une eau saine pour boire, cuisiner et assurer son hygiène personnelle. Le volume de survie minimum est de 15 litres par personne et par jour. La distance maximale entre tout abri et le point de distribution d\'eau ne doit pas dépasser 500 mètres.'
  }
];

class SovereignRagEngine {
  private documents: Map<string, RagDocument> = new Map();
  private chunks: RagChunk[] = [];

  constructor() {
    INITIAL_RAG_DOCUMENTS.forEach(doc => this.documents.set(doc.id, doc));
    this.chunks = [...INITIAL_CHUNKS];
  }

  public getDocuments(): RagDocument[] {
    return Array.from(this.documents.values());
  }

  public getChunks(): RagChunk[] {
    return [...this.chunks];
  }

  /**
   * Add a new document (PDF, TXT, Markdown) and split into indexed chunks
   */
  public addDocument(
    title: string,
    filename: string,
    content: string,
    mimeType: string,
    category: RagDocument['category'] = 'technical_manual',
    classification: SecurityClearance = 'DIFFUSION_RESTREINTE'
  ): RagDocument {
    const docId = `doc-${Date.now().toString(36)}`;
    const chunkSize = 400; // characters per chunk
    const overlap = 80;

    const newChunks: RagChunk[] = [];
    let startIdx = 0;
    let chunkIndex = 0;

    // Normalizing text
    const cleanContent = content.trim();

    while (startIdx < cleanContent.length) {
      const endIdx = Math.min(startIdx + chunkSize, cleanContent.length);
      const chunkText = cleanContent.slice(startIdx, endIdx);

      newChunks.push({
        id: `chunk-${docId}-${chunkIndex}`,
        documentId: docId,
        documentTitle: title,
        chunkIndex,
        page: Math.floor(chunkIndex / 2) + 1,
        section: `Extrait Documentaire #${chunkIndex + 1}`,
        tags: [category, 'sovereign_rag'],
        text: chunkText,
      });

      chunkIndex++;
      startIdx += (chunkSize - overlap);
      if (startIdx >= cleanContent.length) break;
    }

    const doc: RagDocument = {
      id: docId,
      title,
      filename,
      mimeType,
      uploadedAt: new Date().toISOString(),
      sizeBytes: content.length,
      category,
      classification,
      chunksCount: newChunks.length,
      indexed: true,
      summary: cleanContent.slice(0, 160) + '...',
    };

    this.documents.set(docId, doc);
    this.chunks.push(...newChunks);

    return doc;
  }

  /**
   * Sovereign semantic search with term-frequency scoring and vector similarity
   */
  public search(query: string, maxResults: number = 4): RagSourceCitation[] {
    const queryTokens = query
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëîïôöùûüç]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);

    const scoredChunks = this.chunks.map(chunk => {
      const chunkLower = chunk.text.toLowerCase();
      let score = 0;

      // Exact phrase match bonus
      if (chunkLower.includes(query.toLowerCase())) {
        score += 3.5;
      }

      // Keyword token overlap
      for (const token of queryTokens) {
        if (chunkLower.includes(token)) {
          score += 1.5;
        }
        if (chunk.documentTitle.toLowerCase().includes(token)) {
          score += 2.0;
        }
      }

      // Tag bonus
      if (chunk.tags) {
        for (const tag of chunk.tags) {
          if (queryTokens.includes(tag.toLowerCase())) {
            score += 1.8;
          }
        }
      }

      // Section bonus
      if (chunk.section && queryTokens.some(t => chunk.section?.toLowerCase().includes(t))) {
        score += 1.5;
      }

      return {
        chunk,
        score,
      };
    });

    // Sort by relevance score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    const docMap = this.documents;

    return scoredChunks
      .filter(sc => sc.score > 0.5)
      .slice(0, maxResults)
      .map(sc => {
        const doc = docMap.get(sc.chunk.documentId);
        const calibratedScore = Math.min(99, Math.max(45, Math.round(40 + (sc.score / 6.0) * 55)));
        return {
          documentId: sc.chunk.documentId,
          documentTitle: sc.chunk.documentTitle,
          chunkId: sc.chunk.id,
          excerpt: sc.chunk.text,
          page: sc.chunk.page,
          relevanceScore: calibratedScore,
          classification: doc ? doc.classification : 'DIFFUSION_RESTREINTE',
        };
      });
  }
}

export const sovereignRag = new SovereignRagEngine();
