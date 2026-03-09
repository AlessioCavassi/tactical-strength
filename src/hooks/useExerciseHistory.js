import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';

export function useExerciseHistory(userId) {
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [prs, setPrs] = useState({});
  const [loading, setLoading] = useState(true);

  // Listen to all workouts
  useEffect(() => {
    if (!userId) {
      setAllWorkouts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'workouts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllWorkouts(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Listen to PRs
  useEffect(() => {
    if (!userId) {
      setPrs({});
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users', userId, 'prs'),
      (snapshot) => {
        const data = {};
        snapshot.docs.forEach(d => { data[d.id] = d.data(); });
        setPrs(data);
      }
    );

    return unsubscribe;
  }, [userId]);

  // Get last workout for a specific exercise
  const getLastWorkout = useCallback((exerciseId) => {
    const id = String(exerciseId);
    return allWorkouts.find(w => String(w.exerciseId) === id) || null;
  }, [allWorkouts]);

  // Get all workouts for a specific exercise (for history)
  const getExerciseHistory = useCallback((exerciseId) => {
    const id = String(exerciseId);
    return allWorkouts.filter(w => String(w.exerciseId) === id);
  }, [allWorkouts]);

  // Calculate 1RM using Epley formula: 1RM = weight × (1 + reps/30)
  const calc1RM = useCallback((weight, reps) => {
    const w = Number(weight);
    const r = Number(reps);
    if (!w || !r || r <= 0) return 0;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30));
  }, []);

  // Check and save PR
  const checkAndSavePR = useCallback(async (exerciseId, weight, reps, exerciseName) => {
    if (!userId) return null;
    const id = String(exerciseId);
    const new1RM = calc1RM(weight, reps);
    if (new1RM <= 0) return null;

    const currentPR = prs[id];
    const isNewPR = !currentPR || new1RM > (currentPR.estimated1RM || 0);

    if (isNewPR) {
      await setDoc(doc(db, 'users', userId, 'prs', id), {
        exerciseId: id,
        exerciseName: exerciseName || '',
        weight: Number(weight),
        reps: Number(reps),
        estimated1RM: new1RM,
        achievedAt: new Date().toISOString(),
      });
      return { new1RM, previousBest: currentPR?.estimated1RM || 0 };
    }
    return null;
  }, [userId, prs, calc1RM]);

  // Get progressive overload comparison
  const getOverloadStatus = useCallback((exerciseId, currentWeight, currentReps) => {
    const last = getLastWorkout(exerciseId);
    if (!last) return null;

    const lastVolume = (Number(last.weight) || 0) * (Number(last.reps) || 1);
    const currentVolume = (Number(currentWeight) || 0) * (Number(currentReps) || 1);

    if (currentVolume > lastVolume) return 'up';
    if (currentVolume < lastVolume) return 'down';
    return 'same';
  }, [getLastWorkout]);

  // Get PR for exercise
  const getPR = useCallback((exerciseId) => {
    return prs[String(exerciseId)] || null;
  }, [prs]);

  return {
    allWorkouts,
    loading,
    getLastWorkout,
    getExerciseHistory,
    calc1RM,
    checkAndSavePR,
    getOverloadStatus,
    getPR,
  };
}
