import React from 'react';
import {
  Compass,
  Radar,
  Waves,
  Radio,
  UserCheck,
  FileText,
  Layers,
  Sparkles,
  Server,
  Activity,
  ChevronDown,
} from 'lucide-react';
import { ActiveTab, Incident } from '../types';
import { INCIDENT_SCENARIOS } from '../data/mockIncidents';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  primeSuspectName?: string;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedIncidentId,
  onSelectIncident,
  primeSuspectName,
  hasGeminiKey,
}) => {
  const tabs = [
    { id: 'tracker' as ActiveTab, label: 'Marine Tracker', icon: Compass },
    { id: 'detection' as ActiveTab, label: 'SAR Detection', icon: Radar },
    { id: 'drift' as ActiveTab, label: 'Drift Analysis', icon: Waves },
    { id: 'ais' as ActiveTab, label: 'AIS Correlation', icon: Radio },
    { id: 'suspects' as ActiveTab, label: 'Suspects & Attribution', icon: UserCheck },
    { id: 'evidence' as ActiveTab, label: 'Evidence Timeline', icon: Layers },
    { id: 'compare' as ActiveTab, label: 'SAR Compare', icon: Activity },
    { id: 'reports' as ActiveTab, label: 'AI Investigation Reports', icon: FileText },
    { id: 'status' as ActiveTab, label: 'System & Providers', icon: Server },
  ];

  return (
    <header className="bg-white border-b border-gray-200 text-gray-800 sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title matching Design HTML: Indigo S icon + SeaTrace Pro title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                SeaTrace <span className="text-indigo-600 font-extrabold">Pro</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">
                Live Feeds
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
              Satellite SAR · Hydrodynamics · Vessel Intercept
            </p>
          </div>
        </div>

        {/* Incident Scenario Selector & Prime Suspect Banner */}
        <div className="flex items-center space-x-3">
          {/* Prime Suspect Pill */}
          {primeSuspectName && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold text-rose-600">Prime Suspect:</span>
              <span className="font-bold text-gray-900">{primeSuspectName}</span>
            </div>
          )}

          {/* Incident Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-xs text-gray-500 font-medium hidden lg:inline">Incident:</label>
            <div className="relative">
              <select
                value={selectedIncidentId}
                onChange={(e) => onSelectIncident(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white cursor-pointer font-medium shadow-sm transition-all"
              >
                {Object.entries(INCIDENT_SCENARIOS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.incident.name} ({item.incident.spillAreaKm2} km²)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs row styled in Clean Minimalism */}
      <div className="px-4 border-t border-gray-100 overflow-x-auto flex items-center space-x-1.5 scrollbar-thin py-1.5 bg-gray-50/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'reports' && hasGeminiKey && (
                <Sparkles className="w-3 h-3 text-amber-300" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
