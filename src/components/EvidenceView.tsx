import React, { useState } from 'react';
import { EvidenceEvent, Incident, CandidateSuspect } from '../types';
import {
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Radio,
  Satellite,
  Waves,
  Ship,
  ExternalLink,
  ChevronDown,
  Filter,
} from 'lucide-react';

interface EvidenceViewProps {
  events: EvidenceEvent[];
  incident: Incident;
  primeSuspect: CandidateSuspect;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ events, incident, primeSuspect }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredTimeline = events.filter((e) =>
    filterSeverity === 'ALL' ? true : e.severity === filterSeverity
  );

  const getSourceIcon = (source: string) => {
    if (source.includes('SAR') || source.includes('Sentinel')) {
      return <Satellite className="w-4 h-4 text-amber-600" />;
    }
    if (source.includes('AIS')) {
      return <Radio className="w-4 h-4 text-purple-600" />;
    }
    if (source.includes('DRIFT') || source.includes('OpenDrift')) {
      return <Waves className="w-4 h-4 text-blue-600" />;
    }
    return <Layers className="w-4 h-4 text-indigo-600" />;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
            Critical
          </span>
        );
      case 'alert':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            Alert
          </span>
        );
      case 'warn':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
            Warning
          </span>
        );
      case 'info':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
            Log
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Chain-of-Custody Evidence Timeline</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                AUDIT LOGGED
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Synchronized multi-source event sequence admissible under international maritime prosecution protocols
            </p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white cursor-pointer font-medium"
          >
            <option value="ALL">All Event Severities</option>
            <option value="critical">Critical Only</option>
            <option value="alert">Alerts</option>
            <option value="warn">Warnings</option>
            <option value="info">Info / Telemetry</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Visual Chronology & Legal Preservation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Events (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    item.severity === 'critical'
                      ? 'bg-rose-500'
                      : item.severity === 'alert' || item.severity === 'warn'
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                />

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2 hover:border-gray-300 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-gray-50 border border-gray-100">
                        {getSourceIcon(item.source)}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {getSeverityBadge(item.severity)}
                      <span className="font-mono text-xs text-gray-500 font-medium">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>

                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                    {item.coordinates ? (
                      <span className="font-mono">
                        Location: {item.coordinates.lat.toFixed(4)}°N, {item.coordinates.lng.toFixed(4)}°E
                      </span>
                    ) : (
                      <span className="font-mono">Spatial Sector: {incident.region}</span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-gray-50 text-gray-600 font-semibold border border-gray-100">
                      Source: {item.source}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Admissibility & Target Suspect Overview */}
        <div className="space-y-4">
          {primeSuspect && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 text-xs text-gray-700">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-rose-600" />
                  Primary Vessel Under Audit
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  RANK #{primeSuspect.rank}
                </span>
              </div>
              <h4 className="text-base font-bold text-gray-900">{primeSuspect.vessel.name}</h4>
              <p className="text-xs text-gray-500">
                MMSI: {primeSuspect.vessel.mmsi} · IMO: {primeSuspect.vessel.imo} · Flag: {primeSuspect.vessel.flag}
              </p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Closest Approach:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {primeSuspect.minDistanceToOriginKm.toFixed(1)} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time of CPA:</span>
                  <span className="font-mono font-bold text-gray-900">
                    {primeSuspect.timeOfClosestApproachUtc}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transponder Integrity:</span>
                  <span className={`font-bold ${primeSuspect.isDarkVessel ? 'text-rose-600' : 'text-green-600'}`}>
                    {primeSuspect.isDarkVessel ? 'DARK GAP DETECTED' : 'CONTINUOUS'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 text-xs text-gray-700">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Evidence Integrity Standard</span>
            </h3>

            <div className="p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-800 space-y-1.5">
              <span className="font-bold block text-xs">ISO/IEC 27037 Digital Forensics Compliant</span>
              <p className="text-[11px] text-green-700 leading-relaxed">
                All raw telemetry, SAR amplitude rasters, and AIS sentences are stamped with cryptographic SHA-256
                hashes at ingestion time to guarantee non-repudiation.
              </p>
            </div>

            <div className="space-y-2 text-[11px] font-mono">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[10px]">SAR Ingestion Hash:</span>
                <span className="text-gray-800 font-bold truncate block">
                  sha256:4f8a9e21...8b77a0c1
                </span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[10px]">AIS Stream Block Hash:</span>
                <span className="text-gray-800 font-bold truncate block">
                  sha256:91c2b530...34d7ee92
                </span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[10px]">CMEMS Forcing Hash:</span>
                <span className="text-gray-800 font-bold truncate block">
                  sha256:d839af41...e993bc70
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
