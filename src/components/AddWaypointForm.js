'use client';

import { useState } from 'react';
import { supabase } from '../app/supabase';
import { translations } from '../app/translations';

const countryPhoneCodes = [
  { code: '+32', label: '🇧🇪 BE (+32)' },
  { code: '+31', label: '🇳🇱 NL (+31)' },
  { code: '+33', label: '🇫🇷 FR (+33)' },
  { code: '+49', label: '🇩🇪 DE (+49)' },
  { code: '+352', label: '🇱🇺 LU (+352)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+41', label: '🇨🇭 CH (+41)' },
  { code: '+43', label: '🇦🇹 AT (+43)' },
  { code: '+1', label: '🇺🇸 US (+1)' }
];

export default function AddWaypointForm({ onWaypointAdded, currentLang = 'nl' }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [melding, setMelding] = useState(null);

  const t = translations[currentLang] || translations.nl;

  const [phonePrefix, setPhonePrefix] = useState('+32');
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

    // Telefoonnummer combineren met landcode
    const volledigTelefoonnummer = formData.contact 
      ? `${phonePrefix} ${formData.contact.trim()}` 
      : '';

    // 3. Opslaan in Supabase
    const nieuwWaypoint = {
      naam: formData.naam,
      type: formData.type,
      event_date: formData.type === 'Activiteit' && formData.event_date ? formData.event_date : null,
      gemeente: formData.gemeente + (formData.adres ? ` (${formData.adres})` : ''),
      land: formData.land || 'België',
      contact: volledigTelefoonnummer,
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
      console.error('Fout bij verzenden:', error);
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
        <form onSubmit={handleSubmit} className="mt-6 border-t border-slate-100 pt-6 flex flex-col gap-5">
          {melding && (
            <div className={`p-3 rounded text-sm font-medium ${
              melding.type === 'succes' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {melding.tekst}
            </div>
          )}

          {/* LIJN 1: Naam & Type-knoppen */}
          <div className="grid gap-4 md:grid-cols-12 items-start">
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.name}</label>
              <input
                type="text"
                name="naam"
                required
                value={formData.naam}
                onChange={handleChange}
                placeholder={t.form.namePlaceholder}
                className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="md:col-span-7">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.type}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Zorgverlener', label: t.form.types.zorgverlener },
                  { value: 'Organisatie / Initiatief', label: t.form.types.organisatie },
                  { value: 'Activiteit', label: t.form.types.activiteit }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: item.value })}
                    className={`p-2.5 text-xs font-semibold rounded border text-center transition-all ${
                      formData.type === item.value
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Veld verschijnt ENKEL als het Type "Activiteit" is */}
          {formData.type === 'Activiteit' && (
            <div className="bg-amber-50 p-3 rounded border border-amber-200">
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

          {/* LIJN 2: Domeinen / Thema's */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t.form.domains}</label>
            <input
              type="text"
              name="domeinenText"
              value={formData.domeinenText}
              onChange={handleChange}
              placeholder={t.form.domainsPlaceholder}
              className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* LIJN 3: Adres en Contactgegevens (Titel + Grid zonder losse veldtitels) */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-1">
              {t.form.contactSectionTitle}
            </h3>
            
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="text"
                name="adres"
                value={formData.adres}
                onChange={handleChange}
                placeholder={t.form.addressPlaceholder}
                className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <input
                type="text"
                name="gemeente"
                required
                value={formData.gemeente}
                onChange={handleChange}
                placeholder={t.form.cityPlaceholder}
                className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <input
                type="text"
                name="land"
                required
                value={formData.land}
                onChange={handleChange}
                placeholder={t.form.countryPlaceholder}
                className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              {/* Telefoon met Landcode Picklist */}
              <div className="flex gap-1.5">
                <select
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="p-2.5 border border-slate-300 rounded text-xs bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {countryPhoneCodes.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder={t.form.phonePlaceholder}
                  className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t.form.emailPlaceholder}
                className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />

              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder={t.form.websitePlaceholder}
                className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* LIJN 4: Korte beschrijving */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              {t.form.descriptionTitle}
            </h3>
            <textarea
              name="description"
              maxLength={300}
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder={t.form.descriptionPlaceholder}
              className="w-full p-2.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {300 - formData.description.length} {t.form.charsLeft}
            </p>
          </div>

          <div className="flex justify-end mt-2">
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