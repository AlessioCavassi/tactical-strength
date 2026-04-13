import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_LABELS, PARTICLE_ICONS } from '../data/themes';
import { useLanguage } from '../i18n/LanguageContext';

const getCATEGORIES = (t) => [
  { id: 'all',       label: t.themeCatAll,       emoji: '●' },
  { id: 'femminile', label: t.themeCatFeminine,   emoji: '🌸' },
  { id: 'maschile',  label: t.themeCatMasculine,  emoji: '💪' },
  { id: 'luxury',    label: t.themeCatLuxury,     emoji: '💎' },
  { id: 'base',      label: t.themeCatBase,       emoji: '◦' },
];

function Swatch({ theme, isActive, onSelect }) {
  const particleIcon = PARTICLE_ICONS[theme.particles];
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: 54, height: 54,
          background: theme.bg,
          borderRadius: isActive ? '18px' : '16px',
          border: isActive
            ? `2px solid ${theme.accent}`
            : '2px solid rgba(255,255,255,0.07)',
          boxShadow: isActive
            ? `0 0 0 3px ${theme.accent}22, 0 0 18px ${theme.accent}40`
            : 'none',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Orbs */}
        <div style={{
          position: 'absolute', top: '0%', left: '5%',
          width: 36, height: 36, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${theme.orb1},0.9) 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', right: '0%',
          width: 30, height: 30, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${theme.orb2},0.8) 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute', top: '35%', left: '30%',
          width: 22, height: 22, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${theme.orb3},0.55) 0%, transparent 70%)`,
        }} />

        {/* Particle badge */}
        {particleIcon && (
          <div className="absolute bottom-1 right-1 text-[9px] leading-none"
            style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' }}>
            {particleIcon}
          </div>
        )}

        {/* Active check */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={theme.accent} strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      <p className="leading-tight text-center" style={{
        fontSize: '8px', fontWeight: 600, letterSpacing: '-0.01em',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.32)',
        maxWidth: 54, wordBreak: 'break-word',
      }}>
        {theme.name}
      </p>
    </button>
  );
}

export default function ThemePicker({ themes, themeId, setTheme, onClose }) {
  const { t } = useLanguage();
  const CATEGORIES = getCATEGORIES(t);
  const [cat, setCat] = useState('all');
  const activeTheme = themes.find(t => t.id === themeId) || themes[0];
  const visible = cat === 'all' ? themes : themes.filter(t => t.category === cat);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          className="w-full max-w-md rounded-t-[32px] p-5 pb-10"
          style={{
            background: 'rgba(14,14,18,0.96)',
            backdropFilter: 'blur(60px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-5"
            style={{ background: 'rgba(255,255,255,0.12)' }} />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold text-sm tracking-tight">{t.themeTitle}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {t.themeSubtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all active:scale-95"
                style={{
                  background: cat === c.id
                    ? `linear-gradient(135deg, var(--accent-from), var(--accent-to))`
                    : 'rgba(255,255,255,0.06)',
                  color: cat === c.id ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: cat === c.id ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: cat === c.id ? `0 4px 14px rgba(var(--glow-rgb),0.3)` : 'none',
                }}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          {/* Swatch grid */}
          <div className="grid grid-cols-5 gap-3 min-h-[80px]">
            <AnimatePresence mode="popLayout">
              {visible.map(theme => (
                <motion.div
                  key={theme.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                >
                  <Swatch
                    theme={theme}
                    isActive={theme.id === themeId}
                    onSelect={() => { setTheme(theme.id); onClose(); }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Active theme info strip */}
          <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0" style={{ background: activeTheme.bg }}>
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg, rgba(${activeTheme.orb1},0.8), rgba(${activeTheme.orb2},0.6))`,
              }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {activeTheme.emoji} {activeTheme.name}
              </p>
              <p className="text-[9px] mt-0.5 capitalize" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {CATEGORY_LABELS[activeTheme.category]?.emoji} {CATEGORY_LABELS[activeTheme.category]?.label}
                {activeTheme.particles !== 'none' && ` · ${PARTICLE_ICONS[activeTheme.particles]} ${t.themeEffect}`}
              </p>
            </div>
            <div className="h-6 w-16 rounded-full overflow-hidden flex-shrink-0"
              style={{ background: `linear-gradient(90deg, ${activeTheme.accentFrom}, ${activeTheme.accentTo})`, opacity: 0.8 }} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
