'use client';

export default function LanguageSelector({ currentLang, onLanguageChange }) {
  const languages = [
    { code: 'nl', label: 'NL' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' }
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => onLanguageChange(lang.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
            currentLang === lang.code
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}