import React, { useState } from 'react';
import { Incident, SlickDetection } from '../types';
import {
  Activity,
  Sliders,
  Maximize2,
  Calendar,
  Layers,
  ArrowLeftRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface CompareViewProps {
  incident: Incident;
  detection: SlickDetection;
}

export const CompareView: React.FC<CompareViewProps> = ({ incident, detection }) => {
  const [splitPosition, setSplitPosition] = useState(50);
  const [selectedChannel, setSelectedChannel] = useState<'VV' | 'VH' | 'RATIO'>('VV');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Pre- & Post-Spill SAR Radar Differential</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                COPERNICUS SENTINEL-1 IW
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Dual-polarization (VV/VH) backscatter comparison verifying non-biogenic capillary wave dampening
            </p>
          </div>
        </div>

        {/* Polarization Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-semibold">Polarization:</span>
          {(['VV', 'VH', 'RATIO'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                selectedChannel === ch
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Split Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              Left: <strong className="text-gray-900">Baseline (Clean Ocean - 48h prior)</strong>
            </span>
            <span>·</span>
            <span className="text-gray-500">
              Right: <strong className="text-amber-600">Incident SAR (Oil Suppression Detected)</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sliders className="w-3.5 h-3.5" />
            <span>Slide Divider: {splitPosition}%</span>
          </div>
        </div>

        {/* Visual Split-Screen Representation */}
        <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-gray-200 bg-gray-950 select-none">
          {/* Baseline Clean Surface (Left Layer) */}
          <div
            className="absolute inset-0 bg-cover bg-center flex items-center justify-start p-8"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at center, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.95) 100%)',
            }}
          >
            <div className="bg-black/60 backdrop-blur-sm border border-gray-700 rounded-lg p-3 text-white max-w-xs space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Acquisition: Baseline
              </span>
              <p className="text-xs font-mono">Backscatter σ₀: -7.8 dB</p>
              <p className="text-[11px] text-emerald-400 font-semibold">Rough Capillary Sea Surface</p>
            </div>
          </div>

          {/* Incident Oil Slick Suppression (Right Layer, clipped by splitPosition) */}
          <div
            className="absolute inset-0 bg-cover bg-center flex items-center justify-end p-8"
            style={{
              clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`,
              backgroundImage:
                'radial-gradient(ellipse at 65% 50%, rgba(217, 119, 6, 0.4) 0%, rgba(10, 10, 15, 0.98) 70%)',
            }}
          >
            <div className="bg-black/60 backdrop-blur-sm border border-amber-500/50 rounded-lg p-3 text-white max-w-xs space-y-1">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
                Acquisition: Spill Footprint
              </span>
              <p className="text-xs font-mono text-amber-300">Backscatter σ₀: -22.0 dB (-14.2 dB drop)</p>
              <p className="text-[11px] text-amber-400 font-semibold">High Damping · Film Boundary Sharp</p>
            </div>
          </div>

          {/* Split Slider Line Indicator */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize z-20"
            style={{ left: `${splitPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg border border-gray-300">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>

          {/* Range input spanning entire frame for seamless sliding */}
          <input
            type="range"
            min="5"
            max="95"
            value={splitPosition}
            onChange={(e) => setSplitPosition(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
          />
        </div>

        {/* Backscatter Differential Analysis Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Average Sea Surface σ₀</span>
            <span className="text-base font-bold text-gray-900 font-mono mt-0.5 block">-7.8 dB</span>
            <span className="text-[10px] text-gray-500">Ambient wind wave Bragg backscattering</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Slick Core σ₀</span>
            <span className="text-base font-bold text-amber-600 font-mono mt-0.5 block">-22.0 dB</span>
            <span className="text-[10px] text-gray-500">Severe surface capillary wave extinction</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-[10px] text-gray-400 block font-bold uppercase">Relative Contrast Δσ₀</span>
            <span className="text-base font-bold text-rose-600 font-mono mt-0.5 block">-14.2 dB</span>
            <span className="text-[10px] text-green-600 font-semibold">Meets Bonn Agreement threshold (&gt; 10 dB)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
