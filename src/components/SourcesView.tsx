import React from 'react';
import { Globe, Satellite, Radio, Sparkles, Waves, ExternalLink, ShieldCheck, Key } from 'lucide-react';

interface SourcesViewProps {
  onOpenConfig: () => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({ onOpenConfig }) => {
  const sources = [
    {
      title: 'Copernicus Sentinel-1 SAR (ESA)',
      badge: 'Free Open Access',
      badgeColor: 'bg-green-50 text-green-700 border-green-200',
      description:
        'Synthetic Aperture Radar (C-SAR) operating in Interferometric Wide (IW) swath mode. Provides 10-meter spatial resolution imagery capable of day-and-night all-weather ocean surface roughness observation.',
      specs: ['Band: C-Band (5.405 GHz)', 'Polarization: VV + VH', 'Revisit: 6-12 days', 'Latency: < 3 hours Fast24'],
      link: 'https://dataspace.copernicus.eu/',
      icon: Satellite,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 border-teal-100',
    },
    {
      title: 'Open-Meteo CMEMS & NOAA GFS',
      badge: 'Live Stream Active (No Key Needed)',
      badgeColor: 'bg-green-50 text-green-700 border-green-200',
      description:
        'Supplies high-resolution oceanic and atmospheric forcing vectors. Incorporates Mercator Ocean International global hydrodynamic current simulations and NOAA Global Forecast System wind leeway models.',
      specs: [
        'Current: Surface velocity (kts) & heading',
        'Wind: 10m vector + gusts',
        'Waves: Significant height & swell',
        'Update: Hourly real-time assimilation',
      ],
      link: 'https://open-meteo.com/en/docs/marine-weather-api',
      icon: Waves,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'Google Gemini 2.5 Flash AI',
      badge: 'Server Key Configured',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description:
        'State-of-the-art multimodal reasoning model powering automated MARPOL Annex I violation audits, dielectric signature validation, and evidence cross-examination.',
      specs: [
        'Model: gemini-2.5-flash',
        'Context: Long forensic window',
        'Output: Legal dossiers & enforcement notices',
        'Host: Google AI Studio Server Core',
      ],
      link: 'https://ai.google.dev/',
      icon: Sparkles,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'AIS Global Marine Stream (Class A & B)',
      badge: 'Connected',
      badgeColor: 'bg-green-50 text-green-700 border-green-200',
      description:
        'Terrestrial VHF receiver networks and low Earth orbit (LEO) satellite constellations capturing dynamic vessel positional beacons, speed over ground, course over ground, and transponder downtime.',
      specs: [
        'MMSI & IMO vessel identification',
        'Dead-reckoning trajectory interpolation',
        'Automated dark transponder gap detection',
        'Standard: ITU-R M.1371',
      ],
      link: 'https://aisstream.io/',
      icon: Radio,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Authoritative Data Providers & Standards</h2>
            <p className="text-xs text-gray-500 mt-1">
              Real-time spaceborne earth observation, numerical weather prediction, and maritime intelligence architectures
            </p>
          </div>
        </div>

        <button
          onClick={onOpenConfig}
          className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-indigo-600" />
          <span>API Key & Provider Config</span>
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src, idx) => {
          const Icon = src.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-gray-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${src.iconBg}`}>
                      <Icon className={`w-5 h-5 ${src.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{src.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${src.badgeColor}`}>
                        {src.badge}
                      </span>
                    </div>
                  </div>

                  <a
                    href={src.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-800 border border-gray-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mt-3">{src.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1.5">
                  Technical Specifications
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-gray-700">
                  {src.specs.map((s, i) => (
                    <div key={i} className="flex items-center gap-1 truncate">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span className="truncate">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
