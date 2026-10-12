'use client';

import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Standaard blauwe speld voor exacte locaties
const exactIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Rood bolletje voor regionale / ongeveere locaties
const regionalIcon = L.divIcon({
  className: 'custom-regional-marker',
  html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function Map({ waypoints }) {
  // Standaard centrum van Vlaanderen / België
  const defaultCenter = [51.0, 4.35];

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={8} 
        scrollWheelZoom={false} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {waypoints.map((item) => {
          if (!item.latitude || !item.longitude) return null;

          const isExact = item.is_exact !== false; // Standaard true als leeg

          return (
            <Marker 
              key={item.id} 
              position={[item.latitude, item.longitude]}
              icon={isExact ? exactIcon : regionalIcon}
            >
              <Tooltip direction="top" offset={isExact ? [0, -30] : [0, -10]} opacity={0.95}>
                <div className="w-80 sm:w-96 p-1">
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="block text-slate-900 text-sm font-bold">{item.naam}</strong>
                    {!isExact && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold">
                        Regionale locatie
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}