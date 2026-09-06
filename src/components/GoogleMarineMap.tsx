import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  CandidateSuspect,
  DriftRun,
  Incident,
  SlickDetection,
  Vessel,
} from '../types';
import {
  Layers,
  Navigation,
  Ship,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { InnerGoogleMap } from './InnerGoogleMap';

interface GoogleMarineMapProps {
  incident: Incident;
  detection: SlickDetection;
  backwardRun: DriftRun | null;
  forwardRun: DriftRun | null;
  vessels: Vessel[];
  candidates: CandidateSuspect[];
  selectedVesselId?: string;
  onSelectVessel?: (vessel: Vessel) => void;
  heightClass?: string;
  onSwitchToStandardMap?: () => void;
}

export const GoogleMarineMap: React.FC<GoogleMarineMapProps> = ({
  incident,
  detection,
  backwardRun,
  forwardRun,
  vessels,
  candidates,
  selectedVesselId,
  onSelectVessel,
  heightClass = 'h-[580px]',
  onSwitchToStandardMap,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [showSlick, setShowSlick] = useState(true);
  const [showBacktrack, setShowBacktrack] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showTracks, setShowTracks] = useState(true);

  // Selected item for interactive InfoWindow
  const [activeVessel, setActiveVessel] = useState<Vessel | null>(null);
  const [activeSlickInfo, setActiveSlickInfo] = useState<boolean>(false);
  const [activeOriginInfo, setActiveOriginInfo] = useState<boolean>(false);

  // Update active vessel if selected externally
  useEffect(() => {
    if (selectedVesselId) {
      const match = vessels.find((v) => v.id === selectedVesselId);
      if (match) setActiveVessel(match);
    }
  }, [selectedVesselId, vessels]);

  // Center coordinates
  const center = { lat: incident.lat, lng: incident.lng };

  // Helper to format coordinates
  const formatCoord = (lat: number, lng: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  };

  // Convert slick polygon
  const slickCoords = detection?.polygon?.map((p) => ({ lat: p.lat, lng: p.lng })) || [];

  // Standby / Key Setup Screen if API key is not configured
  // This prevents mounting APIProvider with empty key which triggers ApiProjectMapError
  if (!apiKey || apiKey.trim() === '') {
    return (
      <div className={`relative w-full ${heightClass} bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col`}>
        {/* Top Floating Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-bold text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Google Maps Platform</span>
          </div>
          {onSwitchToStandardMap && (
            <button
              onClick={onSwitchToStandardMap}
              className="pointer-events-auto flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open Carto / Leaflet Map</span>
            </button>
          )}
        </div>

        {/* Center Informational Card */}
        <div className="flex-1 flex items-center justify-center p-6 bg-radial from-slate-900 to-slate-950">
          <div className="max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Google Maps Platform Satellite Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              To stream Google Maps satellite imagery, vector tiles, and AdvancedMarker vessel overlays, configure your <code className="text-indigo-300 font-mono bg-indigo-950/70 px-1.5 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> or test with the free zero-setup Maps Demo Key.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              {onSwitchToStandardMap && (
                <button
                  onClick={onSwitchToStandardMap}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Continue with Carto Map</span>
                </button>
              )}
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>Get Free Demo Key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full AIS Telemetry</span>
              </span>
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Drift Simulation</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Target: <strong className="text-slate-200">{incident.name}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline font-mono">{formatCoord(incident.lat, incident.lng)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[10px]">Google Maps Platform Mode</span>
          </div>
        </div>
      </div>
    );
  }

  // Active Key View: APIProvider wrapping InnerGoogleMap with full error boundaries
  return (
    <div className={`relative w-full ${heightClass} bg-slate-900 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col`}>
      {/* Top Floating Bar: Google Maps Platform Header & Quick Toggles */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Engine Badge & Map Type Selector */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Google Maps Platform</span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          
          {/* Map Type Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                mapType === 'hybrid'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Satellite with nautical road & port labels"
            >
              Hybrid
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="High-resolution aerial satellite imagery"
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Vector Roadmap"
            >
              Roadmap
            </button>
            <button
              onClick={() => setMapType('terrain')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                mapType === 'terrain'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title="Topographic and coastal terrain relief"
            >
              Terrain
            </button>
          </div>
        </div>

        {/* Action Controls: Layer Toggles & Engine Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Recenter button */}
          <button
            onClick={() => setActiveVessel(null)}
            className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 shadow-md transition-colors cursor-pointer"
            title="Reset focus to spill incident"
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Center Spill</span>
          </button>

          {/* Engine Switcher */}
          {onSwitchToStandardMap && (
            <button
              onClick={onSwitchToStandardMap}
              className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:text-indigo-600 hover:bg-gray-50 shadow-md transition-colors cursor-pointer"
              title="Switch to Leaflet / Carto view"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Carto/Leaflet View</span>
            </button>
          )}
        </div>
      </div>

      {/* Layer Visibility Toggles (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto bg-white/95 backdrop-blur-md p-2 rounded-xl border border-gray-200 shadow-lg flex flex-wrap items-center gap-1.5 text-xs text-gray-700">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-1">Layers:</span>
        <button
          onClick={() => setShowSlick(!showSlick)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
            showSlick
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          SAR Slick
        </button>
        <button
          onClick={() => setShowBacktrack(!showBacktrack)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
            showBacktrack
              ? 'bg-sky-50 text-sky-800 border border-sky-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          Hindcast Drift
        </button>
        <button
          onClick={() => setShowForecast(!showForecast)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
            showForecast
              ? 'bg-purple-50 text-purple-800 border border-purple-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          Forecast Drift
        </button>
        <button
          onClick={() => setShowVessels(!showVessels)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
            showVessels
              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Ship className="w-3 h-3 text-indigo-600" />
          AIS Ships ({vessels.length})
        </button>
        <button
          onClick={() => setShowTracks(!showTracks)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
            showTracks
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Navigation className="w-3 h-3 text-rose-500" />
          Ship Tracks
        </button>
      </div>

      {/* Main Google Maps Render Container wrapped in APIProvider */}
      <div className="w-full h-full flex-1">
        <APIProvider apiKey={apiKey}>
          <InnerGoogleMap
            center={center}
            mapType={mapType}
            incident={incident}
            detection={detection}
            backwardRun={backwardRun}
            forwardRun={forwardRun}
            vessels={vessels}
            candidates={candidates}
            selectedVesselId={selectedVesselId}
            showSlick={showSlick}
            showBacktrack={showBacktrack}
            showForecast={showForecast}
            showVessels={showVessels}
            showTracks={showTracks}
            activeVessel={activeVessel}
            setActiveVessel={setActiveVessel}
            activeSlickInfo={activeSlickInfo}
            setActiveSlickInfo={setActiveSlickInfo}
            activeOriginInfo={activeOriginInfo}
            setActiveOriginInfo={setActiveOriginInfo}
            slickCoords={slickCoords}
            formatCoord={formatCoord}
            onSelectVessel={onSelectVessel}
            onSwitchToStandardMap={onSwitchToStandardMap}
          />
        </APIProvider>
      </div>

      {/* Coordinate & Scale Footer Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>Target: <strong className="text-slate-200">{incident.name}</strong></span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline font-mono">{formatCoord(incident.lat, incident.lng)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
            <ShieldCheck className="w-3 h-3" />
            <span>Google Maps Platform JS SDK</span>
          </span>
        </div>
      </div>
    </div>
  );
};
