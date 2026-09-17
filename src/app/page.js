'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import dynamic from 'next/dynamic';
import AddWaypointForm from '@/components/AddWaypointForm';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-slate-500">
      Kaart laden...
    </div>
  )
});

export default function Home() {
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [zoekterm, setZoekterm] = useState('');
  const [selectType, setSelectType] = useState('Alles');
  const [selectDomein, setSelectDomein] = useState('Alles');

  const fetchWaypoints = useCallback(async () => {
    const { data, error } = await supabase
      .from('waypoints')
      .select('*');

    if (error) {
      console.error('Fout bij ophalen gegevens:', JSON.stringify(error, null, 2));
    } else {
      setWaypoints(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWaypoints();
  }, [fetchWaypoints]);

  const alleTypes = ['Alles', ...Array.from(new Set(waypoints.map(w => w.type).filter(Boolean)))];
  
  const alleDomeinenSet = new Set();
  waypoints.forEach(w => {
    if (Array.isArray(w.domeinen)) {
      w.domeinen.forEach(d => alleDomeinenSet.add(d));
    }
  });
  const alleDomeinen = ['Alles', ...Array.from(alleDomeinenSet)];

  const gefilterdeWaypoints = waypoints.filter((item) => {
    const matchZoekterm = zoekterm === '' || 
      (item.naam && item.naam.toLowerCase().includes(zoekterm.toLowerCase())) ||
      (item.gemeente && item.gemeente.toLowerCase().includes(zoekterm.toLowerCase()));

    const matchType = selectType === 'Alles' || item.type === selectType;

    const matchDomein = selectDomein === 'Alles' || 
      (Array.isArray(item.domeinen) && item.domeinen.includes(selectDomein));

    return matchZoekterm && matchType && matchDomein;
  });

  return (
    <main className="min-h-screen p-4 md:p-8 bg-slate-50 text-slate-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">
          Interactief Kaart- en Kennisplatform
        </h1>
        <p className="mb-6 text-slate-600">
          Ontdek locaties en kennispunten op de interactieve wereldkaart.
        </p>

        {/* Inzendformulier */}
        <AddWaypointForm onWaypointAdded={fetchWaypoints} />

        {/* Filtersectie */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Zoeken</label>
            <input
              type="text"
              placeholder="Zoek op naam of gemeente..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Type</label>
            <select
              value={selectType}
              onChange={(e) => setSelectType(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {alleTypes.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Domein</label>
            <select
              value={selectDomein}
              onChange={(e) => setSelectDomein(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {alleDomeinen.map((domein, idx) => (
                <option key={idx} value={domein}>{domein}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactieve Kaart */}
        <div className="mb-8">
          <Map waypoints={gefilterdeWaypoints} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Overzicht Waypoints</h2>
          <span className="text-sm text-slate-500 font-medium">
            {gefilterdeWaypoints.length} van de {waypoints.length} getoond
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">Gegevens laden uit database...</p>
        ) : gefilterdeWaypoints.length === 0 ? (
          <p className="text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
            Geen waypoints gevonden die voldoen aan je zoekcriteria.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {gefilterdeWaypoints.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-lg shadow border border-slate-200">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded mb-2">
                  {item.status}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{item.naam}</h3>
                <p className="text-sm text-slate-500 mb-2">Type: {item.type} | Gemeente: {item.gemeente}</p>
                <p className="text-sm mb-2">Contact: {item.contact}</p>
                {item.domeinen && item.domeinen.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.domeinen.map((domein, index) => (
                      <span key={index} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {domein}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}