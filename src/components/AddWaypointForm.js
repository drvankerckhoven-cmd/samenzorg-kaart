'use client';

import { useState } from 'react';
import { supabase } from '../app/supabase';

export default function AddWaypointForm({ onWaypointAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [melding, setMelding] = useState(null);

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

    // 1. Automatisch coördinaten opzoeken via OpenStreetMap (Nominatim)
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

    // 2. Domeinen omzetten naar een array
    const domeinenArray = formData.domeinenText
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);

    // 3. Object samenstellen voor Supabase
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
      setMelding({ type: 'fout', tekst: 'Er is een fout opgetreden bij het inzenden.' });
    } else {
      setMelding({ 
        type: 'succes', 
        tekst: 'Bedankt! Je inzending is ontvangen en wordt beoordeeld door de beheerder.' 
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
          <h2 className="text-xl font-bold text-slate-900">Nieuw Waypoint Aanmelden</h2>
          <p className="text-sm text-slate-600">Ken je een initiatief of kennispunt? Voeg het toe aan de kaart.</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-md transition-colors"
        >
          {open ? 'Sluiten' : '+ Locatie Toevoegen'}
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
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Naam van Initiatief / Kennispunt *</label>
            <input
              type="text"
              name="naam"
              required
              value={formData.naam}
              onChange={handleChange}
              placeholder="bijv. Voedselbos De Eik"
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Initiatief">Initiatief</option>
              <option value="Kennispunt">Kennispunt</option>
              <option value="Expert">Expert</option>
              <option value="Samenwerkingsverband">Samenwerkingsverband</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Straat + Huisnummer</label>
            <input
              type="text"
              name="adres"
              value={formData.adres}
              onChange={handleChange}
              placeholder="bijv. Grote Markt 1"
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gemeente / Stad *</label>
            <input
              type="text"
              name="gemeente"
              required
              value={formData.gemeente}
              onChange={handleChange}
              placeholder="bijv. Antwerpen"
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact / Website</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="bijv. info@voorbeeld.be of https://..."
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Domeinen / Thema's (gescheiden door komma's)</label>
            <input
              type="text"
              name="domeinenText"
              value={formData.domeinenText}
              onChange={handleChange}
              placeholder="bijv. Ecologie, Permacultuur, Onderwijs"
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Korte beschrijving (max. 300 tekens)
            </label>
            <textarea
              name="description"
              maxLength={300}
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Schrijf hier een korte beschrijving..."
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {300 - formData.description.length} tekens over
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium text-sm rounded-md transition-colors"
            >
              {loading ? 'Adres zoeken & verzenden...' : 'Inzenden voor Goedkeuring'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}