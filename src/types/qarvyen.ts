/**
 * QARVYEN 2.0 — Sovereign Intelligence for Complex Worlds
 * Multisectoral Core Types & Data Contracts
 */

export type UserRole = 'admin' | 'analyst' | 'auditor' | 'operator';

export type SecurityClearance = 'PUBLIC' | 'DIFFUSION_RESTREINTE' | 'CONFIDENTIEL_DEFENSE' | 'SECRET_DEFENSE';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  clearance: SecurityClearance;
  activeWorkspace: string;
  sovereignEnclave: boolean;
}

export type SectorType =
  | 'flood'
  | 'health'
  | 'agriculture'
  | 'energy'
  | 'defense_resilience'
  | 'territory'
  | 'livestock'
  | 'economy'
  | 'telecom'
  | 'education'
  | 'multisectoral';

// --- COPERNICUS & SENTINEL-1 SAR TYPES ---

export type OrbitDirection = 'ASCENDING' | 'DESCENDING';
export type Polarization = 'VV' | 'VH' | 'VV+VH';
export type SpeckleFilter = 'Lee' | 'Refined_Lee' | 'Gamma_MAP' | 'None';
export type CalibrationMode = 'sigma0' | 'gamma0';

export interface Sentinel1Scene {
  id: string;
  title: string;
  footprint: [number, number][]; // Polygon coords [lon, lat]
  centroid: [number, number]; // [lon, lat]
  acquisitionDate: string;
  polarization: Polarization;
  orbitDirection: OrbitDirection;
  relativeOrbitNumber: number;
  platform: 'Sentinel-1A' | 'Sentinel-1B' | 'Sentinel-1C';
  instrument: 'C-SAR';
  mode: 'IW';
  productType: 'GRD';
  quicklookUrl: string;
  isSynthetic: boolean;
  dataSourceLabel: string;
  resolutionMeters: number;
  sceneSizeKm: [number, number];
}

export interface SARProcessingConfig {
  polarization: 'VV' | 'VH';
  speckleFilter: SpeckleFilter;
  filterWindowSize: number;
  backscatterCalibration: CalibrationMode;
  thresholdMethod: 'Otsu' | 'Bimodal_Valley' | 'Fixed_Decibel';
  thresholdDb: number;
  minWaterClusterSizeHa: number;
  useDemExclusion: boolean;
  maxSlopeDegrees: number;
}

export type DataExecutionMode = 'REAL_DATA' | 'SYNTHETIC_DEMO';

export type SystemDataStatus = 'REAL_DATA_READY' | 'REAL_DATA_UNAVAILABLE' | 'SYNTHETIC_DEMO';

export interface RasterGeoTransform {
  crs: string; // e.g. "EPSG:4326 (WGS84)" or "EPSG:32628 (UTM Zone 28N)"
  pixelSizeXDeg: number;
  pixelSizeYDeg: number;
  measuredResolutionMeters: number;
  affineMatrix: [number, number, number, number, number, number];
  dimensions: [number, number]; // [cols, rows]
  totalPixelCount: number;
  floodedPixelCount: number;
  pixelAreaM2: number;
  pixelAreaKm2: number;
  geotiffVerified: boolean;
  nativeXResolution?: number;
  nativeYResolution?: number;
  noDataValue?: number | null;
}

export interface WorldPopMetadata {
  source: string;
  layerTitle: string;
  year: number;
  resolution: string;
  projection: string;
  version: string;
  doi: string;
  url: string;
  methodology: string;
  zonalSumExact: number;
  fileName?: string;
  fileSha256?: string;
}

export interface OsmMappedAsset extends CriticalAsset {
  osmId: string;
  osmType: 'node' | 'way' | 'relation';
  osmTags: Record<string, string>;
  distanceToFloodEdgeMeters: number;
}

export interface OsmInfrastructureMetadata {
  source: string;
  attributionLicense: string;
  osmQueryTimestamp: string;
  totalMappedAssetsInBbox: number;
  threatenedAssetsCount: number;
}

export interface CriticalAsset {
  id: string;
  name: string;
  type: 'hospital' | 'dike' | 'pumping_station' | 'power_substation' | 'school' | 'bridge';
  coordinates: [number, number]; // [lat, lon]
  elevationM: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'SAFE';
  operationalStatus: 'NORMAL' | 'THREATENED' | 'FLOODED' | 'EVACUATING';
  capacity?: number;
  notes: string;
  osmId?: string;
  osmTags?: Record<string, string>;
}

