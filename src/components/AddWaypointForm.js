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
    type: 'Organisatie / Initiatief',
    event_date: '',
    adres: '',
    gemeente: '',
    land: 'België',
    contact: '',
    email: '',
    website: '',
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
    let isExactAdres = false;

    // 1. Coördinaten opzoeken via OpenStreetMap
    const zoekAdres = `${formData.adres} ${formData.gemeente} ${formData.land}`.trim();

    if (zoekAdres) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(zoekAdres)}`
        );
        const resultaten = await response.json();

        if (resultaten && resultaten.length > 0) {
          const besteResultaat = resultaten[0];
          gevondenLat = parseFloat(besteResultaat.lat);
          gevondenLng = parseFloat(besteResultaat.lon);

          const addresstype = besteResultaat.addresstype || besteResultaat.type;
          const heeftHuisnummer = besteResultaat.address && (besteResultaat.address.house_number || besteResultaat.address.building);
          
          if (heeftHuisnummer || ['house', 'building', 'residential', 'premise'].includes(addresstype)) {
            isExactAdres = true;
          } else {
            isExactAdres = false;
          }
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

    // 3. Opslaan in Supabase (oplossen inzendfout: stuur 'null' voor event_date als het geen activiteit is)
    const nieuwWaypoint = {
      naam: formData.naam,
      type: formData.type,
      event_date: formData.type === 'Activiteit' && formData.event_date ? formData.event_date : null,
      gemeente: formData.gemeente + (formData.adres ? ` (${formData.adres})` : ''),
      land: formData.land || 'België',
      contact: formData.contact,
      email: formData.email,
      website: formData.website,
      description: formData.description,
      domeinen: domeinenArray,
      latitude: gevondenLat,
      longitude: gevondenLng,
      is_exact: isExactAdres,
      status: 'In afwachting'
    };

    const { error } = await supabase.from('waypoints').insert([nieuwWaypoint]);

    if (error) {
      console.error('Fout bij verzenden (Supabase details):', error);
      setMelding({ type: 'fout', tekst: `${t.form.error} (${error.message || 'Databasefout'})` });
    } else {
      setMelding({ 
        type: 'succes', 
        tekst: t.form.success 
      });
      setFormData({
        naam: '',
        type: 'Organisatie / Initiatief',
        event_date: '',
        adres: '',
        gemeente: '',
        land: 'België',
        contact: '',
        email: '',
        website: '',
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
              <option value="Zorgverlener">{t.form.types.zorgverlener}</option>
              <option value="Organisatie / Initiatief">{t.form.types.organisatie}</option>
              <option value="Activiteit">{t.form.types.activiteit}</option>
            </select>
          </div>

          {/* Veld verschijnt ENKEL als het Type "Activiteit" is */}
          {formData.type === 'Activiteit' && (
            <div className="md:col-span-2 bg-amber-50 p-3 rounded border border-amber-200">
              <label className="block text-xs font-semibold text-amber-900 uppercase mb-1">
                📅 {t.form.eventDate}
              </label>
              <input
                type="date"
                name="event_date"
                required
                value={formData.event_date}
                onChange={handleChange}
                className="w-48 p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          )}

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
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.country}</label>
            <input
              type="text"
              name="land"
              required
              value={formData.land}
              onChange={handleChange}
              placeholder={t.form.countryPlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.phone}</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder={t.form.phonePlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.email}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t.form.emailPlaceholder}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.website}</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder={t.form.websitePlaceholder}
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