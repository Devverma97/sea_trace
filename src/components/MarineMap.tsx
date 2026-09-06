import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  CandidateSuspect,
  DriftRun,
  GeoPoint,
  Incident,
  SlickDetection,
  Vessel,
} from '../types';
import { Layers, Eye, Navigation, Ship, AlertTriangle, Crosshair } from 'lucide-react';

interface MarineMapProps {
  incident: Incident;
  detection: SlickDetection;
  backwardRun: DriftRun | null;
  forwardRun: DriftRun | null;
  vessels: Vessel[];
  candidates: CandidateSuspect[];
  selectedVesselId?: string;
  onSelectVessel?: (vessel: Vessel) => void;
  heightClass?: string;
}

export const MarineMap: React.FC<MarineMapProps> = ({
  incident,
  detection,
  backwardRun,
  forwardRun,
  vessels,
  candidates,
  selectedVesselId,
  onSelectVessel,
  heightClass = 'h-[580px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [baseMap, setBaseMap] = useState<'light' | 'dark' | 'satellite' | 'osm'>('light');
  const [showSlick, setShowSlick] = useState(true);
  const [showBacktrack, setShowBacktrack] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showTracks, setShowTracks] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [incident.lat, incident.lng],
        zoom: 9,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when incident changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([incident.lat, incident.lng], 9);
    }
  }, [incident.id, incident.lat, incident.lng]);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let attribution = '';

    if (baseMap === 'light') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
    } else if (baseMap === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
    } else if (baseMap === 'satellite') {
      tileUrl =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri';
    } else {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution,
    });
    tileLayer.addTo(map);
  }, [baseMap]);

  // Render Overlays: Slick, Hindcast, Forecast, Vessels, Tracks
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Oil Slick Polygon & Centroid
    if (showSlick && detection?.polygon && detection.polygon.length > 2) {
      const latLngs = detection.polygon.map((p) => [p.lat, p.lng] as [number, number]);

      // Outer slick perimeter
      const slickPolygon = L.polygon(latLngs, {
        color: '#f59e0b',
        weight: 2,
        fillColor: '#1e293b',
        fillOpacity: 0.75,
        dashArray: '3, 4',
      });
      slickPolygon.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
          <strong style="color: #b45309;">DETECTED OIL SPILL SLICK</strong><br/>
          Area: <strong>${detection.spillAreaKm2} km²</strong><br/>
          Thickness: ${detection.thicknessUm}<br/>
          Volume: ~${detection.estimatedVolumeM3} m³<br/>
          Sensor: ${detection.sensor}
        </div>
      `);
      group.addLayer(slickPolygon);

      // Spill centroid pulse marker
      const centroidIcon = L.divIcon({
        className: 'custom-centroid-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(245, 158, 11, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b; border: 2px solid #ffffff; box-shadow: 0 0 8px rgba(0,0,0,0.6);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const centroidMarker = L.marker([detection.spillCentroid.lat, detection.spillCentroid.lng], {
        icon: centroidIcon,
      });
      centroidMarker.bindTooltip(`Centroid: ${detection.spillAreaKm2} km² Slick`, {
        permanent: false,
        direction: 'top',
      });
      group.addLayer(centroidMarker);
    }

    // 2. Backward Hindcast (Backtracking drift to origin)
    if (showBacktrack && backwardRun) {
      // Draw ensemble trajectories
      if (backwardRun.trajectories) {
        backwardRun.trajectories.forEach((traj, idx) => {
          const pts = traj.map((p) => [p.lat, p.lng] as [number, number]);
          const line = L.polyline(pts, {
            color: '#38bdf8',
            weight: idx === 0 ? 2.5 : 1.2,
            opacity: idx === 0 ? 0.9 : 0.4,
            dashArray: idx === 0 ? undefined : '4, 4',
          });
          group.addLayer(line);
        });
      }

      // Draw Origin Ellipse / Zone
      if (backwardRun.originEllipse) {
        const origin = backwardRun.originEllipse.center;
        const originCircle = L.circle([origin.lat, origin.lng], {
          radius: backwardRun.originEllipse.semiMajorKm * 1000,
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          dashArray: '6, 6',
        });
        originCircle.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
            <strong style="color: #dc2626;">RECONSTRUCTED DISCHARGE ORIGIN</strong><br/>
            Backtracked window: <strong>~${backwardRun.durationHours}h prior</strong><br/>
            Origin Ellipse Radius: ${backwardRun.originEllipse.semiMajorKm} km<br/>
            Current Drift: ~100% ocean vector + 3% leeway
          </div>
        `);
        group.addLayer(originCircle);

        // Origin target icon
        const originIcon = L.divIcon({
          className: 'custom-origin-marker',
          html: `
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #ef4444; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 0 10px rgba(239,68,68,0.8);">
              ✕
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon });
        originMarker.bindTooltip('Probable Release Point', { permanent: true, direction: 'right' });
        group.addLayer(originMarker);
      }
    }

    // 3. Forward Forecast Dispersion
    if (showForecast && forwardRun?.trajectories) {
      forwardRun.trajectories.forEach((traj) => {
        const pts = traj.map((p) => [p.lat, p.lng] as [number, number]);
        const line = L.polyline(pts, {
          color: '#a855f7',
          weight: 1.2,
          opacity: 0.35,
          dashArray: '3, 4',
        });
        group.addLayer(line);
      });

      // Forecast particles
      forwardRun.particles.forEach((p) => {
        const particleMarker = L.circleMarker([p.lat, p.lng], {
          radius: 3,
          color: '#c084fc',
          weight: 1,
          fillColor: '#9333ea',
          fillOpacity: 0.6,
        });
        group.addLayer(particleMarker);
      });
    }

    // 4. Vessel Tracks & Markers
    vessels.forEach((vessel) => {
      const cand = candidates.find((c) => c.vessel.id === vessel.id);
      const isPrime = cand?.rank === 1;
      const isSelected = selectedVesselId === vessel.id;

      // Draw Vessel Track
      if (showTracks && vessel.positions.length > 1) {
        const trackPts = vessel.positions.map((p) => [p.lat, p.lng] as [number, number]);
        const trackLine = L.polyline(trackPts, {
          color: isPrime ? '#f43f5e' : isSelected ? '#38bdf8' : '#64748b',
          weight: isPrime ? 3 : isSelected ? 2.5 : 1.5,
          opacity: isPrime ? 0.9 : 0.5,
          dashArray: vessel.aisGaps.length > 0 ? '5, 5' : undefined,
        });
        group.addLayer(trackLine);
      }

      // Draw Vessel Marker
      if (showVessels && vessel.positions.length > 0) {
        const lastPos = vessel.positions[vessel.positions.length - 1];
        const heading = vessel.currentHeading || 0;

        let badgeColor = '#64748b';
        let badgeText = '';
        if (cand) {
          if (cand.rank === 1) {
            badgeColor = '#f43f5e';
            badgeText = '#1 SUSPECT';
          } else if (cand.rank === 2) {
            badgeColor = '#f59e0b';
            badgeText = '#2';
          } else if (cand.rank === 3) {
            badgeColor = '#eab308';
            badgeText = '#3';
          }
        }

        const vesselIcon = L.divIcon({
          className: 'custom-vessel-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              ${
                badgeText
                  ? `<span style="background: ${badgeColor}; color: white; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 4px; margin-bottom: 2px; box-shadow: 0 1px 4px rgba(0,0,0,0.5);">${badgeText}</span>`
                  : ''
              }
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${
                isPrime ? '#f43f5e' : isSelected ? '#38bdf8' : '#0f172a'
              }; border: 2px solid ${
            isPrime ? '#ffffff' : '#94a3b8'
          }; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 2px 6px rgba(0,0,0,0.7);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
                </svg>
              </div>
            </div>
          `,
          iconSize: [36, 42],
          iconAnchor: [18, 28],
        });

        const marker = L.marker([lastPos.lat, lastPos.lng], { icon: vesselIcon });

        marker.on('click', () => {
          if (onSelectVessel) {
            onSelectVessel(vessel);
          }
        });

        marker.bindTooltip(
          `<div><strong>${vessel.name}</strong><br/>MMSI: ${vessel.mmsi}<br/>SOG: ${vessel.currentSpeed} kts | ${vessel.type}</div>`,
          { direction: 'top' }
        );

        group.addLayer(marker);
      }
    });
  }, [
    showSlick,
    showBacktrack,
    showForecast,
    showVessels,
    showTracks,
    detection,
    backwardRun,
    forwardRun,
    vessels,
    candidates,
    selectedVesselId,
  ]);

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Basemap & Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {/* Basemap switcher */}
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-1 flex gap-1 shadow-md text-xs font-semibold">
          <button
            onClick={() => setBaseMap('light')}
            className={`px-2.5 py-1 rounded transition-colors ${
              baseMap === 'light' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Light Minimal
          </button>
          <button
            onClick={() => setBaseMap('satellite')}
            className={`px-2.5 py-1 rounded transition-colors ${
              baseMap === 'satellite' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Satellite SAR
          </button>
          <button
            onClick={() => setBaseMap('osm')}
            className={`px-2.5 py-1 rounded transition-colors ${
              baseMap === 'osm' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nautical OSM
          </button>
          <button
            onClick={() => setBaseMap('dark')}
            className={`px-2.5 py-1 rounded transition-colors ${
              baseMap === 'dark' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dark
          </button>
        </div>

        {/* Layer toggles */}
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-md text-[11px] text-gray-700 space-y-2 w-48">
          <div className="font-bold uppercase tracking-wider text-[10px] text-gray-400 pb-1.5 border-b border-gray-100 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Forensic Overlays</span>
          </div>

          <label className="flex items-center justify-between cursor-pointer hover:text-gray-900">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Oil Spill Slick
            </span>
            <input
              type="checkbox"
              checked={showSlick}
              onChange={(e) => setShowSlick(e.target.checked)}
              className="accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-gray-900">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Hindcast Origin
            </span>
            <input
              type="checkbox"
              checked={showBacktrack}
              onChange={(e) => setShowBacktrack(e.target.checked)}
              className="accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-gray-900">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              Forward Dispersion
            </span>
            <input
              type="checkbox"
              checked={showForecast}
              onChange={(e) => setShowForecast(e.target.checked)}
              className="accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-gray-900">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              AIS Vessels
            </span>
            <input
              type="checkbox"
              checked={showVessels}
              onChange={(e) => setShowVessels(e.target.checked)}
              className="accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-gray-900">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Vessel Tracks
            </span>
            <input
              type="checkbox"
              checked={showTracks}
              onChange={(e) => setShowTracks(e.target.checked)}
              className="accent-indigo-600 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Map Legend Overlay at Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg px-3.5 py-2 text-[11px] text-gray-700 flex items-center gap-3 shadow-md">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded bg-amber-500/80 border border-amber-400 inline-block" />
          <span>Slick Area ({detection?.spillAreaKm2} km²)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block shadow-xs" />
          <span>Discharge Origin</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs" />
          <span>Prime Suspect (#1)</span>
        </div>
      </div>
    </div>
  );
};
