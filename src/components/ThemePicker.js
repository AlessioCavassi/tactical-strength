import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemePicker({ themes, themeId, setTheme, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-md glass-heavy rounded-t-[28px] p-5 pb-8"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-8 h-1 bg-white/15 rounded-full mx-auto mb-5" />

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold text-sm">🎨 Tema</p>
              <p className="text-white/30 text-[10px] mt-0.5">Cambia lo stile dell'app</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg glass-light flex items-center justify-center text-white/30 active:scale-90 transition-transform"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 5×2 grid of swatches */}
          <div className="grid grid-cols-5 gap-2.5">
            {themes.map(theme => {
              const isActive = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => { setTheme(theme.id); onClose(); }}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                >
                  {/* Swatch preview */}
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      width: 52, height: 52,
                      background: theme.bg,
                      border: isActive ? `2px solid ${theme.accent}` : '2px solid rgba(255,255,255,0.08)',
                      boxShadow: isActive ? `0 0 12px ${theme.accent}55` : 'none',
                    }}
                  >
                    {/* Simulated orbs */}
                    <div style={{
                      position: 'absolute', top: '5%', left: '10%',
                      width: 32, height: 32, borderRadius: '50%',
                      background: `radial-gradient(circle, rgba(${theme.orb1},0.85) 0%, transparent 70%)`,
                    }} />
                    <div style={{
                      position: 'absolute', bottom: '5%', right: '5%',
                      width: 26, height: 26, borderRadius: '50%',
                      background: `radial-gradient(circle, rgba(${theme.orb2},0.75) 0%, transparent 70%)`,
                    }} />
                    <div style={{
                      position: 'absolute', top: '40%', left: '35%',
                      width: 20, height: 20, borderRadius: '50%',
                      background: `radial-gradient(circle, rgba(${theme.orb3},0.5) 0%, transparent 70%)`,
                    }} />

                    {/* Active checkmark */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.35)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke={theme.accent} strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Theme name */}
                  <p className={`text-[9px] font-semibold leading-none text-center ${isActive ? 'text-white' : 'text-white/35'}`}>
                    {theme.name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Accent preview strip */}
          <div className="mt-5 h-1 rounded-full overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${themes.find(t => t.id === themeId)?.accentFrom}, ${themes.find(t => t.id === themeId)?.accentTo})` }} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
