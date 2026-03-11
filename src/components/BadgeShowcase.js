import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CONFIG = {
  all:     { label: 'Tutti',   icon: '🏅', glow: 'from-yellow-500/20 to-orange-500/20',  ring: 'ring-yellow-500/30'  },
  fisica:  { label: 'Fisica',  icon: '💪', glow: 'from-orange-500/20 to-red-500/20',     ring: 'ring-orange-500/40'  },
  mentale: { label: 'Mentale', icon: '🧠', glow: 'from-purple-500/20 to-violet-500/20',  ring: 'ring-purple-500/40'  },
};

export default function BadgeShowcase({ allBadges, earnedBadges, stats, onClose }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const earnedSet  = useMemo(() => new Set(earnedBadges.map(b => b.id)), [earnedBadges]);
  const earnedCount = earnedBadges.length;
  const totalCount  = allBadges.length;
  const pct = Math.round((earnedCount / totalCount) * 100);

  const visible = useMemo(() =>
    filter === 'all' ? allBadges : allBadges.filter(b => b.category === filter),
    [allBadges, filter]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(24px)' }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Trofei</h1>
            <p className="text-white/30 text-xs mt-0.5">
              {earnedCount} di {totalCount} sbloccati · {pct}%
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/40 active:scale-90 transition-transform mt-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, type: 'spring', bounce: 0.2 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #fbbf24, #f97316, #ec4899)' }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-white/15 font-semibold mb-4">
          <span>0</span><span>{totalCount}</span>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-4">
          {stats && (
            <>
              <div className="flex-1 glass-light rounded-xl py-2 text-center">
                <p className="text-white/20 text-[8px] uppercase font-bold">Streak</p>
                <p className="text-orange-400 text-sm font-black">{stats.currentStreak}🔥</p>
              </div>
              <div className="flex-1 glass-light rounded-xl py-2 text-center">
                <p className="text-white/20 text-[8px] uppercase font-bold">Record</p>
                <p className="text-yellow-400 text-sm font-black">{stats.totalPRs}🏆</p>
              </div>
              <div className="flex-1 glass-light rounded-xl py-2 text-center">
                <p className="text-white/20 text-[8px] uppercase font-bold">Esercizi</p>
                <p className="text-blue-400 text-sm font-black">{stats.totalExercises}</p>
              </div>
              <div className="flex-1 glass-light rounded-xl py-2 text-center">
                <p className="text-white/20 text-[8px] uppercase font-bold">XP</p>
                <p className="text-purple-400 text-sm font-black">{stats.xp}</p>
              </div>
            </>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const cnt = key === 'all'
              ? earnedCount
              : earnedBadges.filter(b => b.category === key).length;
            const tot = key === 'all'
              ? totalCount
              : allBadges.filter(b => b.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 py-2.5 rounded-2xl text-[10px] font-bold transition-all active:scale-95 ${
                  filter === key
                    ? 'bg-white/12 text-white ring-1 ring-white/10'
                    : 'glass-light text-white/30'
                }`}
              >
                {cfg.icon} {cfg.label}
                <span className="ml-1 opacity-40">{cnt}/{tot}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge grid — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        <div className="grid grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {visible.map((badge, i) => {
              const isEarned = earnedSet.has(badge.id);
              const cfg = CATEGORY_CONFIG[badge.category] || CATEGORY_CONFIG.fisica;
              return (
                <motion.button
                  key={badge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: isEarned ? 1 : 0.28, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.3) }}
                  onClick={() => setSelected(badge)}
                  className={`relative glass-light rounded-2xl p-3.5 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                    isEarned ? `ring-1 ${cfg.ring}` : 'grayscale'
                  }`}
                >
                  {/* Glow for earned */}
                  {isEarned && (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cfg.glow} opacity-50`} />
                  )}

                  <span className="text-3xl relative z-10" style={{ filter: isEarned ? 'drop-shadow(0 0 8px rgba(255,180,0,0.4))' : 'none' }}>
                    {badge.emoji}
                  </span>
                  <p className={`text-[9px] font-bold leading-tight text-center relative z-10 ${isEarned ? 'text-white/80' : 'text-white/30'}`}>
                    {badge.title}
                  </p>
                  {isEarned && (
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Locked count summary */}
        {earnedCount < totalCount && (
          <p className="text-center text-white/15 text-[10px] mt-5">
            {totalCount - earnedCount} badge ancora da sbloccare
          </p>
        )}
      </div>

      {/* Badge detail bottom sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80]"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-[81] rounded-t-3xl p-6 pb-12"
              style={{ background: 'rgba(18,18,22,0.98)', backdropFilter: 'blur(30px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${
                  CATEGORY_CONFIG[selected.category]?.glow || 'from-white/5 to-white/5'
                } ring-1 ${CATEGORY_CONFIG[selected.category]?.ring || 'ring-white/10'}`}>
                  <span className="text-4xl" style={{ filter: earnedSet.has(selected.id) ? 'drop-shadow(0 0 10px rgba(255,180,0,0.5))' : 'grayscale(1)' }}>
                    {selected.emoji}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-wider mb-0.5">
                    {selected.category === 'mentale' ? '🧠 Badge Mentale' : '💪 Badge Fisico'}
                  </p>
                  <p className="text-white font-black text-lg leading-tight">{selected.title}</p>
                  {earnedSet.has(selected.id) ? (
                    <span className="inline-flex items-center gap-1 mt-1 text-green-400 text-[10px] font-bold">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Sbloccato
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1 text-white/25 text-[10px] font-semibold">
                      🔒 Bloccato
                    </span>
                  )}
                </div>
              </div>

              <div className="glass-light rounded-2xl p-4">
                <p className="text-white/25 text-[9px] font-bold uppercase tracking-wider mb-1.5">
                  {earnedSet.has(selected.id) ? 'Come hai sbloccato questo badge' : 'Come sbloccarlo'}
                </p>
                <p className="text-white/60 text-sm leading-relaxed">{selected.desc}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-full mt-4 py-3.5 rounded-2xl glass text-white/40 text-sm font-semibold active:scale-95 transition-transform"
              >
                Chiudi
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
