import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MESSAGES = [
  'Sessione completata. 🔥',
  'Hai dominato questa giornata.',
  'Il tuo corpo ti ringrazia.',
  'Consistenza = risultati.',
  'Un altro passo verso il tuo meglio.',
];

export default function DayCompleteOverlay({ show, dayTitle, exerciseCount, onClose }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!show || fired.current) return;
    fired.current = true;

    // First burst — center
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.55 },
      colors: [
        getComputedStyle(document.documentElement)
          .getPropertyValue('--accent-from').trim() || '#0a84ff',
        '#ffffff',
        getComputedStyle(document.documentElement)
          .getPropertyValue('--accent-to').trim() || '#00c6ff',
      ],
    });

    // Side bursts
    setTimeout(() => {
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    }, 200);

    return () => { fired.current = false; };
  }, [show]);

  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(16px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="text-center px-8 max-w-xs"
            onClick={e => e.stopPropagation()}
          >
            {/* Animated ring */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="44" fill="none"
                  stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <motion.circle cx="48" cy="48" r="44" fill="none"
                  stroke="url(#cg)" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-from, #0a84ff)" />
                    <stop offset="100%" stopColor="var(--accent-to, #00c6ff)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                ✓
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white font-bold text-xl tracking-tight mb-1"
            >
              {dayTitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-white/40 text-sm mb-1"
            >
              {exerciseCount} esercizi completati
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/60 text-xs italic mt-4 leading-relaxed"
            >
              "{msg}"
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className="mt-8 px-8 py-3 text-sm font-semibold text-white active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, var(--accent-from, #0a84ff), var(--accent-to, #00c6ff))',
                borderRadius: 'var(--btn-radius, 50px)',
                boxShadow: '0 0 24px rgba(var(--glow-rgb,0,122,255), 0.35)',
              }}
            >
              Continua →
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
