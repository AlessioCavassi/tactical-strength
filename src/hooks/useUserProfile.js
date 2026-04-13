import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setError(null);
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.code === 'permission-denied'
          ? 'Permessi Firestore scaduti. Aggiorna le regole nella Firebase Console.'
          : 'Errore nel caricamento del profilo. Riprova.');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const saveProfile = useCallback(async (profileData) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, 'users', userId), {
        ...profileData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setProfile(prev => ({ ...prev, ...profileData }));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      setProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [userId]);

  const needsOnboarding = !loading && !error && !profile?.level;

  return { profile, loading, error, saveProfile, updateProfile, needsOnboarding };
}