export interface RasterGridData {
  width: number;
  height: number;
  bounds: {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
  };
  floodedCells: number[][]; // 2D 0 or 1
  permanentWaterCells: number[][]; // 2D 0 or 1
  differenceDbCells: number[][]; // 2D float values (e.g. -6.5 dB)
  demAltitudeCells: number[][]; // 2D elevation meters
  populationDensityGrid?: number[][]; // Population per cell from WorldPop
}

export interface FloodAnalysisResult {
  analysisId: string;
  executionMode: DataExecutionMode;
  systemStatus: SystemDataStatus;
  errorMessage?: string;
  timestamp: string;
  regionName: string;
  preScene: Sentinel1Scene;
  postScene: Sentinel1Scene;
  config: SARProcessingConfig;
  rasterGrid: RasterGridData;
  floodedAreaKm2: number;
  permanentWaterAreaKm2: number;
  affectedPopulationEst: number;
  criticalAssetsAtRisk: CriticalAsset[];
  isRealCopernicusData: boolean;
  dataProvenance: string;
  executionDurationMs: number;
  computeBackendUsed: string;
  copernicusODataQueryUrl?: string;
  copernicusJobId?: string;
  geoTiffFileSha256?: string;
  worldPopFileSha256?: string;
  openEoProcessGraph?: Record<string, unknown>;
  hashSha256: string;
  // Rigorous geospatial metadata
  geoTransform?: RasterGeoTransform;
  worldPopMeta?: WorldPopMetadata;
  osmMeta?: OsmInfrastructureMetadata;
  dataConfidenceAndLimitations: {
    confidenceScorePercent: number;
    provenanceLabel: string;
    limitations: string[];
  };
}

// --- SIMULATION SCENARIO ---

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  waterLevelRiseM: number;
  dikeBreach: boolean;
  dikeBreachLocation?: [number, number];
  rainfallMm24h: number;
  upstreamDischargeM3s: number;
  timeStepHours: number;
  totalDurationHours: number;
}

export interface SimulationStepResult {
  hour: number;
  totalFloodedKm2: number;
  newlyThreatenedAssets: CriticalAsset[];
  waterDepthMeanM: number;
  evacuationReadinessPercent: number;
  summary: string;
}

// --- MULTI-AGENT SYSTEM ---

export type AgentType =
  | 'orchestrator'
  | 'data'
  | 'knowledge'
  | 'satellite'
  | 'simulation'
  | 'governance'
  | 'agent_defense'
  | 'agent_energy'
  | 'agent_agriculture'
  | 'agent_livestock'
  | 'agent_economy'
  | 'agent_territory'
  | 'agent_health'
  | 'agent_telecom'
  | 'agent_education';

export type OrchestrationStep =
  | 'retrieve'
  | 'ground'
  | 'analyze'
  | 'simulate'
  | 'explain'
  | 'audit';

export interface RagSourceCitation {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  excerpt: string;
  page?: number;
  relevanceScore: number;
  classification: SecurityClearance;
}

export interface AgentLogMessage {
  id: string;
  agent: AgentType;
  step: OrchestrationStep;
  title: string;
  content: string;
  timestamp: string;
  status: 'info' | 'success' | 'warning' | 'critical';
  ragSourcesCited?: RagSourceCitation[];
  artifacts?: {
    label: string;
    type: 'raster' | 'vector' | 'hash' | 'chart' | 'json';
    data: unknown;
  }[];
}

// --- RAG KNOWLEDGE SYSTEM ---

export interface RagDocument {
  id: string;
  title: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;
  sizeBytes: number;
  category: 'doctrine' | 'legal' | 'technical_manual' | 'local_risk_plan';
  classification: SecurityClearance;
  chunksCount: number;
  indexed: boolean;
  summary: string;
}

export interface RagChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  text: string;
  page?: number;
  section?: string;
  tags?: string[];
  embeddingVector?: number[]; // Vector dimensions
}

// --- HARDWARE BENCHMARK & GPU ---

export type HardwareBackend = 'CUDA' | 'ROCm' | 'Apple_Metal' | 'CPU_MultiThread';

export interface BenchmarkMetrics {
  deviceName: string;
  backend: HardwareBackend;
  driverVersion?: string;
  vendor: string;
  tensorShape: string;
  iterations: number;
  executionTimeMs: number;
  throughputGflops: number;
  memoryBandwidthGbps: number;
  status: 'idle' | 'running' | 'completed' | 'failed';
  timestamp: string;
  details: string;
}

// --- HEALTH MULTISECTORAL MODULE ---

export interface HospitalNode {
  id: string;
  name: string;
  location: [number, number]; // [lat, lon]
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  occupiedIcuBeds: number;
  staffOnDuty: number;
  ambulancesAvailable: number;
  generatorAutonomyHours: number;
  floodRisk: 'SAFE' | 'ALERT' | 'EVACUATING' | 'SUBMERGED';
  assignedPatientsFromCrisis: number;
}

