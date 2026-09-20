'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Zorg ervoor dat de standaard Leaflet marker-icoontjes goed geladen worden
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map({ waypoints }) {
  // Standaard startpunt ingesteld op centraal Vlaanderen (51.0, 4.35)
  const defaultCenter = [51.0, 4.35];
  const defaultZoom = 9;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-slate-300 shadow-md">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {waypoints.map((item) => (
          item.latitude && item.longitude ? (
            <Marker 
              key={item.id} 
              position={[item.latitude, item.longitude]} 
              icon={customIcon}
            >
              {/* Tooltip verschijnt automatisch bij het hoveren over de speld */}
              <Tooltip direction="top" offset={[0, -30]} opacity={0.95}>
                <div className="max-w-xs p-1">
                  <strong className="block text-slate-900 text-sm font-bold">{item.naam}</strong>
                  {item.description && (
                    <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">
                      {item.description}
                    </p>
                  )}
                </div>
              </Tooltip>

              {/* Popup opent bij een klik op de speld */}
              <Popup>
                <div className="p-1">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    {item.status}
                  </span>
                  <h3 className="font-bold text-base mt-1 text-slate-900">{item.naam}</h3>
                  <p className="text-xs text-slate-600 mb-1">{item.type} &bull; {item.gemeente}</p>
                  {item.description && (
                    <p className="text-xs text-slate-700 my-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                      "{item.description}"
                    </p>
                  )}
                  <p className="text-sm font-medium text-emerald-700">{item.contact}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
}