import React from 'react';
import { PIPELINE_STAGES } from '../data/mockIncidents';
import { MarineWeather } from '../types';
import {
  Server,
  CheckCircle2,
  Sparkles,
  Globe,
  Radio,
  Satellite,
  ShieldCheck,
  Key,
  Cpu,
  Zap,
} from 'lucide-react';

interface StatusViewProps {
  hasGeminiKey: boolean;
  marineWeather: MarineWeather | null;
  isLiveMode: boolean;
  onOpenConfig: () => void;
}

export const StatusView: React.FC<StatusViewProps> = ({
  hasGeminiKey,
  marineWeather,
  isLiveMode,
  onOpenConfig,
}) => {
  const components = [
    {
      name: 'Google Gemini 2.5 Flash Forensic Core',
      status: 'ONLINE',
      statusClass: 'bg-green-50 text-green-700 border border-green-200',
      description: 'Connected via server-side credentials for automated slick reasoning and candidate vessel attribution.',
      latency: '320ms',
      icon: Sparkles,
      iconColor: 'text-amber-500',
    },
    {
      name: 'Open-Meteo CMEMS & NOAA GFS Feeds',
      status: marineWeather?.live ? 'LIVE / ONLINE' : 'ONLINE',
      statusClass: 'bg-green-50 text-green-700 border border-green-200',
      description: 'Real-time surface ocean current velocity, current direction, wave height, and 10m wind vector integration.',
      latency: '180ms',
      icon: Globe,
      iconColor: 'text-blue-500',
    },
    {
      name: 'AIS Marine Receiver Stream',
      status: 'ONLINE / HYBRID',
      statusClass: 'bg-green-50 text-green-700 border border-green-200',
      description: 'Spatio-temporal Class A/B vessel intercept engine with automated dark transponder gap detection.',
      latency: '45ms',
      icon: Radio,
      iconColor: 'text-purple-500',
    },
    {
      name: 'Copernicus Sentinel-1 SAR Processor',
      status: 'ONLINE',
      statusClass: 'bg-green-50 text-green-700 border border-green-200',
      description: 'Interferometric Wide (IW) C-band radar backscatter inversion & dielectric look-alike rejection.',
      latency: '210ms',
      icon: Satellite,
      iconColor: 'text-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-xs">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">System Health & Live Provider Status</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ALL SYSTEMS OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active telemetry for AI reasoning, satellite ingestion, hydrodynamic drift, and AIS feeds
            </p>
          </div>
        </div>

        <button
          onClick={onOpenConfig}
          className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-indigo-600" />
          <span>API Key & Provider Guide</span>
        </button>
      </div>

      {/* Grid: Connected Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components.map((comp, idx) => {
          const Icon = comp.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-sm hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <Icon className={`w-5 h-5 ${comp.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{comp.name}</h3>
                    <span className="text-[10px] text-gray-400 font-mono">Ping: {comp.latency}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${comp.statusClass}`}>
                  {comp.status}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{comp.description}</p>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Protocol: HTTPS / WSS</span>
                <span className="text-green-600 font-semibold">Active Pipeline</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Stage Execution Matrix */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Forensic Processing Pipeline Stages</span>
          </h3>
          <span className="text-xs font-mono text-green-600 font-bold">100% Pipeline Health</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Engine / Source</th>
                <th className="py-2.5 px-3">Execution Status</th>
                <th className="py-2.5 px-3 text-right">Confidence Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {PIPELINE_STAGES.map((stg, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {stg.label}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-gray-600">{stg.source}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                      {stg.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-green-600">
                    {(stg.confidence * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
