'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import dynamic from 'next/dynamic';
import AddWaypointForm from '@/components/AddWaypointForm';
import LanguageSelector from '@/components/LanguageSelector';
import { translations } from './translations';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-slate-500">
      Kaart laden...
    </div>
  )
});

function getIsoDate(d) {
  return d.toISOString().split('T')[0];
}

export default function Home() {
  const [currentLang, setCurrentLang] = useState('nl');
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [zoekterm, setZoekterm] = useState('');
  const [selectType, setSelectType] = useState('Alles');
  const [selectDomein, setSelectDomein] = useState('Alles');

  // Standaard datums
  const vandaag = new Date();
  const eenMaandLater = new Date();
  eenMaandLater.setMonth(vandaag.getMonth() + 1);

  const [datumVan, setDatumVan] = useState(getIsoDate(vandaag));
  const [datumTot, setDatumTot] = useState(getIsoDate(eenMaandLater));

  // Vinkje voor wel/niet tonen van regionale locaties
  const [toonRegionaal, setToonRegionaal] = useState(false);

  const t = translations[currentLang] || translations.nl;

  // Hulpfunctie om het Type netjes te vertalen naar de actieve taal
  const vertaalType = useCallback((dbType) => {
    if (!dbType) return '';
    if (dbType === 'Zorgverlener') return t.form.types.zorgverlener;
    if (dbType === 'Organisatie / Initiatief' || dbType === 'Initiatief') return t.form.types.organisatie;
    if (dbType === 'Activiteit') return t.form.types.activiteit;
    return dbType;
  }, [t]);

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

  // Vaste, vertaalde opties voor Type-dropdown
  const vasteTypeOpties = [
    { key: 'Alles', label: t.search.all },
    { key: 'Zorgverlener', label: t.form.types.zorgverlener },
    { key: 'Organisatie / Initiatief', label: t.form.types.organisatie },
    { key: 'Activiteit', label: t.form.types.activiteit }
  ];

  // Geordende domeinenlijst
  const alleDomeinenSet = new Set();
  waypoints.forEach(w => {
    if (Array.isArray(w.domeinen)) {
      w.domeinen.forEach(d => {
        if (d && d.trim()) alleDomeinenSet.add(d.trim());
      });
    }
  });

  const gesorteerdeDomeinen = Array.from(alleDomeinenSet).sort((a, b) => 
    a.localeCompare(b, currentLang, { sensitivity: 'base' })
  );
  const alleDomeinen = [t.search.all, ...gesorteerdeDomeinen];

  // Gefilterde lijst op basis van zoekbalk, type, domein & datum-vork
  const gefilterdeWaypoints = waypoints.filter((item) => {
    const zoek = zoekterm.toLowerCase();

    const matchZoekterm = zoekterm === '' || 
      (item.naam && item.naam.toLowerCase().includes(zoek)) ||
      (item.gemeente && item.gemeente.toLowerCase().includes(zoek)) ||
      (item.land && item.land.toLowerCase().includes(zoek)) ||
      (item.adres && item.adres.toLowerCase().includes(zoek)) ||
      (item.description && item.description.toLowerCase().includes(zoek)) ||
      (item.contact && item.contact.toLowerCase().includes(zoek)) ||
      (item.email && item.email.toLowerCase().includes(zoek)) ||
      (item.website && item.website.toLowerCase().includes(zoek));

    const matchType = selectType === 'Alles' || selectType === t.search.all || item.type === selectType;

    const matchDomein = selectDomein === t.search.all || selectDomein === 'Alles' || 
      (Array.isArray(item.domeinen) && item.domeinen.includes(selectDomein));

    // Datum filteren voor activiteiten
    let matchDatum = true;
    if (item.type === 'Activiteit' && item.event_date) {
      if (datumVan && item.event_date < datumVan) matchDatum = false;
      if (datumTot && item.event_date > datumTot) matchDatum = false;
    }

    return matchZoekterm && matchType && matchDomein && matchDatum;
  });

  // Gefilterde lijst specifiek voor de KAART
  const kaartWaypoints = gefilterdeWaypoints.filter(item => {
    if (toonRegionaal) return true;
    return item.is_exact !== false;
  });

  return (
    <main className="min-h-screen p-4 md:p-8 bg-slate-50 text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header met vertaalde titel, ondertitel en Taalschakelaar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {t.headerTitle}
            </h1>
            <p className="text-slate-600 mt-1">
              {t.headerSubtitle}
            </p>
          </div>
          <div className="self-start sm:self-center">
            <LanguageSelector 
              currentLang={currentLang} 
              onLanguageChange={setCurrentLang} 
            />
          </div>
        </div>

        {/* Inzendformulier */}
        <AddWaypointForm onWaypointAdded={fetchWaypoints} currentLang={currentLang} />

        {/* Vertaalde Filtersectie */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col gap-4">
          
          {/* Bovenste rij filters: Zoekbalk, Type & Domein */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t.search.label}</label>
              <input
                type="text"
                placeholder={t.search.placeholder}
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
                className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t.search.typeLabel}</label>
              <select
                value={selectType}
                onChange={(e) => setSelectType(e.target.value)}
                className="w-full p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {vasteTypeOpties.map((optie) => (
                  <option key={optie.key} value={optie.key}>
                    {optie.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t.search.domainLabel}</label>
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

          {/* Datum-vork filters verschijnen ENKEL als 'Activiteit' is gekozen */}
          {selectType === 'Activiteit' && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 bg-amber-50/50 p-3 rounded">
              <div>
                <label className="block text-xs font-semibold uppercase text-amber-900 mb-1">
                  📅 {t.search.dateFromLabel}
                </label>
                <input
                  type="date"
                  value={datumVan}
                  onChange={(e) => setDatumVan(e.target.value)}
                  className="w-48 p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-amber-900 mb-1">
                  📅 {t.search.dateToLabel}
                </label>
                <input
                  type="date"
                  value={datumTot}
                  onChange={(e) => setDatumTot(e.target.value)}
                  className="w-48 p-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          )}

        </div>

        {/* Vertaalde Vink-optie voor regionale locaties */}
        <div className="flex items-center justify-between mb-3 px-1">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={toonRegionaal}
              onChange={(e) => setToonRegionaal(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span className="flex items-center gap-1.5 font-medium">
              {t.search.regionalCheckbox}
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-rose-500 border border-white shadow-sm ml-1" title="Rode bolletjes op de kaart"></span>
            </span>
          </label>
        </div>

        {/* Interactieve Kaart */}
        <div className="mb-8">
          <Map waypoints={kaartWaypoints} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">{t.search.overviewTitle}</h2>
          <span className="text-sm text-slate-500 font-medium">
            {gefilterdeWaypoints.length} {t.search.shown} {waypoints.length} {t.search.shownEnd}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500">{t.search.loading}</p>
        ) : gefilterdeWaypoints.length === 0 ? (
          <p className="text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
            {t.search.noResults}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {gefilterdeWaypoints.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-lg shadow border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{item.naam}</h3>
                  {item.type === 'Activiteit' && item.event_date && (
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded border border-amber-200">
                      📅 {new Date(item.event_date).toLocaleDateString(currentLang === 'nl' ? 'nl-BE' : currentLang, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 mb-2">
                  Type: {vertaalType(item.type)} | Locatie: {item.gemeente}{item.land ? `, ${item.land}` : ''}
                </p>
                
                {item.contact && <p className="text-sm text-slate-700">Tel: {item.contact}</p>}
                {item.email && <p className="text-sm text-slate-700">E-mail: <a href={`mailto:${item.email}`} className="text-emerald-600 underline">{item.email}</a></p>}
                {item.website && <p className="text-sm text-slate-700">Website: <a href={item.website.startsWith('http') ? item.website : `https://${item.website}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">{item.website}</a></p>}

                {item.description && (
                  <p className="text-sm text-slate-600 my-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{item.description}"
                  </p>
                )}
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