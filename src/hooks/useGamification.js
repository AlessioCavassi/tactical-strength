import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// XP rewards
const XP_EXERCISE_COMPLETE = 25;
const XP_STREAK_BONUS = 50;
const XP_PR_BONUS = 75;
const XP_NOTE_BONUS = 10;

// Level thresholds
const LEVELS = [
  { level: 1, title: 'Recluta', xpNeeded: 0, emoji: '🌱' },
  { level: 2, title: 'Cadetto', xpNeeded: 100, emoji: '🏃' },
  { level: 3, title: 'Soldato', xpNeeded: 300, emoji: '💪' },
  { level: 4, title: 'Sergente', xpNeeded: 600, emoji: '🎖️' },
  { level: 5, title: 'Tenente', xpNeeded: 1000, emoji: '⭐' },
  { level: 6, title: 'Capitano', xpNeeded: 1500, emoji: '🏅' },
  { level: 7, title: 'Maggiore', xpNeeded: 2200, emoji: '🔥' },
  { level: 8, title: 'Colonnello', xpNeeded: 3000, emoji: '⚡' },
  { level: 9, title: 'Generale', xpNeeded: 4000, emoji: '🦅' },
  { level: 10, title: 'Leggenda', xpNeeded: 5500, emoji: '🏆' },
];

// Badge definitions
const BADGES = [
  { id: 'first_workout', title: 'Prima Sessione', desc: 'Completa il tuo primo esercizio', emoji: '🎯', condition: (s) => s.totalExercises >= 1 },
  { id: 'five_workouts', title: 'Costante', desc: 'Completa 5 esercizi', emoji: '🔄', condition: (s) => s.totalExercises >= 5 },
  { id: 'ten_workouts', title: 'Macchina', desc: 'Completa 10 esercizi', emoji: '⚙️', condition: (s) => s.totalExercises >= 10 },
  { id: 'twentyfive_workouts', title: 'Inarrestabile', desc: 'Completa 25 esercizi', emoji: '🚀', condition: (s) => s.totalExercises >= 25 },
  { id: 'fifty_workouts', title: 'Veterano', desc: 'Completa 50 esercizi', emoji: '🎖️', condition: (s) => s.totalExercises >= 50 },
  { id: 'streak_3', title: 'Tre di Fila', desc: '3 giorni di streak', emoji: '🔥', condition: (s) => s.bestStreak >= 3 },
  { id: 'streak_7', title: 'Settimana Perfetta', desc: '7 giorni di streak', emoji: '💎', condition: (s) => s.bestStreak >= 7 },
  { id: 'streak_14', title: 'Due Settimane', desc: '14 giorni di streak', emoji: '👑', condition: (s) => s.bestStreak >= 14 },
  { id: 'first_pr', title: 'Primo Record', desc: 'Batti il tuo primo PR', emoji: '🏆', condition: (s) => s.totalPRs >= 1 },
  { id: 'five_prs', title: 'Collezionista', desc: 'Batti 5 PR', emoji: '💪', condition: (s) => s.totalPRs >= 5 },
  { id: 'note_taker', title: 'Studioso', desc: 'Scrivi la tua prima nota', emoji: '📝', condition: (s) => s.totalNotes >= 1 },
  { id: 'all_days', title: 'Completo', desc: 'Allena tutti e 5 i giorni', emoji: '⭐', condition: (s) => s.daysCompleted >= 5 },
];

