import React, { useState } from 'react';
import { CandidateSuspect, Incident, ScoringWeights } from '../types';
import {
  UserCheck,
  ShieldAlert,
  AlertOctagon,
  Scale,
  Award,
  Clock,
  Compass,
  FileText,
  Sliders,
  CheckCircle2,
  Ship,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface SuspectsViewProps {
  candidates: CandidateSuspect[];
  weights: ScoringWeights;
  onUpdateWeights: React.Dispatch<React.SetStateAction<ScoringWeights>>;
  onResetWeights: () => void;
  incident: Incident;
  onSelectCandidateForReport: (cand: CandidateSuspect) => void;
  onNavigateToReports: () => void;
}

export const SuspectsView: React.FC<SuspectsViewProps> = ({
  candidates,
  weights,
  onUpdateWeights,
  onResetWeights,
  incident,
  onSelectCandidateForReport,
  onNavigateToReports,
}) => {
  const [selectedId, setSelectedId] = useState<string>(candidates[0]?.id || '');

  // Calculate dynamic weighted scores using weights from props
  const totalWeight = weights.proximity + weights.trajectory + weights.behavior + weights.gap || 100;

  const scoredCandidates = candidates
    .map((c) => {
      const dynamicScore = Math.round(
        (c.factors.proximityScore * weights.proximity +
          c.factors.trajectoryScore * weights.trajectory +
          c.factors.behaviorScore * weights.behavior +
          c.factors.gapScore * weights.gap) /
          totalWeight
      );
      return {
        ...c,
        dynamicScore,
      };
    })
    .sort((a, b) => b.dynamicScore - a.dynamicScore);

  const activeCandidate =
    scoredCandidates.find((c) => c.id === selectedId) || scoredCandidates[0] || candidates[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Suspect Ranking & Spill Attribution Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                MARPOL ANNEX I FORENSIC AUDIT
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Multi-criteria mathematical correlation across hydrodynamic backtracks, AIS time windows, speed changes & transponder blackouts
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (activeCandidate) onSelectCandidateForReport(activeCandidate);
            onNavigateToReports();
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate Legal Evidence Packet</span>
        </button>
      </div>

      {/* Grid: Suspect List + Algorithm Weights + In-Depth Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Suspect Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            <span>Ranked Candidates ({scoredCandidates.length})</span>
            <span className="text-[10px] text-gray-400 lowercase">click to audit</span>
          </h3>

          <div className="space-y-2.5">
            {scoredCandidates.map((c, index) => {
              const isSelected = activeCandidate?.id === c.id;
              const isPrime = index === 0;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id);
                    onSelectCandidateForReport(c);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-1 ring-indigo-200'
                      : isPrime
                      ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isPrime
                            ? 'bg-rose-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{c.vessel.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {c.vessel.type} · MMSI: <span className="font-mono text-gray-700">{c.vessel.mmsi}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-black font-mono block ${
                          isPrime ? 'text-rose-600' : 'text-gray-900'
                        }`}
                      >
                        {c.dynamicScore}
                        <span className="text-[10px] text-gray-400 font-normal">/100</span>
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">Attribution</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                    <span className="flex items-center gap-1 font-mono">
                      <Compass className="w-3 h-3 text-blue-500" />
                      CPA: {c.minDistanceToOriginKm.toFixed(1)} km
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      {c.timeOfClosestApproachUtc.split('T')[1] || c.timeOfClosestApproachUtc}
                    </span>
                    {c.isDarkVessel && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                        AIS GAP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Weights Configurator + Detailed Multi-Factor Audit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Algorithm Multi-Factor Weights Adjuster */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3 text-xs text-gray-700">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Multi-Factor Forensic Attribution Weights</span>
              </h3>
              <button
                onClick={onResetWeights}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Spatial Proximity</span>
                  <span className="font-mono text-gray-900">{weights.proximity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={weights.proximity}
                  onChange={(e) =>
                    onUpdateWeights((prev) => ({ ...prev, proximity: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Trajectory Angle</span>
                  <span className="font-mono text-gray-900">{weights.trajectory}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={weights.trajectory}
                  onChange={(e) =>
                    onUpdateWeights((prev) => ({ ...prev, trajectory: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Speed Drop / De-Ballast</span>
                  <span className="font-mono text-gray-900">{weights.behavior}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={weights.behavior}
                  onChange={(e) =>
                    onUpdateWeights((prev) => ({ ...prev, behavior: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                  <span>Dark Transponder Gap</span>
                  <span className="font-mono text-gray-900">{weights.gap}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={weights.gap}
                  onChange={(e) =>
                    onUpdateWeights((prev) => ({ ...prev, gap: Number(e.target.value) }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Active Candidate Detailed Breakdown Card */}
          {activeCandidate && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 text-xs text-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{activeCandidate.vessel.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      Flag: {activeCandidate.vessel.flag} · IMO: {activeCandidate.vessel.imo} · MMSI: {activeCandidate.vessel.mmsi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Attribution Index:</span>
                  <span className="text-2xl font-black font-mono text-indigo-600">
                    {activeCandidate.score} / 100
                  </span>
                </div>
              </div>

              {/* Score Factor Bars */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between font-semibold text-gray-800 mb-1">
                    <span>Spatial Proximity Factor</span>
                    <span className="font-mono font-bold text-gray-900">
                      {activeCandidate.factors.proximityScore} / 100 ({activeCandidate.minDistanceToOriginKm.toFixed(1)} km CPA)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${activeCandidate.factors.proximityScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-800 mb-1">
                    <span>Trajectory Alignment</span>
                    <span className="font-mono font-bold text-gray-900">
                      {activeCandidate.factors.trajectoryScore} / 100 (Offset {activeCandidate.trajectoryAlignmentDeg}°)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${activeCandidate.factors.trajectoryScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-800 mb-1">
                    <span>Speed Drop & De-Ballasting Signature</span>
                    <span className="font-mono font-bold text-gray-900">
                      {activeCandidate.factors.behaviorScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${activeCandidate.factors.behaviorScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-800 mb-1">
                    <span>AIS Transponder Blackout (Dark Activity)</span>
                    <span className="font-mono font-bold text-gray-900">
                      {activeCandidate.factors.gapScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${activeCandidate.factors.gapScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Forensic Summary Narrative */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2 mt-4">
                <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Forensic Audit Findings</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {activeCandidate.explanation.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
