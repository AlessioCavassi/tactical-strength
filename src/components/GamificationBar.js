import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORKOUT_QUOTES } from '../hooks/useGamification';

export default function GamificationBar({ stats, currentLevel, nextLevel, xpProgress, earnedBadges, allBadges, newBadge, levelUp, workoutQuote }) {
  const [showBadges, setShowBadges] = React.useState(false);
  const [badgeFilter, setBadgeFilter] = React.useState('all');

  const todayQuote = useMemo(() => {
    const idx = Math.floor(Date.now() / 86400000) % WORKOUT_QUOTES.length;
    return WORKOUT_QUOTES[idx];
  }, []);

  const visibleBadges = useMemo(() => {
    if (badgeFilter === 'all') return allBadges;
    return allBadges.filter(b => b.category === badgeFilter);
  }, [allBadges, badgeFilter]);

  if (!stats) return null;

  return (
    <>
      {/* New Badge Toast */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] glass-heavy rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-premium min-w-[220px]"
          >
            <span className="text-3xl">{newBadge.emoji}</span>
            <div>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">
                {newBadge.category === 'mentale' ? '🧠 Ricompensa Mentale' : '💪 Ricompensa Fisica'}
              </p>
              <p className="text-white text-sm font-black">{newBadge.title}</p>
              <p className="text-white/50 text-[10px]">{newBadge.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Toast */}
      <AnimatePresence>
        {levelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-xl"
          >
            <div className="text-center px-8">
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-7xl mb-4"
              >
                {levelUp.emoji}
              </motion.div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Livello raggiunto</p>
              <p className="text-4xl font-black text-white mb-1">LVL {levelUp.level}</p>
              <p className="text-white/70 text-lg font-semibold mb-4">{levelUp.title}</p>
              <p className="text-white/30 text-xs max-w-[24ch] mx-auto leading-relaxed">
                Ogni livello è una versione più forte di te.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-workout Quote Toast */}
      <AnimatePresence>
        {workoutQuote && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-4 right-4 z-[55] glass-heavy rounded-2xl p-4 shadow-premium border border-white/5"
          >
            <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-1.5">💬 Pensiero del giorno</p>
            <p className="text-white/80 text-sm font-medium leading-relaxed italic">"{workoutQuote.text}"</p>
            <p className="text-white/30 text-[10px] mt-1.5 text-right">— {workoutQuote.author}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main XP Bar */}
      <div className="glass-light rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentLevel.emoji}</span>
            <div>
              <p className="text-white/80 text-xs font-bold">LVL {currentLevel.level} · {currentLevel.title}</p>
              <p className="text-white/30 text-[10px]">{stats.xp} XP totali</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 rounded-lg px-2 py-1">
                <span className="text-sm">🔥</span>
                <span className="text-orange-400 text-xs font-bold">{stats.currentStreak}</span>
              </div>
            )}
            <button
              onClick={() => setShowBadges(!showBadges)}
              className="glass rounded-lg px-2 py-1 text-[10px] text-white/40 font-semibold active:scale-95 transition-transform"
            >
              🏅 {earnedBadges.length}/{allBadges.length}
            </button>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ type: 'spring', duration: 0.8 }}
          />
        </div>
        {nextLevel && (
          <p className="text-white/15 text-[9px] mt-1.5 text-right">
            {nextLevel.xpNeeded - stats.xp} XP per LVL {nextLevel.level}
          </p>
        )}

        {/* Stats row */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 text-center glass rounded-xl py-2">
            <p className="text-white/20 text-[8px] font-bold uppercase">Esercizi</p>
            <p className="text-white/60 text-sm font-bold">{stats.totalExercises}</p>
          </div>
          <div className="flex-1 text-center glass rounded-xl py-2">
            <p className="text-white/20 text-[8px] font-bold uppercase">Streak</p>
            <p className="text-orange-400/80 text-sm font-bold">{stats.currentStreak}🔥</p>
          </div>
          <div className="flex-1 text-center glass rounded-xl py-2">
            <p className="text-white/20 text-[8px] font-bold uppercase">Record</p>
            <p className="text-yellow-400/80 text-sm font-bold">{stats.totalPRs}🏆</p>
          </div>
          <div className="flex-1 text-center glass rounded-xl py-2">
            <p className="text-white/20 text-[8px] font-bold uppercase">Badge</p>
            <p className="text-purple-400/80 text-sm font-bold">{earnedBadges.length}</p>
          </div>
        </div>
      </div>

      {/* Daily Quote */}
      <div className="glass-light rounded-xl p-3 mb-6 border border-white/5">
        <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-1">💬 Pensiero del giorno</p>
        <p className="text-white/60 text-xs italic leading-relaxed">"{todayQuote.text}"</p>
        <p className="text-white/25 text-[9px] mt-1 text-right">— {todayQuote.author}</p>
      </div>

      {/* Badge Grid (expandable) */}
      <AnimatePresence>
        {showBadges && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            {/* Filter tabs */}
            <div className="flex gap-2 mb-3 justify-center">
              {['all', 'fisica', 'mentale'].map(f => (
                <button
                  key={f}
                  onClick={() => setBadgeFilter(f)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 ${
                    badgeFilter === f ? 'bg-blue-500/30 text-blue-300' : 'glass-light text-white/30'
                  }`}
                >
                  {f === 'all' ? '🏅 Tutti' : f === 'fisica' ? '💪 Fisica' : '🧠 Mentale'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {visibleBadges.map(badge => {
                const earned = earnedBadges.some(b => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`glass-light rounded-xl p-2 text-center transition-all ${earned ? '' : 'opacity-20 grayscale'}`}
                    title={badge.desc}
                  >
                    <span className="text-lg block">{badge.emoji}</span>
                    <p className="text-white/60 text-[8px] font-bold mt-1 leading-tight">{badge.title}</p>
                    {badge.category === 'mentale' && earned && (
                      <span className="text-[7px] text-purple-400/60 font-semibold">mentale</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
