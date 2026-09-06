import React from 'react';
import { CheckCircle2, ShieldCheck, Key, Radio, Globe, Satellite, Sparkles, X, ExternalLink } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasGeminiKey: boolean;
  isLiveMode: boolean;
  setIsLiveMode: (live: boolean) => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  hasGeminiKey,
  isLiveMode,
  setIsLiveMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">API Keys & Live Provider Feeds</h2>
              <p className="text-xs text-gray-500">SeaTrace Data Integration & Operational Mode Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Operational Mode Toggle */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Operational Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isLiveMode
                  ? 'Live Mode Active: Querying real-time Open-Meteo CMEMS currents and NOAA GFS wind.'
                  : 'Scenario Benchmark Mode: Using calibrated historical maritime incident benchmarks.'}
              </p>
            </div>
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                isLiveMode
                  ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isLiveMode ? 'Switch to Scenarios' : 'Enable Live Mode'}
            </button>
          </div>

          {/* Provider Integrations Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Integrated Services & Keys
            </h3>

            {/* 1. Gemini AI Core */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Google Gemini 2.5 Flash AI Engine
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE & CONFIGURED
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>API Key Provided by Server:</strong> You do not need to supply a personal API key. SeaTrace
                  runs its full forensic reasoning engine through Google AI Studio server-side credentials.
                </p>
                <div className="mt-2 text-[11px] text-gray-500 font-mono bg-gray-50 px-2.5 py-1.5 rounded border border-gray-100">
                  Model: gemini-2.5-flash (Multi-factor slick characterization & attribution)
                </div>
              </div>
            </div>

            {/* 2. Marine & Weather Feeds */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Open-Meteo CMEMS & NOAA GFS Feeds
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> LIVE (NO KEY REQUIRED)
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  SeaTrace fetches real ocean current velocity, current direction, wave height, and 10m wind vectors
                  directly from open Copernicus Marine Environment Monitoring Service (CMEMS) and NOAA Global Forecast
                  System.
                </p>
              </div>
            </div>

            {/* 3. AIS Vessel Tracking Provider */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 mt-0.5">
                <Radio className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    AIS Live Marine Stream
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="w-3 h-3" /> CONNECTED
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Active in hybrid tracking mode. For custom high-frequency dedicated AIS receiver streams, you can use
                  free community keys:
                </p>
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800">AisStream.io</span>
                      <span className="block text-[10px] text-gray-500">Free global WebSocket API</span>
                    </div>
                    <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-mono font-bold">
                      Free Key
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800">MarineTraffic / VesselFinder</span>
                      <span className="block text-[10px] text-gray-500">Commercial enterprise feeds</span>
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                      Optional
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Satellite SAR Provider */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 mt-0.5">
                <Satellite className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Copernicus Sentinel-1 C-SAR IW Mode
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      <ShieldCheck className="w-3 h-3" /> PIPELINE READY
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Processes 10m Ground Range Detected (GRD) synthetic aperture radar scenes from ESA Copernicus Data
                  Space Open Access with dielectric surface roughness suppression analysis.
                </p>
              </div>
            </div>

            {/* 5. Google Maps Platform */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 mt-0.5">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Google Maps Platform Vector Engine
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> INTEGRATED
                    </span>
                  </h4>
                  <a
                    href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Get Demo Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Powers high-resolution coastal Satellite imagery, Hybrid vector labels, AdvancedMarker vessel telemetry, and dynamic drift trajectory geometry via <code>@vis.gl/react-google-maps</code>.
                </p>
                <div className="mt-2 text-[11px] text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 flex items-center justify-between">
                  <span>Environment variable: <code>VITE_GOOGLE_MAPS_API_KEY</code></span>
                  <span className="text-[10px] text-gray-500">Maps JS SDK v=weekly</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <span className="text-xs text-gray-500">SeaTrace Maritime Intelligence Platform v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
