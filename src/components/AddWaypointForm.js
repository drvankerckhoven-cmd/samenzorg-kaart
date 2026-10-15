'use client';

import { useState } from 'react';
import { supabase } from '../app/supabase';
import { translations } from '../app/translations';

const countryPhoneCodes = [
  // Populaire/Dichtstbijzijnde landen bovenaan
  { code: '+32', label: '🇧🇪 België (+32)' },
  { code: '+31', label: '🇳🇱 Nederland (+31)' },
  { code: '+33', label: '🇫🇷 Frankrijk (+33)' },
  { code: '+49', label: '🇩🇪 Duitsland (+49)' },
  { code: '+352', label: '🇱🇺 Luxemburg (+352)' },
  { code: '+44', label: '🇬🇧 Verenigd Koninkrijk (+44)' },
  
  // Alle overige landen alfabetisch
  { code: '+93', label: '🇦🇫 Afghanistan (+93)' },
  { code: '+355', label: '🇦🇱 Albanië (+355)' },
  { code: '+213', label: '🇩🇿 Algerije (+213)' },
  { code: '+376', label: '🇦🇩 Andorra (+376)' },
  { code: '+244', label: '🇦🇴 Angola (+244)' },
  { code: '+54', label: '🇦🇷 Argentinië (+54)' },
  { code: '+374', label: '🇦🇲 Armenië (+374)' },
  { code: '+61', label: '🇦🇺 Australië (+61)' },
  { code: '+994', label: '🇦🇿 Azerbeidzjan (+994)' },
  { code: '+1', label: '🇧🇸 Bahama\'s (+1)' },
  { code: '+973', label: '🇧🇭 Bahrein (+973)' },
  { code: '+880', label: '🇧🇩 Bangladesh (+880)' },
  { code: '+375', label: '🇧🇾 Wit-Rusland (+375)' },
  { code: '+501', label: '🇧🇿 Belize (+501)' },
  { code: '+229', label: '🇧🇯 Benin (+229)' },
  { code: '+591', label: '🇧🇴 Bolivia (+591)' },
  { code: '+387', label: '🇧🇦 Bosnië en Herzegovina (+387)' },
  { code: '+55', label: '🇧🇷 Brazilië (+55)' },
  { code: '+359', label: '🇧🇬 Bulgarije (+359)' },
  { code: '+1', label: '🇨🇦 Canada (+1)' },
  { code: '+56', label: '🇨🇱 Chili (+56)' },
  { code: '+86', label: '🇨🇳 China (+86)' },
  { code: '+57', label: '🇨🇴 Colombia (+57)' },
  { code: '+506', label: '🇨🇷 Costa Rica (+506)' },
  { code: '+385', label: '🇭🇷 Kroatië (+385)' },
  { code: '+53', label: '🇨🇺 Cuba (+53)' },
  { code: '+357', label: '🇨🇾 Cyprus (+357)' },
  { code: '+45', label: '🇩🇰 Denemarken (+45)' },
  { code: '+1', label: '🇩🇴 Dominicaanse Republiek (+1)' },
  { code: '+593', label: '🇪🇨 Ecuador (+593)' },
  { code: '+20', label: '🇪🇬 Egypte (+20)' },
  { code: '+503', label: '🇸🇻 El Salvador (+503)' },
  { code: '+372', label: '🇪🇪 Estland (+372)' },
  { code: '+63', label: '🇵🇭 Filipijnen (+63)' },
  { code: '+358', label: '🇫🇮 Finland (+358)' },
  { code: '+995', label: '🇬🇪 Georgië (+995)' },
  { code: '+233', label: '🇬🇭 Ghana (+233)' },
  { code: '+30', label: '🇬🇷 Griekenland (+30)' },
  { code: '+502', label: '🇬🇹 Guatemala (+502)' },
  { code: '+509', label: '🇭🇹 Haïti (+509)' },
  { code: '+504', label: '🇭🇳 Honduras (+504)' },
  { code: '+36', label: '🇭🇺 Hongarije (+36)' },
  { code: '+354', label: '🇮🇸 IJsland (+354)' },
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+62', label: '🇮🇩 Indonesië (+62)' },
  { code: '+964', label: '🇮🇶 Irak (+964)' },
  { code: '+98', label: '🇮🇷 Iran (+98)' },
  { code: '+353', label: '🇮🇪 Ierland (+353)' },
  { code: '+972', label: '🇮🇱 Israël (+972)' },
  { code: '+39', label: '🇮🇹 Italië (+39)' },
  { code: '+1', label: '🇯🇲 Jamaica (+1)' },
  { code: '+81', label: '🇯🇵 Japan (+81)' },
  { code: '+962', label: '🇯🇴 Jordanië (+962)' },
  { code: '+254', label: '🇰🇪 Kenia (+254)' },
  { code: '+965', label: '🇰🇼 Koeweit (+965)' },
  { code: '+371', label: '🇱🇻 Letland (+371)' },
  { code: '+961', label: '🇱🇧 Libanon (+961)' },
  { code: '+423', label: '🇱🇮 Liechtenstein (+423)' },
  { code: '+370', label: '🇱🇹 Litouwen (+370)' },
  { code: '+60', label: '🇲🇾 Maleisië (+60)' },
  { code: '+356', label: '🇲🇹 Malta (+356)' },
  { code: '+212', label: '🇲🇦 Marokko (+212)' },
  { code: '+52', label: '🇲🇽 Mexico (+52)' },
  { code: '+373', label: '🇲🇩 Moldavië (+373)' },
  { code: '+377', label: '🇲🇨 Monaco (+377)' },
  { code: '+382', label: '🇲🇪 Montenegro (+382)' },
  { code: '+975', label: '🇳🇵 Nepal (+977)' },
  { code: '+64', label: '🇳🇿 Nieuw-Zeeland (+64)' },
  { code: '+234', label: '🇳🇬 Nigeria (+234)' },
  { code: '+47', label: '🇳🇴 Noorwegen (+47)' },
  { code: '+389', label: '🇲🇰 Noord-Macedonië (+389)' },
  { code: '+968', label: '🇴🇲 Oman (+968)' },
  { code: '+43', label: '🇦🇹 Oostenrijk (+43)' },
  { code: '+92', label: '🇵🇰 Pakistan (+92)' },
  { code: '+507', label: '🇵🇦 Panama (+507)' },
  { code: '+51', label: '🇵🇪 Peru (+51)' },
  { code: '+48', label: '🇵🇱 Polen (+48)' },
  { code: '+351', label: '🇵🇹 Portugal (+351)' },
  { code: '+974', label: '🇶🇦 Qatar (+974)' },
  { code: '+40', label: '🇷🇴 Roemenië (+40)' },
  { code: '+7', label: '🇷🇺 Rusland (+7)' },
  { code: '+966', label: '🇸🇦 Saoedi-Arabië (+966)' },
  { code: '+381', label: '🇷🇸 Servië (+381)' },
  { code: '+65', label: '🇸🇬 Singapore (+65)' },
  { code: '+421', label: '🇸🇰 Slowakije (+421)' },
  { code: '+386', label: '🇸🇮 Slovenië (+386)' },
  { code: '+34', label: '🇪🇸 Spanje (+34)' },
  { code: '+94', label: '🇱🇰 Sri Lanka (+94)' },
  { code: '+597', label: '🇸🇷 Suriname (+597)' },
  { code: '+886', label: '🇹🇼 Taiwan (+886)' },
  { code: '+66', label: '🇹🇭 Thailand (+66)' },
  { code: '+216', label: '🇹🇳 Tunesië (+216)' },
  { code: '+90', label: '🇹🇷 Turkije (+90)' },
  { code: '+380', label: '🇺🇦 Oekraïne (+380)' },
  { code: '+971', label: '🇦🇪 Verenigde Arabische Emiraten (+971)' },
  { code: '+1', label: '🇺🇸 Verenigde Staten (+1)' },
  { code: '+598', label: '🇺🇾 Uruguay (+598)' },
  { code: '+84', label: '🇻🇳 Vietnam (+84)' },
  { code: '+27', label: '🇿🇦 Zuid-Afrika (+27)' },
  { code: '+82', label: '🇰🇷 Zuid-Korea (+82)' },
  { code: '+46', label: '🇸🇪 Zweden (+46)' },
  { code: '+41', label: '🇨🇭 Zwitserland (+41)' }
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