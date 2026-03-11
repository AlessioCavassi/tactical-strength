import { useState, useEffect } from 'react';
import { THEMES, DEFAULT_THEME_ID } from '../data/themes';

const THEME_KEY = 'ts_theme';

const applyTheme = (theme) => {
  const r = document.documentElement.style;
  r.setProperty('--app-bg', theme.bg);
  r.setProperty('--orb1', theme.orb1);
  r.setProperty('--orb2', theme.orb2);
  r.setProperty('--orb3', theme.orb3);
  r.setProperty('--accent', theme.accent);
  r.setProperty('--accent-from', theme.accentFrom);
  r.setProperty('--accent-to', theme.accentTo);
  document.body.style.background = theme.bg;
};

export function useTheme() {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem(THEME_KEY) || DEFAULT_THEME_ID
  );

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const setTheme = (id) => {
    localStorage.setItem(THEME_KEY, id);
    setThemeId(id);
  };

  return { currentTheme, setTheme, themes: THEMES, themeId };
}
