import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';

export function useExerciseNotes(userId) {
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotes({});
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'users', userId, 'notes'),
      (snapshot) => {
        const data = {};
        snapshot.docs.forEach(doc => {
          data[doc.id] = doc.data();
        });
        setNotes(data);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const saveNote = useCallback(async (exerciseId, noteText) => {
    if (!userId) return;
    const id = String(exerciseId);
    await setDoc(doc(db, 'users', userId, 'notes', id), {
      text: noteText,
      updatedAt: new Date().toISOString(),
    });
  }, [userId]);

  const getNote = useCallback((exerciseId) => {
    return notes[String(exerciseId)]?.text || '';
  }, [notes]);

  return { notes, loading, saveNote, getNote };
}