export function useGamification(userId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState(null);
  const [levelUp, setLevelUp] = useState(null);

  // Load stats
  useEffect(() => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', userId, 'gamification', 'stats'));
        if (docSnap.exists()) {
          setStats(docSnap.data());
        } else {
          const initial = {
            xp: 0,
            totalExercises: 0,
            totalPRs: 0,
            totalNotes: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastWorkoutDate: null,
            daysCompleted: 0,
            unlockedBadges: [],
            daysWorkedOut: [],
          };
          await setDoc(doc(db, 'users', userId, 'gamification', 'stats'), initial);
          setStats(initial);
        }
      } catch (error) {
        console.error('Gamification load error:', error);
      }
      setLoading(false);
    };

    loadStats();
  }, [userId]);

  // Current level
  const currentLevel = useMemo(() => {
    if (!stats) return LEVELS[0];
    let lvl = LEVELS[0];
    for (const l of LEVELS) {
      if (stats.xp >= l.xpNeeded) lvl = l;
      else break;
    }
    return lvl;
  }, [stats]);

  // Next level
  const nextLevel = useMemo(() => {
    const idx = LEVELS.findIndex(l => l.level === currentLevel.level);
    return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  }, [currentLevel]);

  // XP progress to next level (0-1)
  const xpProgress = useMemo(() => {
    if (!stats || !nextLevel) return 1;
    const currentXP = stats.xp - currentLevel.xpNeeded;
    const neededXP = nextLevel.xpNeeded - currentLevel.xpNeeded;
    return Math.min(currentXP / neededXP, 1);
  }, [stats, currentLevel, nextLevel]);

  // Earned badges
  const earnedBadges = useMemo(() => {
    if (!stats) return [];
    return BADGES.filter(b => b.condition(stats));
  }, [stats]);

  // Check for new badges
  const checkBadges = useCallback(async (newStats) => {
    const previousBadges = newStats.unlockedBadges || [];
    const nowEarned = BADGES.filter(b => b.condition(newStats)).map(b => b.id);
    const brandNew = nowEarned.filter(id => !previousBadges.includes(id));

    if (brandNew.length > 0) {
      const badge = BADGES.find(b => b.id === brandNew[0]);
      setNewBadge(badge);
      setTimeout(() => setNewBadge(null), 3000);
      return nowEarned;
    }
    return previousBadges;
  }, []);

  // Award XP
  const awardXP = useCallback(async (amount, reason) => {
    if (!userId || !stats) return;

    const oldLevel = LEVELS.findIndex(l => stats.xp >= l.xpNeeded && (LEVELS[LEVELS.indexOf(l) + 1]?.xpNeeded > stats.xp || LEVELS.indexOf(l) === LEVELS.length - 1));
    const newXP = stats.xp + amount;
    const newLevelIdx = LEVELS.findIndex(l => newXP >= l.xpNeeded && (LEVELS[LEVELS.indexOf(l) + 1]?.xpNeeded > newXP || LEVELS.indexOf(l) === LEVELS.length - 1));

    if (newLevelIdx > oldLevel && newLevelIdx >= 0) {
      setLevelUp(LEVELS[newLevelIdx]);
      setTimeout(() => setLevelUp(null), 3000);
    }

    const newStats = { ...stats, xp: newXP };
    setStats(newStats);

    try {
      await updateDoc(doc(db, 'users', userId, 'gamification', 'stats'), { xp: increment(amount) });
    } catch (error) {
      console.error('XP award error:', error);
    }
  }, [userId, stats]);

  // Record exercise completion
  const recordExercise = useCallback(async () => {
    if (!userId || !stats) return;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = stats.lastWorkoutDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = stats.currentStreak;
    if (lastDate === today) {
      // Same day, no streak change
    } else if (lastDate === yesterday) {
      newStreak = stats.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const daysWorkedOut = [...new Set([...(stats.daysWorkedOut || []), today])];
    const uniqueDays = new Set(daysWorkedOut.map(d => {
      const date = new Date(d);
      return date.getDay();
    }));

    const newStats = {
      ...stats,
      totalExercises: stats.totalExercises + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      lastWorkoutDate: today,
      daysWorkedOut: daysWorkedOut.slice(-30),
      daysCompleted: uniqueDays.size,
      xp: stats.xp + XP_EXERCISE_COMPLETE + (newStreak > stats.currentStreak ? XP_STREAK_BONUS : 0),
    };

    const updatedBadges = await checkBadges(newStats);
    newStats.unlockedBadges = updatedBadges;
    setStats(newStats);

    try {
      await setDoc(doc(db, 'users', userId, 'gamification', 'stats'), newStats);
    } catch (error) {
      console.error('Record exercise error:', error);
    }
  }, [userId, stats, checkBadges]);

  // Record PR
  const recordPR = useCallback(async () => {
    if (!userId || !stats) return;

    const newStats = {
      ...stats,
      totalPRs: stats.totalPRs + 1,
      xp: stats.xp + XP_PR_BONUS,
    };

    const updatedBadges = await checkBadges(newStats);
    newStats.unlockedBadges = updatedBadges;
    setStats(newStats);

    try {
      await setDoc(doc(db, 'users', userId, 'gamification', 'stats'), newStats);
    } catch (error) {
      console.error('Record PR error:', error);
    }
  }, [userId, stats, checkBadges]);

  // Record note
  const recordNote = useCallback(async () => {
    if (!userId || !stats) return;

    const newStats = {
      ...stats,
      totalNotes: stats.totalNotes + 1,
      xp: stats.xp + XP_NOTE_BONUS,
    };

    const updatedBadges = await checkBadges(newStats);
    newStats.unlockedBadges = updatedBadges;
    setStats(newStats);

    try {
      await setDoc(doc(db, 'users', userId, 'gamification', 'stats'), newStats);
    } catch (error) {
      console.error('Record note error:', error);
    }
  }, [userId, stats, checkBadges]);

  return {
    stats,
    loading,
    currentLevel,
    nextLevel,
    xpProgress,
    earnedBadges,
    allBadges: BADGES,
    newBadge,
    levelUp,
    awardXP,
    recordExercise,
    recordPR,
    recordNote,
  };
}
