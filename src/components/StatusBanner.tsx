import React from 'react';
import { Radio, Sparkles, Wind, Waves, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { MarineWeather } from '../types';

interface StatusBannerProps {
  isLiveMode: boolean;
  onToggleMode: () => void;
  marineWeather: MarineWeather | null;
  onRefreshWeather: () => void;
  isLoadingWeather: boolean;
  onOpenConfig: () => void;
  hasGeminiKey: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  isLiveMode,
  onToggleMode,
  marineWeather,
  onRefreshWeather,
  isLoadingWeather,
  onOpenConfig,
  hasGeminiKey,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 text-xs px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      {/* Left: Operational status badge */}
      <div className="flex items-center flex-wrap gap-3">
        <div
          className={`inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full border ${
            isLiveMode
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-indigo-50 border-indigo-100 text-indigo-700'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              isLiveMode ? 'bg-green-500' : 'bg-indigo-600'
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isLiveMode ? 'Live Mode: API Connected' : 'Scenario Benchmark Active'}
          </span>
        </div>

        {/* Gemini AI Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/80 border border-amber-200/60 text-amber-800 text-[11px] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Gemini 2.5 Flash:</span>
          <span className="font-bold text-green-600">ONLINE</span>
        </div>

        {/* Live Marine Currents & Winds */}
        {marineWeather && (
          <div className="hidden md:flex items-center gap-4 text-gray-600 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-400 font-medium">Current:</span>
              <span className="font-mono font-bold text-gray-800">
                {marineWeather.oceanCurrent.velocityKts} kts @ {marineWeather.oceanCurrent.directionDeg}°
              </span>
              {marineWeather.live && (
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-semibold">
                  Live
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-gray-400 font-medium">Wind:</span>
              <span className="font-mono font-bold text-gray-800">
                {marineWeather.wind.speedKts} kts @ {marineWeather.wind.directionDeg}°
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRefreshWeather}
          disabled={isLoadingWeather}
          title="Refresh live environmental data"
          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        <button
          onClick={onToggleMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer shadow-2xs ${
            isLiveMode
              ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
          }`}
        >
          {isLiveMode ? 'Switch to Scenarios' : 'Switch to Live Feeds'}
        </button>

        <button
          onClick={onOpenConfig}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
        >
          <Key className="w-3.5 h-3.5 text-indigo-600" />
          <span>API Keys & Feeds</span>
        </button>
      </div>
    </div>
  );
};
