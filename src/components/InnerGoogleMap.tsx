import React, { useState, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  Polygon,
  Polyline,
  Circle,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import {
  CandidateSuspect,
  DriftRun,
  Incident,
  SlickDetection,
  Vessel,
} from '../types';
import {
  AlertTriangle,
  Crosshair,
  Layers,
  ExternalLink,
} from 'lucide-react';

export interface InnerGoogleMapProps {
  center: { lat: number; lng: number };
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  incident: Incident;
  detection: SlickDetection;
  backwardRun: DriftRun | null;
  forwardRun: DriftRun | null;
  vessels: Vessel[];
  candidates: CandidateSuspect[];
  selectedVesselId?: string;
  showSlick: boolean;
  showBacktrack: boolean;
  showForecast: boolean;
  showVessels: boolean;
  showTracks: boolean;
  activeVessel: Vessel | null;
  setActiveVessel: (v: Vessel | null) => void;
  activeSlickInfo: boolean;
  setActiveSlickInfo: (s: boolean) => void;
  activeOriginInfo: boolean;
  setActiveOriginInfo: (o: boolean) => void;
  slickCoords: { lat: number; lng: number }[];
  formatCoord: (lat: number, lng: number) => string;
  onSelectVessel?: (vessel: Vessel) => void;
  onSwitchToStandardMap?: () => void;
}

// Controller to smoothly pan when incident changes
const MapCameraUpdater: React.FC<{
  center: { lat: number; lng: number };
  zoom?: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      if (zoom) map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom]);
  return null;
};

