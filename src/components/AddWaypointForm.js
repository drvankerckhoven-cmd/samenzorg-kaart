'use client';

import { useState } from 'react';
import { supabase } from '../app/supabase';
import { translations } from '../app/translations';

export default function AddWaypointForm({ onWaypointAdded, currentLang = 'nl' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [melding, setMelding] = useState(null);

  const t = translations[currentLang] || translations.nl;

  const [formData, setFormData] = useState({
    naam: '',
    type: 'Initiatief',
    adres: '',
    gemeente: '',
    contact: '',
    description: '',
    domeinenText: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMelding(null);

    let gevondenLat = null;
    let gevondenLng = null;

    // 1. Coördinaten opzoeken via OpenStreetMap
    const zoekAdres = `${formData.adres} ${formData.gemeente}`.trim();
    if (zoekAdres) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(zoekAdres)}`
        );
        const resultaten = await response.json();

        if (resultaten && resultaten.length > 0) {
          gevondenLat = parseFloat(resultaten[0].lat);
          gevondenLng = parseFloat(resultaten[0].lon);
        }
      } catch (err) {
        console.warn('Geocoding kon geen coördinaten ophalen:', err);
      }
    }

    // 2. Domeinen omzetten naar array
    const domeinenArray = formData.domeinenText
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);

    // 3. Opslaan in Supabase (de veldnamen in de DB blijven in het Nederlands)
    const nieuwWaypoint = {
      naam: formData.naam,
      type: formData.type,
      gemeente: formData.gemeente + (formData.adres ? ` (${formData.adres})` : ''),
      contact: formData.contact,
      description: formData.description,
      domeinen: domeinenArray,
      latitude: gevondenLat,
      longitude: gevondenLng,
      status: 'In afwachting'
    };

    const { error } = await supabase.from('waypoints').insert([nieuwWaypoint]);

    if (error) {
      console.error('Fout bij verzenden:', JSON.stringify(error, null, 2));
      setMelding({ type: 'fout', tekst: t.form.error });
    } else {
      setMelding({ 
        type: 'succes', 
        tekst: t.form.success 
      });
      setFormData({
        naam: '',
        type: 'Initiatief',
        adres: '',
        gemeente: '',
        contact: '',
        description: '',
        domeinenText: ''
      });
      if (onWaypointAdded) onWaypointAdded();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-sm text-slate-600">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-md transition-colors"
        >
          {open ? t.closeButton : t.addButton}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-6 border-t border-slate-100 pt-6 grid gap-4 md:grid-cols-2">
          {melding && (
            <div className={`md:col-span-2 p-3 rounded text-sm font-medium ${
              melding.type === 'succes' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {melding.tekst}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.name}</label>
            <input
              type="text"
              name="naam"
              required
              value={formData.naam}
              onChange={handleChange}
              placeholder={t.form.namePlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.type}</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Initiatief">{t.form.types.initiatief}</option>
              <option value="Kennispunt">{t.form.types.kennispunt}</option>
              <option value="Expert">{t.form.types.expert}</option>
              <option value="Samenwerkingsverband">{t.form.types.samenwerkingsverband}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.address}</label>
            <input
              type="text"
              name="adres"
              value={formData.adres}
              onChange={handleChange}
              placeholder={t.form.addressPlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.city}</label>
            <input
              type="text"
              name="gemeente"
              required
              value={formData.gemeente}
              onChange={handleChange}
              placeholder={t.form.cityPlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.contact}</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder={t.form.contactPlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.domains}</label>
            <input
              type="text"
              name="domeinenText"
              value={formData.domeinenText}
              onChange={handleChange}
              placeholder={t.form.domainsPlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              {t.form.description}
            </label>
            <textarea
              name="description"
              maxLength={300}
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder={t.form.descriptionPlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {300 - formData.description.length} {t.form.charsLeft}
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium text-sm rounded-md transition-colors"
            >
              {loading ? t.form.submitting : t.form.submit}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}