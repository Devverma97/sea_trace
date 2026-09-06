import React from 'react';
import { DriftRun, Incident, SlickDetection, MarineWeather } from '../types';
import { MarineMap } from './MarineMap';
import {
  Waves,
  Wind,
  Clock,
  Compass,
  Sliders,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Anchor,
} from 'lucide-react';

interface DriftViewProps {
  incident: Incident;
  detection: SlickDetection;
  backwardRun: DriftRun | null;
  forwardRun: DriftRun | null;
  backwardHours: number;
  setBackwardHours: (h: number) => void;
  forwardHours: number;
  setForwardHours: (h: number) => void;
  currentSpeed: number;
  setCurrentSpeed: (s: number) => void;
  currentDir: number;
  setCurrentDir: (d: number) => void;
  windSpeed: number;
  setWindSpeed: (s: number) => void;
  windDir: number;
  setWindDir: (d: number) => void;
  marineWeather: MarineWeather | null;
  onResetDefaults: () => void;
}

export const DriftView: React.FC<DriftViewProps> = ({
  incident,
  detection,
  backwardRun,
  forwardRun,
  backwardHours,
  setBackwardHours,
  forwardHours,
  setForwardHours,
  currentSpeed,
  setCurrentSpeed,
  currentDir,
  setCurrentDir,
  windSpeed,
  setWindSpeed,
  windDir,
  setWindDir,
  marineWeather,
  onResetDefaults,
}) => {
  const origin = backwardRun?.originEllipse;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hydrodynamic Drift Modeling & Backtracking</h2>
            <p className="text-xs text-gray-500 mt-1">
              OpenDrift Runge-Kutta 4th-Order (RK4) particle tracking driven by CMEMS ocean currents & NOAA GFS winds
            </p>
          </div>
        </div>

        <button
          onClick={onResetDefaults}
          className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Live Feeds</span>
        </button>
      </div>

      {/* Grid: Controls & Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Simulation Sliders */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 text-xs text-gray-700">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Simulation Parameters</span>
              </h3>
              <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold border border-green-100">
                Real-time
              </span>
            </div>

            {/* Backward Hindcast Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Backward Hindcast Window:
                </span>
                <span className="font-mono font-bold text-gray-900 text-sm">{backwardHours} Hours</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={backwardHours}
                onChange={(e) => setBackwardHours(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 block">
                Backtracks slick to locate temporal window of illegal discharge
              </span>
            </div>

            {/* Forward Forecast Slider */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-600" />
                  Forward Dispersion Forecast:
                </span>
                <span className="font-mono font-bold text-gray-900 text-sm">{forwardHours} Hours</span>
              </div>
              <input
                type="range"
                min="12"
                max="48"
                step="6"
                value={forwardHours}
                onChange={(e) => setForwardHours(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 block">
                Predicts future oil slick trajectory & coastal containment zones
              </span>
            </div>

            {/* Ocean Current Speed */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-blue-600" />
                  Current Velocity:
                </span>
                <span className="font-mono font-bold text-gray-900">{currentSpeed.toFixed(2)} kts</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={currentSpeed}
                onChange={(e) => setCurrentSpeed(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Ocean Current Direction */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Current Heading (°):</span>
                <span className="font-mono font-bold text-gray-900">{currentDir}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={currentDir}
                onChange={(e) => setCurrentDir(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Wind Speed */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  10m Wind Speed:
                </span>
                <span className="font-mono font-bold text-gray-900">{windSpeed.toFixed(1)} kts</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="35.0"
                step="0.5"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 block">3.2% leeway factor applied + Coriolis deflection</span>
            </div>

            {/* Wind Direction */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Wind Direction (°):</span>
                <span className="font-mono font-bold text-gray-900">{windDir}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={windDir}
                onChange={(e) => setWindDir(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Reconstructed Origin Card */}
          {origin && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-xs space-y-2">
              <h4 className="font-bold text-gray-800 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <Anchor className="w-3.5 h-3.5 text-rose-600" />
                <span>Reconstructed Release Origin Ellipse</span>
              </h4>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-gray-600">
                  <span>Origin Lat/Lng:</span>
                  <span className="text-gray-900 font-bold">
                    {origin.center.lat.toFixed(4)}° N, {origin.center.lng.toFixed(4)}° E
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Semi-Major Axis:</span>
                  <span className="text-gray-900 font-bold">{origin.semiMajorKm.toFixed(2)} km</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Probable Window:</span>
                  <span className="text-amber-700 font-bold">~{backwardHours}h before SAR</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <MarineMap
            incident={incident}
            detection={detection}
            backwardRun={backwardRun}
            forwardRun={forwardRun}
            vessels={[]}
            candidates={[]}
            heightClass="h-[600px]"
          />

          {/* Shoreline Threat & Sensitive Ecosystems Warning */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Coastal Impact Assessment: LOW IMMEDIATE RISK</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Nearest shoreline is 68 km East. Prevailing south-westerly hydrodynamic drift is carrying the slick offshore into deep international waters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
