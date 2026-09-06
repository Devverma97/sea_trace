import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  CandidateSuspect,
  Incident,
  MarineWeather,
  ScoringWeights,
} from './types';
import { INCIDENT_SCENARIOS } from './data/mockIncidents';
import {
  fetchHealth,
  fetchLiveMarineWeather,
  computeBackwardHindcast,
  computeForwardForecast,
  evaluateCandidateSuspects,
} from './services/api';
import { Navbar } from './components/Navbar';
import { StatusBanner } from './components/StatusBanner';
import { ApiConfigModal } from './components/ApiConfigModal';
import { TrackerView } from './components/TrackerView';
import { DetectionView } from './components/DetectionView';
import { DriftView } from './components/DriftView';
import { AisView } from './components/AisView';
import { SuspectsView } from './components/SuspectsView';
import { EvidenceView } from './components/EvidenceView';
import { CompareView } from './components/CompareView';
import { ReportsView } from './components/ReportsView';
import { SourcesView } from './components/SourcesView';
import { StatusView } from './components/StatusView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tracker');
  const [selectedIncidentKey, setSelectedIncidentKey] = useState<string>('mumbai-high');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [marineWeather, setMarineWeather] = useState<MarineWeather | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  // Active scenario data
  const currentScenario = useMemo(() => {
    return INCIDENT_SCENARIOS[selectedIncidentKey] || INCIDENT_SCENARIOS['mumbai-high'];
  }, [selectedIncidentKey]);

  // Simulation drift parameters
  const [backwardHours, setBackwardHours] = useState<number>(currentScenario.backwardHours || 12);
  const [forwardHours, setForwardHours] = useState<number>(currentScenario.forwardHours || 24);
  const [currentSpeed, setCurrentSpeed] = useState<number>(currentScenario.defaultCurrentSpeed || 0.85);
  const [currentDir, setCurrentDir] = useState<number>(currentScenario.defaultCurrentDir || 215);
  const [windSpeed, setWindSpeed] = useState<number>(currentScenario.defaultWindSpeed || 13.5);
  const [windDir, setWindDir] = useState<number>(currentScenario.defaultWindDir || 235);

  // Attribution scoring weights
  const [weights, setWeights] = useState<ScoringWeights>({
    proximity: 40,
    trajectory: 30,
    behavior: 15,
    gap: 15,
  });

  // Selected candidate for deep reporting
  const [selectedCandidateForReport, setSelectedCandidateForReport] = useState<CandidateSuspect | undefined>(undefined);

  // Check health and Gemini key availability on mount
  useEffect(() => {
    fetchHealth().then((data) => {
      setHasGeminiKey(data.hasGeminiKey);
    });
  }, []);

  // Fetch Live Marine Weather whenever incident changes or on manual refresh
  const loadMarineWeather = async (lat: number, lng: number) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchLiveMarineWeather(lat, lng);
      setMarineWeather(data);
      if (isLiveMode && data.live) {
        setCurrentSpeed(data.oceanCurrent.velocityKts);
        setCurrentDir(data.oceanCurrent.directionDeg);
        setWindSpeed(data.wind.speedKts);
        setWindDir(data.wind.directionDeg);
      }
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadMarineWeather(currentScenario.incident.lat, currentScenario.incident.lng);
  }, [selectedIncidentKey]);

  // When toggling between Live Mode and Scenario Benchmark
  const handleToggleMode = () => {
    const nextMode = !isLiveMode;
    setIsLiveMode(nextMode);
    if (!nextMode) {
      // Revert to benchmark values
      setCurrentSpeed(currentScenario.defaultCurrentSpeed);
      setCurrentDir(currentScenario.defaultCurrentDir);
      setWindSpeed(currentScenario.defaultWindSpeed);
      setWindDir(currentScenario.defaultWindDir);
      setBackwardHours(currentScenario.backwardHours);
      setForwardHours(currentScenario.forwardHours);
    } else if (marineWeather) {
      // Apply live weather values
      setCurrentSpeed(marineWeather.oceanCurrent.velocityKts);
      setCurrentDir(marineWeather.oceanCurrent.directionDeg);
      setWindSpeed(marineWeather.wind.speedKts);
      setWindDir(marineWeather.wind.directionDeg);
    }
  };

  const handleResetDefaults = () => {
    if (marineWeather && isLiveMode) {
      setCurrentSpeed(marineWeather.oceanCurrent.velocityKts);
      setCurrentDir(marineWeather.oceanCurrent.directionDeg);
      setWindSpeed(marineWeather.wind.speedKts);
      setWindDir(marineWeather.wind.directionDeg);
    } else {
      setCurrentSpeed(currentScenario.defaultCurrentSpeed);
      setCurrentDir(currentScenario.defaultCurrentDir);
      setWindSpeed(currentScenario.defaultWindSpeed);
      setWindDir(currentScenario.defaultWindDir);
    }
    setBackwardHours(currentScenario.backwardHours);
    setForwardHours(currentScenario.forwardHours);
  };

  // Recompute Hydrodynamic Backward Hindcast (origin localization)
  const backwardRun = useMemo(() => {
    return computeBackwardHindcast(
      currentScenario.incident,
      currentScenario.detection,
      currentSpeed,
      currentDir,
      windSpeed,
      windDir,
      backwardHours
    );
  }, [currentScenario, currentSpeed, currentDir, windSpeed, windDir, backwardHours]);

  // Recompute Forward Forecast Dispersion
  const forwardRun = useMemo(() => {
    return computeForwardForecast(
      currentScenario.incident,
      currentScenario.detection,
      currentSpeed,
      currentDir,
      windSpeed,
      windDir,
      forwardHours
    );
  }, [currentScenario, currentSpeed, currentDir, windSpeed, windDir, forwardHours]);

  // Recompute Candidate Suspect Rankings
  const candidates = useMemo(() => {
    if (!backwardRun) return [];
    return evaluateCandidateSuspects(currentScenario.vessels, backwardRun, weights);
  }, [currentScenario.vessels, backwardRun, weights]);

  const primeCandidate = candidates[0];

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedIncidentId={selectedIncidentKey}
        onSelectIncident={(id) => {
          setSelectedIncidentKey(id);
          const sc = INCIDENT_SCENARIOS[id];
          if (sc) {
            setBackwardHours(sc.backwardHours);
            setForwardHours(sc.forwardHours);
            setCurrentSpeed(sc.defaultCurrentSpeed);
            setCurrentDir(sc.defaultCurrentDir);
            setWindSpeed(sc.defaultWindSpeed);
            setWindDir(sc.defaultWindDir);
          }
        }}
        primeSuspectName={primeCandidate?.vessel.name}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Operational Mode & Weather Status Banner */}
      <StatusBanner
        isLiveMode={isLiveMode}
        onToggleMode={handleToggleMode}
        marineWeather={marineWeather}
        onRefreshWeather={() =>
          loadMarineWeather(currentScenario.incident.lat, currentScenario.incident.lng)
        }
        isLoadingWeather={isLoadingWeather}
        onOpenConfig={() => setIsConfigOpen(true)}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'tracker' && (
          <TrackerView
            incident={currentScenario.incident}
            detection={currentScenario.detection}
            backwardRun={backwardRun}
            forwardRun={forwardRun}
            vessels={currentScenario.vessels}
            candidates={candidates}
            marineWeather={marineWeather}
            onSelectCandidate={(cand) => {
              setSelectedCandidateForReport(cand);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'detection' && (
          <DetectionView
            detection={currentScenario.detection}
            incident={currentScenario.incident}
          />
        )}

        {activeTab === 'drift' && (
          <DriftView
            incident={currentScenario.incident}
            detection={currentScenario.detection}
            backwardRun={backwardRun}
            forwardRun={forwardRun}
            backwardHours={backwardHours}
            setBackwardHours={setBackwardHours}
            forwardHours={forwardHours}
            setForwardHours={setForwardHours}
            currentSpeed={currentSpeed}
            setCurrentSpeed={setCurrentSpeed}
            currentDir={currentDir}
            setCurrentDir={setCurrentDir}
            windSpeed={windSpeed}
            setWindSpeed={setWindSpeed}
            windDir={windDir}
            setWindDir={setWindDir}
            marineWeather={marineWeather}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeTab === 'ais' && (
          <AisView
            vessels={currentScenario.vessels}
            candidates={candidates}
            incident={currentScenario.incident}
            onSelectCandidate={(cand) => setSelectedCandidateForReport(cand)}
            onNavigateToSuspects={() => setActiveTab('suspects')}
          />
        )}

        {activeTab === 'suspects' && (
          <SuspectsView
            candidates={candidates}
            weights={weights}
            onUpdateWeights={setWeights}
            onResetWeights={() =>
              setWeights({ proximity: 40, trajectory: 30, behavior: 15, gap: 15 })
            }
            incident={currentScenario.incident}
            onSelectCandidateForReport={(cand) => setSelectedCandidateForReport(cand)}
            onNavigateToReports={() => setActiveTab('reports')}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceView
            events={currentScenario.evidenceEvents}
            incident={currentScenario.incident}
            primeSuspect={primeCandidate}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            incident={currentScenario.incident}
            detection={currentScenario.detection}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            incident={currentScenario.incident}
            detection={currentScenario.detection}
            candidates={candidates}
            backwardRun={backwardRun}
            marineWeather={marineWeather}
            selectedCandidateForReport={selectedCandidateForReport}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesView onOpenConfig={() => setIsConfigOpen(true)} />
        )}

        {activeTab === 'status' && (
          <StatusView
            hasGeminiKey={hasGeminiKey}
            marineWeather={marineWeather}
            isLiveMode={isLiveMode}
            onOpenConfig={() => setIsConfigOpen(true)}
          />
        )}
      </main>

      {/* API Key & Provider Configuration Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        hasGeminiKey={hasGeminiKey}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
      />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 px-6 text-xs text-gray-500 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">SeaTrace Maritime Investigation Platform</span>
            <span>·</span>
            <span>Version 2.4 (Live Feeds Active)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span>Copernicus Sentinel-1 SAR</span>
            <span>OpenDrift RK4</span>
            <span>CMEMS & NOAA GFS</span>
            <span>Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