export const InnerGoogleMap: React.FC<InnerGoogleMapProps> = ({
  center,
  mapType,
  incident,
  detection,
  backwardRun,
  forwardRun,
  vessels,
  candidates,
  selectedVesselId,
  showSlick,
  showBacktrack,
  showForecast,
  showVessels,
  showTracks,
  activeVessel,
  setActiveVessel,
  activeSlickInfo,
  setActiveSlickInfo,
  activeOriginInfo,
  setActiveOriginInfo,
  slickCoords,
  formatCoord,
  onSelectVessel,
  onSwitchToStandardMap,
}) => {
  const loadingStatus = useApiLoadingStatus();
  const [authError, setAuthError] = useState(false);

  // Global auth failure handler for ApiProjectMapError
  useEffect(() => {
    const handleAuth = () => {
      setAuthError(true);
    };
    const prev = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      handleAuth();
      if (typeof prev === 'function') {
        try {
          prev();
        } catch {
          // ignore
        }
      }
    };
    return () => {
      (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = prev;
    };
  }, []);

  // Graceful error state if Google Maps fails to authenticate or project is invalid (ApiProjectMapError)
  if (
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE ||
    authError
  ) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-rose-500/40 rounded-xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Google Maps Project Resolution Notice</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            The Google Maps JavaScript API reported <code className="text-rose-300 font-mono bg-rose-950/60 px-1 py-0.5 rounded">ApiProjectMapError</code>. This indicates the current Google Cloud project or key is not recognized, billing is inactive, or domain restrictions apply.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {onSwitchToStandardMap && (
              <button
                onClick={onSwitchToStandardMap}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Layers className="w-4 h-4" />
                <span>Switch to Carto / Leaflet Map</span>
              </button>
            )}
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Get Free Demo Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (
    loadingStatus === APILoadingStatus.LOADING ||
    loadingStatus === APILoadingStatus.NOT_LOADED
  ) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Connecting to Google Maps Platform satellite telemetry...</p>
      </div>
    );
  }

  // Loaded: Render Interactive Map
  return (
    <Map
      defaultCenter={center}
      defaultZoom={9}
      mapId="DEMO_MAP_ID"
      mapTypeId={mapType}
      style={{ width: '100%', height: '100%' }}
      gestureHandling="greedy"
      disableDefaultUI={false}
      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
    >
      {/* Smooth Camera Tracker */}
      <MapCameraUpdater center={center} />

      {/* 1. Oil Slick Polygon Overlay */}
      {showSlick && slickCoords.length > 2 && (
        <Polygon
          paths={slickCoords}
          strokeColor="#f59e0b"
          strokeWeight={2.5}
          strokeOpacity={0.9}
          fillColor="#1e293b"
          fillOpacity={0.7}
        />
      )}

      {/* Spill Centroid AdvancedMarker */}
      {showSlick && (
        <AdvancedMarker
          position={{ lat: detection.spillCentroid.lat, lng: detection.spillCentroid.lng }}
          title={`Spill Centroid: ${detection.spillAreaKm2} km²`}
          onClick={() => setActiveSlickInfo(true)}
        >
          <div className="relative flex items-center justify-center cursor-pointer group">
            <div className="absolute w-8 h-8 rounded-full bg-amber-500/40 animate-ping" />
            <div className="relative w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-slate-900 font-bold text-[9px] group-hover:scale-110 transition-transform">
              !
            </div>
          </div>
        </AdvancedMarker>
      )}

      {/* Spill InfoWindow */}
      {activeSlickInfo && (
        <InfoWindow
          position={{ lat: detection.spillCentroid.lat, lng: detection.spillCentroid.lng }}
          onCloseClick={() => setActiveSlickInfo(false)}
        >
          <div className="p-2 text-slate-900 font-sans max-w-xs">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs pb-1 border-b border-gray-100">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>DETECTED OIL SPILL SLICK</span>
            </div>
            <div className="mt-1.5 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-500">Surface Area:</span>
                <span className="font-semibold text-gray-900">{detection.spillAreaKm2} km²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thickness / Type:</span>
                <span className="font-semibold text-gray-900">{detection.thicknessUm} ({incident.oilType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Volume:</span>
                <span className="font-semibold text-gray-900">~{detection.estimatedVolumeM3.toLocaleString()} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sensor Platform:</span>
                <span className="font-semibold text-gray-900">{detection.sensor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Detection Confidence:</span>
                <span className="font-semibold text-emerald-600">{(detection.confidence * 100).toFixed(0)}% SAR Match</span>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}

      {/* 2. Backward Drift (Hindcast Trajectories to Possible Spill Origin) */}
      {showBacktrack && backwardRun?.trajectories && backwardRun.trajectories.length > 0 && (
        <>
          {backwardRun.trajectories.map((traj, idx) => {
            if (traj.length < 2) return null;
            return (
              <Polyline
                key={`hindcast-traj-${idx}`}
                path={traj.map((p) => ({ lat: p.lat, lng: p.lng }))}
                strokeColor="#38bdf8"
                strokeWeight={idx === 0 ? 3 : 1.5}
                strokeOpacity={idx === 0 ? 0.9 : 0.45}
              />
            );
          })}

          {/* Probable Origin Release Point Circle & Marker */}
          {backwardRun.originEllipse && (
            <>
              <Circle
                center={{
                  lat: backwardRun.originEllipse.center.lat,
                  lng: backwardRun.originEllipse.center.lng,
                }}
                radius={backwardRun.originEllipse.semiMajorKm * 1000}
                strokeColor="#ef4444"
                strokeWeight={2}
                strokeOpacity={0.7}
                fillColor="#ef4444"
                fillOpacity={0.15}
              />
              <AdvancedMarker
                position={{
                  lat: backwardRun.originEllipse.center.lat,
                  lng: backwardRun.originEllipse.center.lng,
                }}
                title="Probable Origin Release Window"
                onClick={() => setActiveOriginInfo(true)}
              >
                <div className="relative flex items-center justify-center cursor-pointer group">
                  <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-110 transition-transform">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                </div>
              </AdvancedMarker>

              {activeOriginInfo && (
                <InfoWindow
                  position={{
                    lat: backwardRun.originEllipse.center.lat,
                    lng: backwardRun.originEllipse.center.lng,
                  }}
                  onCloseClick={() => setActiveOriginInfo(false)}
                >
                  <div className="p-2 text-slate-900 font-sans max-w-xs">
                    <div className="flex items-center gap-1 text-rose-700 font-bold text-xs pb-1 border-b border-gray-100">
                      <Crosshair className="w-3.5 h-3.5 text-rose-600" />
                      <span>ESTIMATED RELEASE ORIGIN</span>
                    </div>
                    <div className="mt-1.5 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Backtrack Duration:</span>
                        <span className="font-semibold text-gray-900">{backwardRun.durationHours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Origin Radius:</span>
                        <span className="font-semibold text-gray-900">{backwardRun.originEllipse.semiMajorKm} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Coordinates:</span>
                        <span className="font-mono text-[10px]">{formatCoord(backwardRun.originEllipse.center.lat, backwardRun.originEllipse.center.lng)}</span>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </>
          )}
        </>
      )}

      {/* 3. Forward Drift (Forecast Trajectories into the Future) */}
      {showForecast && forwardRun?.trajectories && forwardRun.trajectories.length > 0 && (
        <>
          {forwardRun.trajectories.map((traj, idx) => {
            if (traj.length < 2) return null;
            return (
              <Polyline
                key={`forecast-traj-${idx}`}
                path={traj.map((p) => ({ lat: p.lat, lng: p.lng }))}
                strokeColor="#a855f7"
                strokeWeight={2}
                strokeOpacity={0.65}
              />
            );
          })}
        </>
      )}

      {/* 4. AIS Vessel Tracks */}
      {showTracks &&
        vessels.map((v) => {
          if (!v.positions || v.positions.length < 2) return null;
          const isSuspect = candidates.some((c) => c.vessel.id === v.id);
          const isSelected = selectedVesselId === v.id;

          const color = isSelected
            ? '#f43f5e'
            : isSuspect
            ? '#f97316'
            : '#94a3b8';

          return (
            <Polyline
              key={`track-${v.id}`}
              path={v.positions.map((p) => ({ lat: p.lat, lng: p.lng }))}
              strokeColor={color}
              strokeWeight={isSelected ? 3.5 : isSuspect ? 2.5 : 1.5}
              strokeOpacity={isSelected ? 0.95 : isSuspect ? 0.75 : 0.4}
            />
          );
        })}

      {/* 5. AIS Vessels (Advanced Markers) */}
      {showVessels &&
        vessels.map((v) => {
          const isSuspect = candidates.some((c) => c.vessel.id === v.id);
          const isSelected = selectedVesselId === v.id;
          const lastPos = v.positions && v.positions.length > 0 ? v.positions[v.positions.length - 1] : null;
          if (!lastPos) return null;

          return (
            <AdvancedMarker
              key={v.id}
              position={{ lat: lastPos.lat, lng: lastPos.lng }}
              title={`${v.name} (${v.mmsi})`}
              onClick={() => {
                setActiveVessel(v);
                onSelectVessel?.(v);
              }}
            >
              <div
                className={`relative flex items-center justify-center transition-transform hover:scale-125 cursor-pointer ${
                  isSelected ? 'z-30 scale-125' : 'z-20'
                }`}
              >
                {/* Ping animation for suspect or selected */}
                {(isSuspect || isSelected) && (
                  <div
                    className={`absolute w-7 h-7 rounded-full animate-ping ${
                      isSelected ? 'bg-rose-500/40' : 'bg-amber-500/30'
                    }`}
                  />
                )}

                {/* Vessel Icon Pin */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md border ${
                    isSelected
                      ? 'bg-rose-600 border-white text-white'
                      : isSuspect
                      ? 'bg-amber-500 border-white text-slate-950'
                      : 'bg-slate-800 border-slate-600 text-slate-200'
                  }`}
                  style={{
                    transform: `rotate(${v.currentHeading || 0}deg)`,
                  }}
                >
                  <span className="text-[11px] font-bold leading-none select-none">▲</span>
                </div>
              </div>
            </AdvancedMarker>
          );
        })}

      {/* Active Vessel Interactive InfoWindow */}
      {activeVessel && (() => {
        const lastPos = activeVessel.positions && activeVessel.positions.length > 0
          ? activeVessel.positions[activeVessel.positions.length - 1]
          : null;
        if (!lastPos) return null;
        const cand = candidates.find((c) => c.vessel.id === activeVessel.id);

        return (
          <InfoWindow
            position={{ lat: lastPos.lat, lng: lastPos.lng }}
            onCloseClick={() => setActiveVessel(null)}
          >
            <div className="p-2 text-slate-900 font-sans max-w-xs">
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-100">
                <div className="font-bold text-xs text-gray-900 truncate">
                  {activeVessel.name}
                </div>
                {cand && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                    Suspect #{cand.rank}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">MMSI:</span>
                  <span className="font-mono text-gray-900">{activeVessel.mmsi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Speed / Heading:</span>
                  <span className="font-semibold text-gray-900">
                    {activeVessel.currentSpeed} kts • {activeVessel.currentHeading}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Flag:</span>
                  <span className="font-semibold text-gray-900">{activeVessel.flag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vessel Type:</span>
                  <span className="font-semibold text-gray-900">{activeVessel.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-semibold text-gray-900">{activeVessel.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coordinates:</span>
                  <span className="font-mono text-[10px]">{formatCoord(lastPos.lat, lastPos.lng)}</span>
                </div>

                {/* Candidate metrics if suspect */}
                {cand && (
                  <div className="mt-2 pt-1.5 border-t border-gray-100 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Distance to Origin:</span>
                      <span className="font-bold text-indigo-700">{cand.minDistanceToOriginKm} km</span>
                    </div>
                    {activeVessel.aisGaps && activeVessel.aisGaps.length > 0 && (
                      <div className="flex justify-between text-[11px] text-amber-700">
                        <span>AIS Gap Detected:</span>
                        <span className="font-bold">{activeVessel.aisGaps[0].durationHours}h dark</span>
                      </div>
                    )}
                    {activeVessel.behaviorNotes && activeVessel.behaviorNotes.length > 0 && (
                      <div className="text-[10px] text-gray-600 italic mt-1 bg-gray-50 p-1 rounded">
                        "{activeVessel.behaviorNotes[0]}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Select button */}
              <div className="mt-3 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    onSelectVessel?.(activeVessel);
                  }}
                  className="w-full py-1 px-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Focus in Suspect Attribution Panel
                </button>
              </div>
            </div>
          </InfoWindow>
        );
      })()}
    </Map>
  );
};
