import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORKOUT_QUOTES } from '../hooks/useGamification';
import BadgeShowcase from './BadgeShowcase';
import { useLanguage } from '../i18n/LanguageContext';

export default function GamificationBar({ stats, currentLevel, nextLevel, xpProgress, earnedBadges, allBadges, newBadge, levelUp, workoutQuote }) {
  const { t } = useLanguage();
  const [showBadges, setShowBadges] = useState(false);

  const todayQuote = useMemo(() => {
    const idx = Math.floor(Date.now() / 86400000) % WORKOUT_QUOTES.length;
    return WORKOUT_QUOTES[idx];
  }, []);

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
                {newBadge.category === 'mentale' ? t.mentalReward : t.physicalReward}
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
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">{t.levelReached}</p>
              <p className="text-4xl font-black text-white mb-1">LVL {levelUp.level}</p>
              <p className="text-white/70 text-lg font-semibold mb-4">{levelUp.title}</p>
              <p className="text-white/30 text-xs max-w-[24ch] mx-auto leading-relaxed">
                {t.levelUpMsg}
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
            <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-1.5">{t.dailyThought}</p>
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
              <p className="text-white/30 text-[10px]">{stats.xp} {t.totalXP}</p>
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
            style={{ background: 'linear-gradient(90deg, var(--accent-from), var(--accent-to))' }}
            className="h-full rounded-full"
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
            <p className="text-white/20 text-[8px] uppercase font-bold tracking-wider">{t.statExercises}</p>
            <p className="text-white/60 text-sm font-bold">{stats.totalExercises}</p>
          </div>
          <div className="flex-1 text-center glass rounded-xl py-2">
            <p className="text-white/20 text-[8px] uppercase font-bold tracking-wider">{t.statStreak}</p>
            <p className="text-orange-400/80 text-sm font-bold">{stats.currentStreak}🔥</p>
          </div>
          <div className="flex-1 text-center glass rounded-xl py-2">
            <p className="text-white/20 text-[8px] uppercase font-bold tracking-wider">{t.statRecords}</p>
            <p className="text-yellow-400/80 text-sm font-bold">{stats.totalPRs}🏆</p>
          </div>
          <div className="flex-1 text-center glass rounded-xl py-2">
            <p className="text-white/20 text-[8px] font-bold uppercase">{t.statBadges}</p>
            <p className="text-purple-400/80 text-sm font-bold">{earnedBadges.length}</p>
          </div>
        </div>
      </div>

      {/* Daily Quote */}
      <div className="glass-light rounded-xl p-3 mb-6 border border-white/5">
        <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mb-1">{t.dailyThought}</p>
        <p className="text-white/60 text-xs italic leading-relaxed">"{todayQuote.text}"</p>
        <p className="text-white/25 text-[9px] mt-1 text-right">— {todayQuote.author}</p>
      </div>

      {/* Badge Showcase full-screen popup */}
      <AnimatePresence>
        {showBadges && (
          <BadgeShowcase
            allBadges={allBadges}
            earnedBadges={earnedBadges}
            stats={stats}
            onClose={() => setShowBadges(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
