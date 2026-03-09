import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamificationBar({ stats, currentLevel, nextLevel, xpProgress, earnedBadges, allBadges, newBadge, levelUp }) {
  const [showBadges, setShowBadges] = React.useState(false);

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
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] glass-heavy rounded-2xl px-5 py-3 flex items-center gap-3 shadow-premium"
          >
            <span className="text-2xl">{newBadge.emoji}</span>
            <div>
              <p className="text-white text-xs font-bold">Nuovo Badge!</p>
              <p className="text-white/60 text-[10px]">{newBadge.title}</p>
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
            <div className="text-center">
              <motion.div
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-6xl mb-4"
              >
                {levelUp.emoji}
              </motion.div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Livello raggiunto</p>
              <p className="text-3xl font-black text-white mb-1">LVL {levelUp.level}</p>
              <p className="text-white/60 text-sm font-semibold">{levelUp.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main XP Bar */}
      <div className="glass-light rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentLevel.emoji}</span>
            <div>
              <p className="text-white/80 text-xs font-bold">LVL {currentLevel.level} · {currentLevel.title}</p>
              <p className="text-white/30 text-[10px]">{stats.xp} XP totali</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Streak */}
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm">🔥</span>
                <span className="text-orange-400 text-xs font-bold">{stats.currentStreak}</span>
              </div>
            )}
            {/* Badges button */}
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
        <div className="flex gap-3 mt-3">
          <div className="flex-1 text-center">
            <p className="text-white/20 text-[8px] font-bold uppercase">Esercizi</p>
            <p className="text-white/60 text-sm font-bold">{stats.totalExercises}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-white/20 text-[8px] font-bold uppercase">Streak</p>
            <p className="text-orange-400/80 text-sm font-bold">{stats.currentStreak}🔥</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-white/20 text-[8px] font-bold uppercase">Record</p>
            <p className="text-yellow-400/80 text-sm font-bold">{stats.totalPRs}🏆</p>
          </div>
        </div>
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
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest text-center mb-3">Badge</p>
            <div className="grid grid-cols-4 gap-2">
              {allBadges.map(badge => {
                const earned = earnedBadges.some(b => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`glass-light rounded-xl p-2 text-center transition-all ${earned ? '' : 'opacity-25 grayscale'}`}
                  >
                    <span className="text-lg block">{badge.emoji}</span>
                    <p className="text-white/60 text-[8px] font-bold mt-1 leading-tight">{badge.title}</p>
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
