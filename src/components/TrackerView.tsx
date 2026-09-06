import React, { useState } from 'react';
import {
  Incident,
  SlickDetection,
  DriftRun,
  Vessel,
  CandidateSuspect,
  MarineWeather,
} from '../types';
import { MarineMap } from './MarineMap';
import {
  Search,
  Filter,
  Ship,
  Compass,
  Wind,
  Waves,
  AlertOctagon,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Radio,
} from 'lucide-react';

interface TrackerViewProps {
  incident: Incident;
  detection: SlickDetection;
  backwardRun: DriftRun | null;
  forwardRun: DriftRun | null;
  vessels: Vessel[];
  candidates: CandidateSuspect[];
  marineWeather: MarineWeather | null;
  onSelectCandidate: (candidate: CandidateSuspect) => void;
  onNavigateToTab: (tab: any) => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({
  incident,
  detection,
  backwardRun,
  forwardRun,
  vessels,
  candidates,
  marineWeather,
  onSelectCandidate,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(
    candidates[0]?.vessel || vessels[0] || null
  );

  const primeCandidate = candidates[0];

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mmsi.includes(searchQuery) ||
      v.imo.includes(searchQuery);
    const matchesType =
      filterType === 'ALL'
        ? true
        : filterType === 'TANKER'
        ? v.type.toLowerCase().includes('tanker')
        : filterType === 'CARGO'
        ? v.type.toLowerCase().includes('container') || v.type.toLowerCase().includes('bulk')
        : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Metric 1: Incident Name & Sector */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Active Incident
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {incident.status}
            </span>
          </div>
          <div className="my-2">
            <h3 className="text-base font-bold text-gray-900 truncate">{incident.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{incident.region}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-2 border-t border-gray-100 font-mono">
            <span>Lat: {incident.lat.toFixed(2)}°N</span>
            <span>Lng: {incident.lng.toFixed(2)}°E</span>
          </div>
        </div>

        {/* Metric 2: Slick Extent */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Slick Extent
          </span>
          <div className="my-2">
            <span className="text-2xl font-black text-amber-600">{detection.spillAreaKm2}</span>
            <span className="text-xs text-gray-500 ml-1 font-medium">km²</span>
          </div>
          <p className="text-[10px] text-gray-500 truncate">Est. {incident.estimatedVolumeBarrels.toLocaleString()} bbls</p>
        </div>

        {/* Metric 3: Hydrodynamic Drift Forcing */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Drift Forcing
          </span>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-600">
              {marineWeather?.oceanCurrent.velocityKts || 0.8}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              kts @ {marineWeather?.oceanCurrent.directionDeg || 220}°
            </span>
          </div>
          <p className="text-[10px] text-green-700 font-semibold truncate flex items-center gap-1">
            <Waves className="w-3 h-3 text-blue-500" />
            <span>Open-Meteo Live</span>
          </p>
        </div>

        {/* Metric 4: Correlated Vessels */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Tracked Vessels
          </span>
          <div className="my-2">
            <span className="text-2xl font-black text-gray-900">{vessels.length}</span>
            <span className="text-xs text-gray-500 ml-1 font-medium">in sector</span>
          </div>
          <p className="text-[10px] text-gray-500 truncate">{candidates.length} suspects ranked</p>
        </div>

        {/* Metric 5: Prime Suspect Card */}
        <div
          onClick={() => onNavigateToTab('suspects')}
          className="col-span-2 md:col-span-4 lg:col-span-1 bg-rose-50/50 border border-rose-200 rounded-xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-rose-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" /> #1 Prime Suspect
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="my-1.5">
            <h4 className="text-sm font-bold text-gray-900 truncate">{primeCandidate?.vessel.name || 'None'}</h4>
            <p className="text-[11px] text-rose-700 font-semibold">Match: {primeCandidate?.score || 0}/100</p>
          </div>
          <span className="text-[9px] text-rose-600 font-mono font-bold">
            {primeCandidate?.isDarkVessel ? '⚠️ AIS GAP DETECTED' : 'Active Broadcast'}
          </span>
        </div>
      </div>

      {/* Main Tactical Map & Vessel Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map (3 Columns on Large Screens) */}
        <div className="lg:col-span-3 space-y-3">
          <MarineMap
            incident={incident}
            detection={detection}
            backwardRun={backwardRun}
            forwardRun={forwardRun}
            vessels={vessels}
            candidates={candidates}
            selectedVesselId={selectedVessel?.id}
            onSelectVessel={(v) => {
              setSelectedVessel(v);
              const c = candidates.find((cand) => cand.vessel.id === v.id);
              if (c) onSelectCandidate(c);
            }}
            heightClass="h-[620px]"
          />

          {/* Quick Inspector card for selected vessel */}
          {selectedVessel && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{selectedVessel.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 font-medium">
                      {selectedVessel.type}
                    </span>
                    {selectedVessel.aisGaps.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-semibold">
                        Dark Gap: {selectedVessel.aisGaps[0].durationHours}h
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    MMSI: <span className="font-mono text-gray-800 font-medium">{selectedVessel.mmsi}</span> · IMO:{' '}
                    <span className="font-mono text-gray-800 font-medium">{selectedVessel.imo}</span> · Flag:{' '}
                    <span className="text-gray-800 font-medium">{selectedVessel.flag}</span> · Destination:{' '}
                    <span className="text-gray-800 font-medium">{selectedVessel.destination}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Speed & Heading</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">
                    {selectedVessel.currentSpeed} kts @ {selectedVessel.currentHeading}°
                  </span>
                </div>

                <button
                  onClick={() => {
                    const c = candidates.find((cand) => cand.vessel.id === selectedVessel.id);
                    if (c) {
                      onSelectCandidate(c);
                      onNavigateToTab('suspects');
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <span>Forensic Audit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vessel Sidebar (1 Column) */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[700px] text-gray-700">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-600" />
              <span>AIS Vessel Corridor</span>
            </h3>
            <span className="text-[10px] text-gray-400 font-mono font-bold">
              {filteredVessels.length} VESSELS
            </span>
          </div>

          {/* Search bar */}
          <div className="my-3 relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vessels, MMSI, IMO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 mb-3 text-[11px] font-medium">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('TANKER')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'TANKER'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tankers
            </button>
            <button
              onClick={() => setFilterType('CARGO')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                filterType === 'CARGO'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cargo
            </button>
          </div>

          {/* Scrollable Vessel List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredVessels.map((v) => {
              const cand = candidates.find((c) => c.vessel.id === v.id);
              const isSelected = selectedVessel?.id === v.id;
              const isPrime = cand?.rank === 1;

              return (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVessel(v);
                    if (cand) onSelectCandidate(cand);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 shadow-xs'
                      : isPrime
                      ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900">{v.name}</span>
                        {cand && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              cand.rank === 1
                                ? 'bg-rose-600 text-white'
                                : cand.rank <= 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            #{cand.rank}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {v.type} · MMSI: <span className="font-mono text-gray-700">{v.mmsi}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono font-bold text-gray-900 block">
                        {v.currentSpeed} kts
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">{v.currentHeading}°</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                    <span>Dest: {v.destination}</span>
                    {v.aisGaps.length > 0 ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        Dark Gap
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">AIS Ok</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
