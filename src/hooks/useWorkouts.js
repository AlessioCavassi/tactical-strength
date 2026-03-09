import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

export function useWorkouts(userId) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to workouts in realtime
  useEffect(() => {
    if (!userId) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', userId, 'workouts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkouts(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Save a completed exercise
  const saveWorkout = useCallback(async (exerciseData) => {
    if (!userId) return;
    const id = `${Date.now()}_${exerciseData.exerciseId}`;
    await setDoc(doc(db, 'users', userId, 'workouts', id), {
      ...exerciseData,
      createdAt: serverTimestamp(),
    });
  }, [userId]);

  // Delete a workout
  const deleteWorkout = useCallback(async (workoutId) => {
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId));
  }, [userId]);

  return { workouts, loading, saveWorkout, deleteWorkout };
}
