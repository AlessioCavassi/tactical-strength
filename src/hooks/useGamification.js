import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// XP rewards
const XP_EXERCISE_COMPLETE = 25;
const XP_STREAK_BONUS = 50;
const XP_PR_BONUS = 75;
const XP_NOTE_BONUS = 10;

// Level thresholds — localized via t()
export const getLEVELS = (t) => [
  { level: 1, title: t?.gamLvl1 || 'Recluta', xpNeeded: 0, emoji: '🌱' },
  { level: 2, title: t?.gamLvl2 || 'Cadetto', xpNeeded: 100, emoji: '🏃' },
  { level: 3, title: t?.gamLvl3 || 'Soldato', xpNeeded: 300, emoji: '💪' },
  { level: 4, title: t?.gamLvl4 || 'Sergente', xpNeeded: 600, emoji: '🎖️' },
  { level: 5, title: t?.gamLvl5 || 'Tenente', xpNeeded: 1000, emoji: '⭐' },
  { level: 6, title: t?.gamLvl6 || 'Capitano', xpNeeded: 1500, emoji: '🏅' },
  { level: 7, title: t?.gamLvl7 || 'Maggiore', xpNeeded: 2200, emoji: '🔥' },
  { level: 8, title: t?.gamLvl8 || 'Colonnello', xpNeeded: 3000, emoji: '⚡' },
  { level: 9, title: t?.gamLvl9 || 'Generale', xpNeeded: 4000, emoji: '🦅' },
  { level: 10, title: t?.gamLvl10 || 'Leggenda', xpNeeded: 5500, emoji: '🏆' },
];
const LEVELS = getLEVELS();

