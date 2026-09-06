export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface MarineWeather {
  live: boolean;
  source: string;
  oceanCurrent: {
    velocityKts: number;
    directionDeg: number;
  };
  wind: {
    speedKts: number;
    directionDeg: number;
  };
  wave: {
    heightM: number;
  };
  seaWaterTempC: number;
  airTempC: number;
  pressureHpa: number;
  timestamp: string;
}

export interface Incident {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  spillAreaKm2: number;
  detectionUtc: string;
  status: 'INVESTIGATING' | 'ATTRIBUTED' | 'MONITORING' | 'CLOSED';
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  estimatedVolumeM3: number;
  estimatedVolumeBarrels: number;
  oilType: string;
  sensor: string;
  satelliteProvider: string;
  resolutionM: number;
}

export interface SlickDetection {
  id: string;
  incidentId: string;
  spillCentroid: GeoPoint;
  spillAreaKm2: number;
  polygon: GeoPoint[];
  thicknessUm: string;
  estimatedVolumeM3: number;
  confidence: number;
  sensor: string;
  polarization: string;
  lookAlikeScores: {
    algalBloom: number;
    biogenicFilm: number;
    lowWindShelter: number;
    internalWaves: number;
    overallRejectionConfidence: number;
  };
  isConfirmedMineralOil: boolean;
}

export interface DriftParticle {
  lat: number;
  lng: number;
  timestamp: string;
  hourOffset: number;
  probability: number;
}

export interface DriftRun {
  incidentId: string;
  type: 'BACKWARD' | 'FORWARD';
  startUtc: string;
  endUtc: string;
  durationHours: number;
  originEllipse?: {
    center: GeoPoint;
    semiMajorKm: number;
    semiMinorKm: number;
    orientationDeg: number;
    probableReleaseWindowStart: string;
    probableReleaseWindowEnd: string;
  };
  particles: DriftParticle[];
  trajectories: GeoPoint[][];
  shorelineImpactRisk?: {
    atRisk: boolean;
    nearestCoastKm: number;
    estimatedLandfallUtc?: string;
    sensitiveZones: string[];
  };
}

export interface AisGap {
  startTime: string;
  endTime: string;
  durationHours: number;
  lastKnownPoint: GeoPoint;
  reappearancePoint: GeoPoint;
  isSuspicious: boolean;
}

export interface VesselPosition extends GeoPoint {
  timestamp: string;
  sogKts: number;
  cogDeg: number;
}

export interface Vessel {
  id: string;
  mmsi: string;
  imo: string;
  name: string;
  type: string;
  flag: string;
  destination: string;
  lengthM: number;
  beamM: number;
  draughtM: number;
  dwt: number;
  status: 'UNDER WAY' | 'AT ANCHOR' | 'MOORED' | 'DRIFTING';
  currentSpeed: number;
  currentHeading: number;
  positions: VesselPosition[];
  aisGaps: AisGap[];
  behaviorNotes: string[];
  dataQuality: number;
}

export interface CandidateSuspect {
  id: string;
  incidentId: string;
  rank: number;
  vessel: Vessel;
  score: number;
  confidence: number;
  status: 'PRIME_SUSPECT' | 'POTENTIAL_SOURCE' | 'PERSON_OF_INTEREST' | 'CLEARED';
  minDistanceToOriginKm: number;
  trajectoryAlignmentDeg: number;
  presentDuringReleaseWindow: boolean;
  timeOfClosestApproachUtc: string;
  factors: {
    proximityScore: number;
    trajectoryScore: number;
    behaviorScore: number;
    gapScore: number;
  };
  explanation: string[];
  isDarkVessel: boolean;
}

export interface EvidenceEvent {
  id: string;
  timestamp: string;
  type: 'SATELLITE_PASS' | 'AIS_PING' | 'AIS_GAP_START' | 'AIS_GAP_END' | 'CLOSEST_APPROACH' | 'SLICK_DRIFT' | 'AI_FORENSIC_FLAG';
  title: string;
  description: string;
  severity: 'info' | 'warn' | 'alert' | 'critical';
  source: string;
  coordinates?: GeoPoint;
}

export interface PipelineStage {
  stage: string;
  label: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LIVE' | 'STANDBY';
  confidence: number;
  source: string;
  timestamp: string;
}

export interface ScoringWeights {
  proximity: number;
  trajectory: number;
  behavior: number;
  gap: number;
}

export type ActiveTab =
  | 'tracker'
  | 'detection'
  | 'drift'
  | 'ais'
  | 'suspects'
  | 'evidence'
  | 'compare'
  | 'reports'
  | 'sources'
  | 'status';
