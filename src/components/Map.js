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

// Rood bolletje voor regionale / ongeveer locaties
const regionalIcon = L.divIcon({
  className: 'custom-regional-marker',
  html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function Map({ waypoints }) {
  const defaultCenter = [51.0, 4.35];

  // 1. Filter alle waypoints met geldige coördinaten
  const geldigeWaypoints = waypoints.filter(w => w.latitude && w.longitude);

  // 2. Groepeer waypoints die exact dezelfde coördinaten delen
  const gegroepeerdeWaypoints = geldigeWaypoints.reduce((acc, item) => {
    const key = `${item.latitude.toFixed(5)}_${item.longitude.toFixed(5)}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

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

        {Object.entries(gegroepeerdeWaypoints).map(([key, items]) => {
          const eersteItem = items[0];
          const isMeervoudig = items.length > 1;
          const isExact = eersteItem.is_exact !== false;

          return (
            <Marker 
              key={key} 
              position={[eersteItem.latitude, eersteItem.longitude]}
              icon={isExact ? exactIcon : regionalIcon}
            >
              <Tooltip direction="top" offset={isExact ? [0, -30] : [0, -10]} opacity={0.95}>
                <div className="w-80 sm:w-96 p-2">
                  {isMeervoudig ? (
                    <div>
                      <strong className="block text-slate-900 text-sm font-bold mb-1">
                        {items.length} initiatieven / activiteiten op deze locatie
                      </strong>
                      <p className="text-xs text-slate-600 mb-2">
                        Regio: <span className="font-semibold">{eersteItem.gemeente}</span>
                      </p>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                        Bekijk het overzicht onder de kaart voor alle individuele details.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <strong className="block text-slate-900 text-sm font-bold">{eersteItem.naam}</strong>
                        {!isExact && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                            Regionale locatie
                          </span>
                        )}
                      </div>

                      {/* Datum tonen indien aanwezig (bij activiteiten) */}
                      {eersteItem.type === 'Activiteit' && eersteItem.event_date && (
                        <div className="mb-2">
                          <span className="inline-block text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200">
                            📅 {new Date(eersteItem.event_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )}

                      {eersteItem.description && (
                        <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                          {eersteItem.description}
                        </p>
                      )}
                    </div>
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