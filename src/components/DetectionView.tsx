import React from 'react';
import { SlickDetection, Incident } from '../types';
import {
  Satellite,
  Radar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Droplets,
  ShieldCheck,
  Maximize2,
  FileCheck,
  Eye,
} from 'lucide-react';

interface DetectionViewProps {
  detection: SlickDetection;
  incident: Incident;
}

export const DetectionView: React.FC<DetectionViewProps> = ({ detection, incident }) => {
  const scores = detection.lookAlikeScores;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
            <Satellite className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Satellite SAR Oil Spill Detection</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CONFIRMED MINERAL OIL
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) C-Band Interferometric Wide (IW) Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-right">
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold">
              Detection Confidence
            </span>
            <span className="text-xl font-black text-green-600 font-mono">
              {(detection.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-right">
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold">
              Surface Area
            </span>
            <span className="text-xl font-black text-amber-600 font-mono">{detection.spillAreaKm2} km²</span>
          </div>
        </div>
      </div>

      {/* Grid: SAR Metrics & Look-Alike Rejection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Acquisition & Characterization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: SAR Characteristics */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Radar className="w-4 h-4 text-indigo-600" />
              <span>Synthetic Aperture Radar (SAR) Inversion</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Polarization</span>
                <span className="font-bold text-gray-800 font-mono mt-0.5 block">{detection.polarization}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Spatial Resolution</span>
                <span className="font-bold text-gray-800 font-mono mt-0.5 block">{incident.resolutionM}m GRD</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Oil Slick Thickness</span>
                <span className="font-bold text-gray-800 font-mono mt-0.5 block">{detection.thicknessUm}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Est. Discharged Volume</span>
                <span className="font-bold text-amber-600 font-mono mt-0.5 block">
                  ~{detection.estimatedVolumeM3} m³ ({incident.estimatedVolumeBarrels} bbls)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/70 border border-gray-100 space-y-2">
              <h4 className="text-xs font-bold text-gray-800">Dielectric Capillary Wave Dampening Analysis</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Oil films on seawater damp capillary gravity waves (wavelength 1-5 cm), significantly decreasing
                surface Bragg scattering. This creates pronounced dark signatures in radar backscatter (σ₀). The
                Sentinel-1 IW normalized radar cross section reveals a -14.2 dB drop relative to surrounding ambient
                clean water, consistent with heavy hydrocarbon slick suppression.
              </p>
            </div>
          </div>

          {/* Slick Geometry & Coordinates */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Slick Delineation & Spatial Centroid</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block">Centroid Latitude</span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {detection.spillCentroid.lat.toFixed(5)}° N
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block">Centroid Longitude</span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {detection.spillCentroid.lng.toFixed(5)}° E
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block">Identified Oil Classification</span>
                <span className="font-bold text-amber-600 text-sm">{incident.oilType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Look-Alike Rejection Module */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Look-Alike Rejection</span>
              </h3>
              <span className="text-xs font-mono font-bold text-green-600">
                {(scores.overallRejectionConfidence * 100).toFixed(0)}% CONFIDENCE
              </span>
            </div>

            <p className="text-xs text-gray-600">
              Natural oceanic phenomena frequently mimic oil slicks in SAR imagery. Multi-spectral filters rule out
              false positives:
            </p>

            <div className="space-y-3 text-xs">
              {/* Feature 1: Low Wind Shelter */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Low-Wind Shelter (&lt; 2.5 m/s)</span>
                  <span className="text-green-600 font-mono font-bold">REJECTED ({(scores.lowWindShelter * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${scores.lowWindShelter * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 block">Ambient wind speed measured at 13.5 kts (ideal SAR window).</span>
              </div>

              {/* Feature 2: Biogenic Film */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Natural Biogenic Film / Fish Oils</span>
                  <span className="text-green-600 font-mono font-bold">REJECTED ({(scores.biogenicFilm * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${scores.biogenicFilm * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 block">Boundary gradient sharpness characteristic of mineral oil.</span>
              </div>

              {/* Feature 3: Algal Bloom */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Algal Bloom / Chlorophyll-a</span>
                  <span className="text-green-600 font-mono font-bold">REJECTED ({(scores.algalBloom * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${scores.algalBloom * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 block">Sentinel-3 OLCI optical corroboration confirms zero bloom index.</span>
              </div>

              {/* Feature 4: Internal Waves */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Internal Waves / Bathymetric Upwelling</span>
                  <span className="text-green-600 font-mono font-bold">REJECTED ({(scores.internalWaves * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${scores.internalWaves * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 block">Spatial morphology lacks periodic wave soliton crests.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
