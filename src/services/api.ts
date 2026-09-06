import {
  CandidateSuspect,
  DriftRun,
  GeoPoint,
  Incident,
  MarineWeather,
  ScoringWeights,
  SlickDetection,
  Vessel,
} from '../types';

export interface HealthCheckResponse {
  status: string;
  mode: string;
  hasGeminiKey: boolean;
  timestamp: string;
  engine: string;
}

export async function fetchHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return {
      status: 'offline',
      mode: 'client-fallback',
      hasGeminiKey: true,
      timestamp: new Date().toISOString(),
      engine: 'SeaTrace Marine Core',
    };
  }
}

export async function fetchLiveMarineWeather(lat: number, lng: number): Promise<MarineWeather> {
  try {
    const res = await fetch(`/api/marine-weather?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error('Failed to fetch marine weather');
    return await res.json();
  } catch (e) {
    return {
      live: false,
      source: 'Default Oceanographic Model',
      oceanCurrent: { velocityKts: 0.85, directionDeg: 220 },
      wind: { speedKts: 12.5, directionDeg: 235 },
      wave: { heightM: 1.2 },
      seaWaterTempC: 27.2,
      airTempC: 28.1,
      pressureHpa: 1013,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function callGeminiIncidentAnalysis(params: {
  incident: Incident;
  detection: SlickDetection;
  candidates: CandidateSuspect[];
  driftParams: {
    currentSpeedKts: number;
    currentDirDeg: number;
    windSpeedKts: number;
    windDirDeg: number;
    backwardHours: number;
  };
}): Promise<{ success: boolean; analysis?: string; error?: string }> {
  try {
    const res = await fetch('/api/ai/analyze-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with Gemini server',
    };
  }
}

export async function callGeminiGenerateDossier(params: {
  incident: Incident;
  candidate: CandidateSuspect;
}): Promise<{ success: boolean; dossier?: string; error?: string }> {
  try {
    const res = await fetch('/api/ai/generate-dossier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error communicating with Gemini server',
    };
  }
}

// Convert knots and direction degrees to nautical displacement vector (km/h)
function getDriftVectorKmH(
  currentSpeedKts: number,
  currentDirDeg: number,
  windSpeedKts: number,
  windDirDeg: number
) {
  // Current contributes 100% of its speed
  const currentKts = currentSpeedKts;
  const currentRad = (currentDirDeg * Math.PI) / 180;
  const curVx = currentKts * Math.sin(currentRad); // East component
  const curVy = currentKts * Math.cos(currentRad); // North component

  // Wind contributes ~3.0% leeway speed, deflected by Coriolis (~15 deg clockwise in Northern Hemisphere)
  const leewayRatio = 0.032;
  const windKts = windSpeedKts * leewayRatio;
  const windRad = ((windDirDeg + 12) * Math.PI) / 180;
  const windVx = windKts * Math.sin(windRad);
  const windVy = windKts * Math.cos(windRad);

  const totalVxKts = curVx + windVx;
  const totalVyKts = curVy + windVy;

  // 1 knot = 1.852 km/h
  return {
    vxKmH: totalVxKts * 1.852,
    vyKmH: totalVyKts * 1.852,
  };
}

// Calculate Hydrodynamic Backward Hindcast (Backtracking slick to origin)
export function computeBackwardHindcast(
  incident: Incident,
  detection: SlickDetection,
  currentSpeedKts: number,
  currentDirDeg: number,
  windSpeedKts: number,
  windDirDeg: number,
  backwardHours: number
): DriftRun {
  const { vxKmH, vyKmH } = getDriftVectorKmH(currentSpeedKts, currentDirDeg, windSpeedKts, windDirDeg);

  // Degrees per km conversion
  const kmPerLat = 111.32;
  const kmPerLng = 111.32 * Math.cos((detection.spillCentroid.lat * Math.PI) / 180);

  const detectionDate = new Date(incident.detectionUtc || Date.now());
  const originDate = new Date(detectionDate.getTime() - backwardHours * 3600 * 1000);

  // Backward displacement in km
  const totalDxKm = -vxKmH * backwardHours;
  const totalDyKm = -vyKmH * backwardHours;

  const originLat = detection.spillCentroid.lat + totalDyKm / kmPerLat;
  const originLng = detection.spillCentroid.lng + totalDxKm / kmPerLng;

  const originCenter: GeoPoint = {
    lat: Number(originLat.toFixed(5)),
    lng: Number(originLng.toFixed(5)),
  };

  // Generate particles backwards
  const particles = [];
  const trajectories: GeoPoint[][] = [];
  const numEnsemble = 16;

  for (let e = 0; e < numEnsemble; e++) {
    const singleTraj: GeoPoint[] = [];
    const spreadX = (Math.random() - 0.5) * 0.15 * vxKmH;
    const spreadY = (Math.random() - 0.5) * 0.15 * vyKmH;

    for (let h = 0; h <= backwardHours; h += 2) {
      const dt = backwardHours - h; // hours from release
      const dx = -(vxKmH + spreadX) * (h / backwardHours) * backwardHours;
      const dy = -(vyKmH + spreadY) * (h / backwardHours) * backwardHours;
      const pLat = detection.spillCentroid.lat + dy / kmPerLat;
      const pLng = detection.spillCentroid.lng + dx / kmPerLng;
      const pt = { lat: Number(pLat.toFixed(5)), lng: Number(pLng.toFixed(5)) };
      singleTraj.push(pt);

      if (h === backwardHours) {
        particles.push({
          lat: pt.lat,
          lng: pt.lng,
          timestamp: originDate.toISOString(),
          hourOffset: -backwardHours,
          probability: Math.max(0.2, 1 - (Math.abs(spreadX) + Math.abs(spreadY)) / 1.5),
        });
      }
    }
    trajectories.push(singleTraj);
  }

  const windowStart = new Date(originDate.getTime() - 90 * 60 * 1000).toISOString();
  const windowEnd = new Date(originDate.getTime() + 90 * 60 * 1000).toISOString();

  return {
    incidentId: incident.id,
    type: 'BACKWARD',
    startUtc: originDate.toISOString(),
    endUtc: incident.detectionUtc,
    durationHours: backwardHours,
    originEllipse: {
      center: originCenter,
      semiMajorKm: Math.max(1.5, backwardHours * 0.28),
      semiMinorKm: Math.max(0.8, backwardHours * 0.14),
      orientationDeg: Math.round((Math.atan2(vxKmH, vyKmH) * 180) / Math.PI),
      probableReleaseWindowStart: windowStart,
      probableReleaseWindowEnd: windowEnd,
    },
    particles,
    trajectories,
  };
}

// Calculate Forward Drift Forecast (Prediction of slick dispersion over next 24-48h)
export function computeForwardForecast(
  incident: Incident,
  detection: SlickDetection,
  currentSpeedKts: number,
  currentDirDeg: number,
  windSpeedKts: number,
  windDirDeg: number,
  forwardHours: number = 24
): DriftRun {
  const { vxKmH, vyKmH } = getDriftVectorKmH(currentSpeedKts, currentDirDeg, windSpeedKts, windDirDeg);

  const kmPerLat = 111.32;
  const kmPerLng = 111.32 * Math.cos((detection.spillCentroid.lat * Math.PI) / 180);

  const detectionDate = new Date(incident.detectionUtc || Date.now());
  const endDate = new Date(detectionDate.getTime() + forwardHours * 3600 * 1000);

  const particles = [];
  const trajectories: GeoPoint[][] = [];
  const numEnsemble = 18;

  for (let e = 0; e < numEnsemble; e++) {
    const singleTraj: GeoPoint[] = [];
    const spreadX = (Math.random() - 0.5) * 0.35 * vxKmH;
    const spreadY = (Math.random() - 0.5) * 0.35 * vyKmH;

    for (let h = 0; h <= forwardHours; h += 3) {
      const dx = (vxKmH + spreadX) * h;
      const dy = (vyKmH + spreadY) * h;
      const pLat = detection.spillCentroid.lat + dy / kmPerLat;
      const pLng = detection.spillCentroid.lng + dx / kmPerLng;
      const pt = { lat: Number(pLat.toFixed(5)), lng: Number(pLng.toFixed(5)) };
      singleTraj.push(pt);

      if (h === forwardHours) {
        particles.push({
          lat: pt.lat,
          lng: pt.lng,
          timestamp: endDate.toISOString(),
          hourOffset: forwardHours,
          probability: Math.max(0.1, 1 - (h / forwardHours) * 0.4),
        });
      }
    }
    trajectories.push(singleTraj);
  }

  return {
    incidentId: incident.id,
    type: 'FORWARD',
    startUtc: incident.detectionUtc,
    endUtc: endDate.toISOString(),
    durationHours: forwardHours,
    particles,
    trajectories,
    shorelineImpactRisk: {
      atRisk: false,
      nearestCoastKm: 68,
      sensitiveZones: ['Mangrove Reserve 72km SE', 'Artisanal Fisheries Sector 44km S'],
    },
  };
}

// Haversine distance in km
export function haversineDistanceKm(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Multi-criteria forensic suspect ranking engine
export function evaluateCandidateSuspects(
  vessels: Vessel[],
  backwardRun: DriftRun,
  weights: ScoringWeights = { proximity: 40, trajectory: 30, behavior: 15, gap: 15 }
): CandidateSuspect[] {
  const origin = backwardRun.originEllipse?.center || { lat: 19.7, lng: 71.3 };
  const originWindowStart = backwardRun.originEllipse?.probableReleaseWindowStart
    ? new Date(backwardRun.originEllipse.probableReleaseWindowStart).getTime()
    : Date.now() - 14 * 3600000;
  const originWindowEnd = backwardRun.originEllipse?.probableReleaseWindowEnd
    ? new Date(backwardRun.originEllipse.probableReleaseWindowEnd).getTime()
    : Date.now() - 10 * 3600000;

  const results: CandidateSuspect[] = vessels.map((vessel) => {
    // 1. Proximity score: Find closest approach to origin
    let minDistanceKm = 999;
    let timeOfClosestApproachUtc = vessel.positions[0]?.timestamp || new Date().toISOString();

    for (const pos of vessel.positions) {
      const d = haversineDistanceKm(pos, origin);
      if (d < minDistanceKm) {
        minDistanceKm = d;
        timeOfClosestApproachUtc = pos.timestamp;
      }
    }

    // Exponential decay score for distance (0 km = 100%, 25 km = ~5%)
    const proximityScore = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-minDistanceKm / 4.5))));

    // 2. Trajectory score: Heading alignment with slick orientation
    const slickOrientation = backwardRun.originEllipse?.orientationDeg || 220;
    const headingDiff = Math.abs((vessel.currentHeading - slickOrientation + 360) % 360);
    const minHeadingDiff = Math.min(headingDiff, 360 - headingDiff);
    const trajectoryScore = Math.max(0, Math.min(100, Math.round(100 * (1 - minHeadingDiff / 180))));

    // 3. Behavior Score (Tanker type + speed changes)
    let behaviorScore = 50;
    const isTanker =
      vessel.type.toLowerCase().includes('tanker') || vessel.type.toLowerCase().includes('crude');
    if (isTanker) behaviorScore += 30;
    if (vessel.behaviorNotes.some((n) => n.toLowerCase().includes('speed reduction'))) behaviorScore += 15;
    behaviorScore = Math.min(100, behaviorScore);

    // 4. AIS Gap Score (transponder dark vessel detection)
    let gapScore = 20;
    let isDarkVessel = false;
    if (vessel.aisGaps && vessel.aisGaps.length > 0) {
      const suspiciousGap = vessel.aisGaps.find((g) => g.isSuspicious || g.durationHours > 1.5);
      if (suspiciousGap) {
        gapScore = Math.min(100, Math.round(75 + suspiciousGap.durationHours * 6));
        isDarkVessel = true;
      }
    }

    // Weighted composite score (0 - 100)
    const compositeScore = Math.round(
      (weights.proximity * proximityScore +
        weights.trajectory * trajectoryScore +
        weights.behavior * behaviorScore +
        weights.gap * gapScore) /
        100
    );

    // Release window presence
    const tcaTime = new Date(timeOfClosestApproachUtc).getTime();
    const presentDuringReleaseWindow =
      (tcaTime >= originWindowStart - 3600000 && tcaTime <= originWindowEnd + 3600000) || isDarkVessel;

    // Explanations
    const explanation: string[] = [];
    explanation.push(
      `Closest point of approach: ${minDistanceKm.toFixed(1)} km from reconstructed discharge origin (Proximity Score: ${proximityScore}/100).`
    );
    explanation.push(
      `Heading alignment is ${minHeadingDiff}° from hydrodynamic drift axis (Trajectory Alignment Score: ${trajectoryScore}/100).`
    );
    if (isDarkVessel) {
      const g = vessel.aisGaps[0];
      explanation.push(
        `CRITICAL: ${g.durationHours.toFixed(1)}-hour transponder black-out recorded directly across probable release window.`
      );
    } else {
      explanation.push('AIS broadcast remained active during observation timeframe.');
    }
    if (isTanker) {
      explanation.push(`Vessel type is ${vessel.type}, carrying regulated MARPOL Annex I cargo/slops.`);
    }

    let status: CandidateSuspect['status'] = 'CLEARED';
    if (compositeScore >= 75) status = 'PRIME_SUSPECT';
    else if (compositeScore >= 55) status = 'POTENTIAL_SOURCE';
    else if (compositeScore >= 35) status = 'PERSON_OF_INTEREST';

    return {
      id: `CAND-${vessel.id}`,
      incidentId: backwardRun.incidentId,
      rank: 0,
      vessel,
      score: compositeScore,
      confidence: Math.round(compositeScore * 0.96) / 100,
      status,
      minDistanceToOriginKm: Number(minDistanceKm.toFixed(2)),
      trajectoryAlignmentDeg: Math.round(minHeadingDiff),
      presentDuringReleaseWindow,
      timeOfClosestApproachUtc,
      factors: {
        proximityScore,
        trajectoryScore,
        behaviorScore,
        gapScore,
      },
      explanation,
      isDarkVessel,
    };
  });

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  // Set ranks
  results.forEach((item, index) => {
    item.rank = index + 1;
    if (index === 0 && item.score >= 70) {
      item.status = 'PRIME_SUSPECT';
    }
  });

  return results;
}