// Badge definitions — localized via t()
export const getBADGES = (t) => [
  // ── FISICA: Volume ──
  { id: 'first_workout', title: t?.[`badge_first_workout`] || 'Prima Sessione', desc: t?.[`badge_first_workout_desc`] || 'Completa il tuo primo esercizio', emoji: '🎯', category: 'fisica', condition: (s) => s.totalExercises >= 1 },
  { id: 'five_workouts', title: t?.[`badge_five_workouts`] || 'Costante', desc: t?.[`badge_five_workouts_desc`] || 'Completa 5 esercizi', emoji: '🔄', category: 'fisica', condition: (s) => s.totalExercises >= 5 },
  { id: 'ten_workouts', title: t?.[`badge_ten_workouts`] || 'Macchina', desc: t?.[`badge_ten_workouts_desc`] || 'Completa 10 esercizi', emoji: '⚙️', category: 'fisica', condition: (s) => s.totalExercises >= 10 },
  { id: 'twentyfive_workouts', title: t?.[`badge_twentyfive_workouts`] || 'Inarrestabile', desc: t?.[`badge_twentyfive_workouts_desc`] || 'Completa 25 esercizi', emoji: '🚀', category: 'fisica', condition: (s) => s.totalExercises >= 25 },
  { id: 'fifty_workouts', title: t?.[`badge_fifty_workouts`] || 'Veterano', desc: t?.[`badge_fifty_workouts_desc`] || 'Completa 50 esercizi', emoji: '🎖️', category: 'fisica', condition: (s) => s.totalExercises >= 50 },
  { id: 'hundred_workouts', title: t?.[`badge_hundred_workouts`] || 'Centurione', desc: t?.[`badge_hundred_workouts_desc`] || 'Completa 100 esercizi', emoji: '💯', category: 'fisica', condition: (s) => s.totalExercises >= 100 },
  // ── FISICA: Streak ──
  { id: 'streak_3', title: t?.[`badge_streak_3`] || 'Tre di Fila', desc: t?.[`badge_streak_3_desc`] || '3 giorni di streak', emoji: '🔥', category: 'fisica', condition: (s) => s.bestStreak >= 3 },
  { id: 'streak_7', title: t?.[`badge_streak_7`] || 'Settimana Perfetta', desc: t?.[`badge_streak_7_desc`] || '7 giorni di streak', emoji: '💎', category: 'fisica', condition: (s) => s.bestStreak >= 7 },
  { id: 'streak_14', title: t?.[`badge_streak_14`] || 'Due Settimane', desc: t?.[`badge_streak_14_desc`] || '14 giorni di streak', emoji: '👑', category: 'fisica', condition: (s) => s.bestStreak >= 14 },
  { id: 'streak_30', title: t?.[`badge_streak_30`] || 'Mese Tattico', desc: t?.[`badge_streak_30_desc`] || '30 giorni di streak', emoji: '🦅', category: 'fisica', condition: (s) => s.bestStreak >= 30 },
  // ── FISICA: Performance ──
  { id: 'first_pr', title: t?.[`badge_first_pr`] || 'Primo Record', desc: t?.[`badge_first_pr_desc`] || 'Batti il tuo primo PR', emoji: '🏆', category: 'fisica', condition: (s) => s.totalPRs >= 1 },
  { id: 'five_prs', title: t?.[`badge_five_prs`] || 'Collezionista', desc: t?.[`badge_five_prs_desc`] || 'Batti 5 PR', emoji: '💪', category: 'fisica', condition: (s) => s.totalPRs >= 5 },
  { id: 'ten_prs', title: t?.[`badge_ten_prs`] || 'Record Breaker', desc: t?.[`badge_ten_prs_desc`] || 'Batti 10 PR', emoji: '⚡', category: 'fisica', condition: (s) => s.totalPRs >= 10 },
  { id: 'all_days', title: t?.[`badge_all_days`] || 'Completo', desc: t?.[`badge_all_days_desc`] || 'Allena tutti e 5 i giorni', emoji: '⭐', category: 'fisica', condition: (s) => s.daysCompleted >= 5 },
  // ── FISICA: Speciali ──
  { id: 'early_bird', title: t?.[`badge_early_bird`] || 'Alba del Guerriero', desc: t?.[`badge_early_bird_desc`] || 'Completa 5 allenamenti prima delle 8:00', emoji: '🌅', category: 'fisica', condition: (s) => (s.earlyWorkouts || 0) >= 5 },
  { id: 'night_owl', title: t?.[`badge_night_owl`] || 'Lupo Notturno', desc: t?.[`badge_night_owl_desc`] || 'Completa 5 allenamenti dopo le 21:00', emoji: '🌙', category: 'fisica', condition: (s) => (s.lateWorkouts || 0) >= 5 },
  { id: 'pr_machine', title: t?.[`badge_pr_machine`] || 'PR Machine', desc: t?.[`badge_pr_machine_desc`] || 'Batti 3 PR nella stessa settimana', emoji: '💥', category: 'fisica', condition: (s) => (s.weeklyPRs || 0) >= 3 },
  // ── MENTALE: Consapevolezza ──
  { id: 'note_taker', title: t?.[`badge_note_taker`] || 'Studioso', desc: t?.[`badge_note_taker_desc`] || 'Scrivi la tua prima nota', emoji: '📝', category: 'mentale', condition: (s) => s.totalNotes >= 1 },
  { id: 'deep_thinker', title: t?.[`badge_deep_thinker`] || 'Mindful', desc: t?.[`badge_deep_thinker_desc`] || 'Scrivi note su 5 esercizi diversi', emoji: '🧘', category: 'mentale', condition: (s) => s.totalNotes >= 5 },
  { id: 'self_aware', title: t?.[`badge_self_aware`] || 'Autoconsapevole', desc: t?.[`badge_self_aware_desc`] || 'Scrivi note su 15 esercizi', emoji: '🪞', category: 'mentale', condition: (s) => s.totalNotes >= 15 },
  // ── MENTALE: Resilienza ──
  { id: 'comeback', title: t?.[`badge_comeback`] || 'Rinascita', desc: t?.[`badge_comeback_desc`] || 'Torna ad allenarti dopo una pausa', emoji: '🌅', category: 'mentale', condition: (s) => s.comebacks >= 1 },
  { id: 'mental_warrior', title: t?.[`badge_mental_warrior`] || 'Guerriero Mentale', desc: t?.[`badge_mental_warrior_desc`] || 'Completa 3 sessioni difficili (RPE 9+)', emoji: '🧠', category: 'mentale', condition: (s) => (s.highRpeSessions || 0) >= 3 },
  { id: 'process_believer', title: t?.[`badge_process_believer`] || 'Il Processo', desc: t?.[`badge_process_believer_desc`] || 'Allenati per 30 giorni totali (non consecutivi)', emoji: '🗓️', category: 'mentale', condition: (s) => (s.daysWorkedOut || []).length >= 30 },
  { id: 'discipline', title: t?.[`badge_discipline`] || 'Disciplina', desc: t?.[`badge_discipline_desc`] || 'Allenati in 3 giorni diversi della settimana', emoji: '⚔️', category: 'mentale', condition: (s) => s.daysCompleted >= 3 },
  // ── MENTALE: Crescita ──
  { id: 'level5', title: t?.[`badge_level5`] || 'Forza Interiore', desc: t?.[`badge_level5_desc`] || 'Raggiungi il livello 5', emoji: '💫', category: 'mentale', condition: (s) => s.xp >= 1000 },
  { id: 'level8', title: t?.[`badge_level8`] || 'Elite Mentality', desc: t?.[`badge_level8_desc`] || 'Raggiungi il livello 8', emoji: '🌟', category: 'mentale', condition: (s) => s.xp >= 3000 },
  { id: 'explorer', title: t?.[`badge_explorer`] || 'Curioso', desc: t?.[`badge_explorer_desc`] || 'Prova esercizi da 4 giorni diversi', emoji: '🔭', category: 'mentale', condition: (s) => s.daysCompleted >= 4 },
  { id: 'hard_session', title: t?.[`badge_hard_session`] || 'Oltre il Limite', desc: t?.[`badge_hard_session_desc`] || 'Completa una sessione con RPE 10 su tutti gli esercizi', emoji: '🤯', category: 'mentale', condition: (s) => (s.perfectRPE10 || 0) >= 1 },
  { id: 'consistency_king', title: t?.[`badge_consistency_king`] || 'Re della Costanza', desc: t?.[`badge_consistency_king_desc`] || 'Allenati per 4 settimane consecutive (almeno 2 giorni/sett.)', emoji: '👑', category: 'mentale', condition: (s) => (s.consistentWeeks || 0) >= 4 },
];
const BADGES = getBADGES();

