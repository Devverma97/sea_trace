import React, { useState } from 'react';
import { Vessel, CandidateSuspect, Incident } from '../types';
import {
  Radio,
  Search,
  Filter,
  AlertOctagon,
  CheckCircle2,
  Ship,
  ExternalLink,
  Clock,
  Navigation,
  ShieldAlert,
} from 'lucide-react';

interface AisViewProps {
  vessels: Vessel[];
  candidates: CandidateSuspect[];
  incident: Incident;
  onSelectCandidate: (candidate: CandidateSuspect) => void;
  onNavigateToSuspects: () => void;
}

export const AisView: React.FC<AisViewProps> = ({
  vessels,
  candidates,
  incident,
  onSelectCandidate,
  onNavigateToSuspects,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessel, setSelectedVessel] = useState<Vessel>(vessels[0]);

  const filteredVessels = vessels.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.mmsi.includes(searchTerm) ||
      v.imo.includes(searchTerm) ||
      v.flag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-xs">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">AIS Spatio-Temporal Vessel Intercept</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                LIVE HYBRID RECEIVER STREAM
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Class A & B AIS transponder decoding, speed profile reconstruction, and dark transponder gap forensics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-700">
            Sector Vessels: <strong className="text-gray-900">{vessels.length}</strong>
          </div>
          <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-700">
            Suspicious Dark Gaps:{' '}
            <strong className="text-rose-700 font-bold">
              {vessels.filter((v) => v.aisGaps.length > 0).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Vessel Registry Table & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Vessel Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Ship className="w-4 h-4 text-indigo-600" />
              <span>Correlated Vessels in Investigation Box</span>
            </h3>

            {/* Search */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search MMSI, IMO, vessel name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Vessel Name</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-2">MMSI / IMO</th>
                  <th className="py-2.5 px-2">SOG / COG</th>
                  <th className="py-2.5 px-2">AIS Integrity</th>
                  <th className="py-2.5 px-2">Forensic Rank</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {filteredVessels.map((v) => {
                  const cand = candidates.find((c) => c.vessel.id === v.id);
                  const isSelected = selectedVessel.id === v.id;
                  const isDark = v.aisGaps.length > 0;

                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVessel(v)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/80 text-gray-900 font-semibold'
                          : 'hover:bg-gray-50/80 text-gray-700'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-gray-900 flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-gray-400" />
                        {v.name}
                      </td>
                      <td className="py-2.5 px-2 font-sans text-gray-500">{v.type}</td>
                      <td className="py-2.5 px-2">
                        {v.mmsi}
                        <span className="block text-[10px] text-gray-400">{v.imo}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        {v.currentSpeed} kts @ {v.currentHeading}°
                      </td>
                      <td className="py-2.5 px-2">
                        {isDark ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertOctagon className="w-3 h-3" />
                            {v.aisGaps[0].durationHours}h Dark
                          </span>
                        ) : (
                          <span className="text-green-600 text-[10px] font-sans font-medium">Continuous</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2">
                        {cand ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cand.rank === 1
                                ? 'bg-rose-600 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            #{cand.rank} ({cand.score})
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cand) {
                              onSelectCandidate(cand);
                              onNavigateToSuspects();
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-gray-100 hover:bg-indigo-600 hover:text-white text-gray-700 text-[10px] font-sans font-semibold transition-colors cursor-pointer"
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Detailed Selected Vessel Inspector */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 text-xs text-gray-700">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Vessel Forensic Profile
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono font-medium">
              {selectedVessel.flag}
            </span>
          </div>

          <div>
            <h4 className="text-base font-bold text-gray-900">{selectedVessel.name}</h4>
            <p className="text-[11px] text-gray-500">
              {selectedVessel.type} · Length {selectedVessel.lengthM}m × Beam {selectedVessel.beamM}m
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[10px]">MMSI</span>
              <span className="text-gray-900 font-bold">{selectedVessel.mmsi}</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[10px]">IMO Number</span>
              <span className="text-gray-900 font-bold">{selectedVessel.imo}</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[10px]">Deadweight (DWT)</span>
              <span className="text-gray-900 font-bold">{selectedVessel.dwt.toLocaleString()} MT</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-400 block text-[10px]">Draught</span>
              <span className="text-gray-900 font-bold">{selectedVessel.draughtM} m</span>
            </div>
          </div>

          {/* AIS Gap Alert Box */}
          {selectedVessel.aisGaps.length > 0 ? (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                <AlertOctagon className="w-4 h-4" />
                <span>Unexplained AIS Transponder Blackout</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                Transponder went silent for <strong>{selectedVessel.aisGaps[0].durationHours} hours</strong> while
                transiting directly across the backtracked spill origin. Last signal at{' '}
                {selectedVessel.aisGaps[0].lastKnownPoint.lat.toFixed(2)}°N,{' '}
                {selectedVessel.aisGaps[0].lastKnownPoint.lng.toFixed(2)}°E. Reappeared 24 NM away with speed reduced
                from 13.5 to 8.2 kts.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full continuous AIS broadcast recorded throughout sector passage.</span>
            </div>
          )}

          {/* Behavioral Notes */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h5 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">
              Automated Anomaly Audit
            </h5>
            <ul className="space-y-1.5 text-[11px] text-gray-600">
              {selectedVessel.behaviorNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
