import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'ts_language';

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'it') return saved;
  } catch {}
  // Auto-detect from browser
  const nav = navigator.language || navigator.userLanguage || '';
  return nav.startsWith('it') ? 'it' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'it' ? 'en' : 'it');
  }, [setLang]);

  const t = useMemo(() => translations[lang] || translations.it, [lang]);

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