// Post-workout motivational quotes — localized via t()
export const getWORKOUT_QUOTES = (t) => t?.quotes || [
  { text: "Il dolore che senti oggi è la forza che sentirai domani.", author: "Arnold Schwarzenegger" },
  { text: "Non contare i giorni, fai sì che i giorni contino.", author: "Muhammad Ali" },
  { text: "Il tuo corpo può farcela. È la tua mente che devi convincere.", author: "Anonimo" },
  { text: "Il campione non è chi non cade mai, ma chi si rialza ogni volta.", author: "Vince Lombardi" },
  { text: "La forza non viene dalla capacità fisica ma da una volontà indomabile.", author: "Mahatma Gandhi" },
  { text: "Ogni allenamento che completi è una promessa mantenuta con te stesso.", author: "Tactical Strength PT" },
  { text: "Non si tratta di essere il migliore. Si tratta di essere migliore di ieri.", author: "Anonimo" },
  { text: "Il sudore è solo il grasso che piange.", author: "Anonimo" },
  { text: "La mente si arrende prima dei muscoli. Ricordalo.", author: "Tactical Strength PT" },
  { text: "Ogni ripetizione ti separa da chi hai deciso di diventare.", author: "David Goggins" },
  { text: "La motivazione ti fa partire. L'abitudine ti fa andare avanti.", author: "Jim Ryun" },
  { text: "Non fermarti quando sei stanco. Fermati quando hai finito.", author: "Anonimo" },
  { text: "I vincitori fanno quello che i perdenti non vogliono fare.", author: "Anonimo" },
  { text: "Il corpo raggiunge quello che la mente crede.", author: "Napoleon Hill" },
  { text: "Costruisci ogni giorno come se fosse il primo mattone della versione migliore di te.", author: "Tactical Strength PT" },
  { text: "L'allenamento è un dialogo onesto con te stesso. Niente bugie.", author: "Tactical Strength PT" },
  { text: "La coerenza batte sempre il talento quando il talento non si allena.", author: "Tim Notke" },
  { text: "Sii la persona che il tuo cane pensa che tu sia.", author: "Anonimo" },
  { text: "Se non ti fa paura, non ti farà crescere.", author: "Tactical Strength PT" },
  { text: "Il recupero non è debolezza. È tattica.", author: "Tactical Strength PT" },
];
export const WORKOUT_QUOTES = getWORKOUT_QUOTES();

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

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const lastDate = stats.lastWorkoutDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = stats.currentStreak;
    let comebacks = stats.comebacks || 0;
    if (lastDate === today) {
      // Same day, no streak change
    } else if (lastDate === yesterday) {
      newStreak = stats.currentStreak + 1;
    } else {
      newStreak = 1;
      // Comeback: returning after 3+ day gap
      if (lastDate && lastDate < yesterday) comebacks += 1;
    }

    const daysWorkedOut = [...new Set([...(stats.daysWorkedOut || []), today])];
    const uniqueDays = new Set(daysWorkedOut.map(d => new Date(d).getDay()));

    const newStats = {
      ...stats,
      totalExercises: stats.totalExercises + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      lastWorkoutDate: today,
      daysWorkedOut: daysWorkedOut.slice(-30),
      daysCompleted: uniqueDays.size,
      comebacks,
      earlyWorkouts: (stats.earlyWorkouts || 0) + (hour < 8 ? 1 : 0),
      lateWorkouts:  (stats.lateWorkouts  || 0) + (hour >= 21 ? 1 : 0),
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

  // Record RPE (Rate of Perceived Exertion: 1-10)
  const recordRPE = useCallback(async (rpe) => {
    if (!userId || !stats || !rpe) return;
    const isHigh = rpe >= 9;
    const newStats = {
      ...stats,
      highRpeSessions: (stats.highRpeSessions || 0) + (isHigh ? 1 : 0),
      xp: stats.xp + (isHigh ? XP_PR_BONUS : 0), // bonus XP for pushing hard
    };
    const updatedBadges = await checkBadges(newStats);
    newStats.unlockedBadges = updatedBadges;
    setStats(newStats);
    try {
      await setDoc(doc(db, 'users', userId, 'gamification', 'stats'), newStats);
    } catch (error) {
      console.error('Record RPE error:', error);
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
    recordRPE,
  };
}