export interface PatientReallocationPlan {
  id: string;
  sourceHospitalId: string;
  sourceHospitalName: string;
  targetHospitalId: string;
  targetHospitalName: string;
  patientCount: number;
  category: 'ICU_REANIMATION' | 'ACUTE_SURGICAL' | 'PEDIATRICS' | 'STANDARD_MEDICINE';
  evacuationRoute: 'ROAD_DIRECT' | 'ROAD_DETOUR_FLOOD' | 'AMPHIBIOUS_VESSEL' | 'HELICOPTER';
  distanceKm: number;
  etaMinutes: number;
  riskAssessment: string;
}

// --- GOVERNANCE & AUDIT ---

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  clearance: SecurityClearance;
  action: string;
  sector: SectorType;
  parameters: Record<string, unknown>;
  ragDocsUsed: string[];
  copernicusSceneIds: string[];
  executionTimeMs: number;
  hardwareBackend: string;
  hashSha256: string;
  previousHashSha256: string;
  status: 'VERIFIED' | 'FLAGGED';
}

export interface RealExecutionAuditRecord {
  processingId: string;
  timestamp: string;
  executionMode: 'REAL_DATA';
  systemStatus: 'REAL_DATA_READY' | 'REAL_DATA_UNAVAILABLE';
  success: boolean;
  failureReason?: string;
  sourcesVerified: {
    copernicus: {
      available: boolean;
      jobId?: string;
      fileOnDisk?: string;
      sha256?: string;
    };
    worldpop: {
      available: boolean;
      fileOnDisk?: string;
      sha256?: string;
      doi?: string;
    };
    osm: {
      available: boolean;
      diskResponsePath?: string;
      rawSha256?: string;
      assetsCount: number;
    };
  };
}

// --- OMVS HYDROLOGICAL COUPLING TYPES ---

export interface OmvsStation {
  id: string;
  name: string;
  river: string;
  type: 'dam' | 'gauge_station' | 'hydropower';
  coordinates: [number, number]; // [lat, lon]
  currentLevelM: number; // Cote actuelle en m IGN
  normalRetentionLevelM: number;
  alertLevelM: number; // Cote d'alerte
  dangerLevelM: number; // Cote de débordement
  inflowRateM3s: number; // Débit entrant m3/s
  outflowRateM3s: number; // Débit sortant/lâché m3/s
  spillwayGatesOpen?: string; // ex: "7 / 7 vannes"
  trend: 'RISING' | 'STABLE' | 'FALLING';
  trendRateM24h: number; // ex: +0.25 m/24h
  alertStatus: 'GREEN_NORMAL' | 'YELLOW_VIGILANCE' | 'ORANGE_ALERT' | 'RED_DANGER';
  storageRatePercent?: number; // Pourcentage remplissage retenue
  lastUpdated: string;
  operationalNotes: string;
}

export interface OmvsBasinHydrology {
  timestamp: string;
  globalAlertStatus: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  activeAlertCount: number;
  totalOutflowM3s: number;
  manantaliDischargeM3s: number;
  wavePropagationEstimateDays: {
    manantaliToBakel: number;
    bakelToMatam: number;
    matamToPodor: number;
    podorToDiama: number;
  };
  stations: OmvsStation[];
}

// --- SITREP CRISIS BULLETIN & ETAT-MAJOR REPORT ---

export interface SitrepReport {
  id: string;
  bulletinNumber: string;
  timestamp: string;
  clearance: SecurityClearance;
  issuerAuthority: string;
  territoryName: string;
  crisisLevel: 'VIGILANCE' | 'PRE-ALERTE' | 'CATASTROPHE_NATIONALE';
  summaryMetrics: {
    floodedAreaKm2: number;
    affectedPopulationEst: number;
    criticalAssetsAtRiskCount: number;
    activeEvacuationCount: number;
    highestOmvsAlertStation: string;
  };
  omvsHydrologySummary: {
    manantaliDischargeM3s: number;
    bakelLevelM: number;
    matamLevelM: number;
    podorLevelM: number;
    alertStatus: string;
  };
  threatenedAssets: CriticalAsset[];
  tacticalDirectives: {
    bnspCivilProtection: string[];
    cousHealth: string[];
    saedAgriculture: string[];
    senelecEnergy: string[];
  };
  evacuationCorridors: {
    axisName: string;
    status: 'OPEN' | 'COMPROMISED' | 'FLOODED';
    safetyNotes: string;
  }[];
  integritySha256: string;
}
