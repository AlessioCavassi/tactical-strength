import React, { useState, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import ThemePicker from './components/ThemePicker';
import FloatingParticles from './components/FloatingParticles';
import { exercisesData } from './data/exercises';
import ExerciseList from './components/ExerciseList';
import HeroFuturistic from './components/ui/hero-futuristic.js';
import { AnimatedTabs } from './components/ui/animated-tabs';
import ProgressTable from './components/ProgressTable';
import OnboardingScreen from './components/OnboardingScreen';
import { useAuth } from './hooks/useAuth';
import { useWorkouts } from './hooks/useWorkouts';
import { useUserProfile } from './hooks/useUserProfile';
import { useExerciseNotes } from './hooks/useExerciseNotes';
import { useExerciseHistory } from './hooks/useExerciseHistory';
import { useGamification, WORKOUT_QUOTES } from './hooks/useGamification';
import GamificationBar from './components/GamificationBar';
import useAIWorkoutAssignment from './hooks/useAIWorkoutAssignment';
import AIWorkoutPersonalization from './components/AIWorkoutPersonalization';

// ── Trial period: AI workout available for first 14 days after signup ──
const TRIAL_DAYS = 14;
const isTrialActive = (profile) => {
  if (!profile?.trialStartedAt) return true; // legacy: assume active
  const msElapsed = Date.now() - new Date(profile.trialStartedAt).getTime();
  return msElapsed < TRIAL_DAYS * 24 * 60 * 60 * 1000;
};
const trialDaysLeft = (profile) => {
  if (!profile?.trialStartedAt) return TRIAL_DAYS;
  const msElapsed = Date.now() - new Date(profile.trialStartedAt).getTime();
  return Math.max(0, TRIAL_DAYS - Math.floor(msElapsed / 86400000));
};

const App = () => {
  const { user, loading, logout, loginWithGoogle } = useAuth();
  const { profile, loading: profileLoading, saveProfile, needsOnboarding } = useUserProfile(user?.uid);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedExercises, setCompletedExercises] = useState({});
  const [workoutQuote, setWorkoutQuote] = useState(null);
  const { workouts, saveWorkout, deleteWorkout } = useWorkouts(user?.uid);
  const { getNote, saveNote } = useExerciseNotes(user?.uid);
  const { getLastWorkout, getPR, calc1RM, checkAndSavePR } = useExerciseHistory(user?.uid);
  const gamification = useGamification(user?.uid);
  const aiWorkout = useAIWorkoutAssignment();
  const [showAIPersonalization, setShowAIPersonalization] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { setTheme, themes, themeId, currentTheme } = useTheme();

  const userLevel = profile?.level || 'beginner';
  const currentDayData = exercisesData[currentDay];
  const trialActive = isTrialActive(profile);
  const daysLeft = trialDaysLeft(profile);

  // Show a random motivational quote after exercise completion
  const showRandomQuote = useCallback(() => {
    const q = WORKOUT_QUOTES[Math.floor(Math.random() * WORKOUT_QUOTES.length)];
    setWorkoutQuote(q);
    setTimeout(() => setWorkoutQuote(null), 5000);
  }, []);

  const handleExerciseComplete = async (exerciseId, weight, reps) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: { weight, reps, completedAt: new Date().toISOString() }
    }));

    if (user && currentDayData) {
      const exercise = currentDayData.exercises.find(ex => ex.id === exerciseId);
      await saveWorkout({
        exerciseId,
        exerciseName: exercise?.name || exerciseId,
        day: currentDay,
        weight: weight || 0,
        reps: reps || 0,
        setsReps: exercise?.setsReps || '',
        completed: true,
      });
      if (gamification.recordExercise) gamification.recordExercise();
      // 30% chance to show motivational quote
      if (Math.random() < 0.3) showRandomQuote();
    }
  };

  const getDayGradient = (color) => {
    switch (color) {
      case 'green': return 'gradient-green';
      case 'blue': return 'gradient-blue';
      case 'yellow': return 'gradient-yellow';
      case 'red': return 'gradient-red';
      case 'orange': return 'gradient-orange';
      default: return 'gradient-blue';
    }
  };

  // ── Loading ──
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Landing page: HeroFuturistic IS the landing page ──
  if (!user) {
    return <HeroFuturistic isLanding onLogin={loginWithGoogle} loginLoading={loading} />;
  }

  // ── Onboarding ──
  if (needsOnboarding) {
    return (
      <OnboardingScreen
        user={user}
        onComplete={async (onboardingData) => {
          await saveProfile({
            ...onboardingData,
            trialStartedAt: new Date().toISOString(),
          });
        }}
      />
    );
  }

  const day = currentDayData;

  return (
    <div className="min-h-screen" style={{ background: 'var(--app-bg, #000)' }}>
      {currentTheme?.particles && currentTheme.particles !== 'none' && (
        <FloatingParticles type={currentTheme.particles} color={currentTheme.accent} />
      )}
      {/* Main Content (no hero — it disappeared after login) */}
      <div id="main-content" className="max-w-md mx-auto px-5 py-8">

        {/* User header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border border-white/10" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold">
                {user.displayName?.[0] || '?'}
              </div>
            )}
            <div>
              <p className="text-white/80 text-xs font-semibold">{user.displayName || 'Atleta'}</p>
              <p className="text-white/25 text-[10px]">
                {trialActive ? `Prova attiva · ${daysLeft}gg rimasti` : 'Piano attivo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme picker button */}
            <button
              onClick={() => setShowThemePicker(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
              style={{ background: `linear-gradient(135deg, var(--accent-from), var(--accent-to))`, opacity: 0.8 }}
              title="Cambia tema"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
                <line x1="21.17" y1="8" x2="12" y2="8"/>
                <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
                <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
              </svg>
            </button>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-xl glass-light flex items-center justify-center text-white/30 hover:text-white/60 transition-all-smooth active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>

        {/* Gamification */}
        <GamificationBar
          stats={gamification.stats}
          currentLevel={gamification.currentLevel}
          nextLevel={gamification.nextLevel}
          xpProgress={gamification.xpProgress}
          earnedBadges={gamification.earnedBadges}
          allBadges={gamification.allBadges}
          newBadge={gamification.newBadge}
          levelUp={gamification.levelUp}
          workoutQuote={workoutQuote}
        />

        {/* Section label */}
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest text-center mb-5">Programma</p>

        {/* Animated Tabs Section */}
        <div className="mb-8">
          <AnimatedTabs />

          {/* AI Workout Button — trial only */}
          <div className="mt-4">
            {trialActive ? (
              <button
                onClick={() => setShowAIPersonalization(true)}
                className="w-full py-3.5 font-semibold text-sm text-white flex items-center justify-center gap-2.5 active:scale-[0.97] transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                  borderRadius: 'var(--btn-radius, 16px)',
                  boxShadow: '0 0 20px rgba(124,58,237,0.3), 0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/><path d="M9 3.5A9 9 0 0 1 21 12"/></svg>
                Genera Piano AI · {daysLeft}gg rimasti
              </button>
            ) : (
              <div className="glass-light rounded-2xl p-4 text-center border border-white/5">
                <p className="text-white/50 text-xs font-semibold mb-1">Periodo di prova terminato</p>
                <p className="text-white/25 text-[10px] leading-relaxed">
                  Contatta il tuo PT per ricevere un piano personalizzato aggiornato.
                </p>
                <a href="mailto:pt@tacticalstrength.it"
                  className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)' }}>
                  📧 Contatta il PT
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-8 mb-8"></div>

        {/* Day Selector */}
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest text-center mb-4">Seleziona Giorno</p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 justify-center">
          {Object.entries(exercisesData).map(([dayNum, dayData]) => (
            <button
              key={dayNum}
              onClick={() => setCurrentDay(parseInt(dayNum))}
              className={`flex-shrink-0 w-14 h-14 font-medium transition-all-smooth active:scale-95 ${
                currentDay === parseInt(dayNum)
                  ? `${getDayGradient(dayData.color)} text-white`
                  : 'glass-light text-white/40 hover:text-white/70'
              }`}
              style={{
                borderRadius: 'var(--btn-radius, 16px)',
                boxShadow: currentDay === parseInt(dayNum)
                  ? `0 0 16px rgba(var(--glow-rgb), 0.3), 0 6px 18px rgba(0,0,0,0.4)`
                  : 'none',
              }}
            >
              <div className="text-[9px] font-medium opacity-60 leading-none mb-0.5">GG</div>
              <div className="text-base font-bold leading-none">{dayNum}</div>
            </button>
          ))}
        </div>

        {/* Day Card */}
        <div className="glass rounded-[24px] p-5 mb-6 shadow-premium-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${getDayGradient(day.color)}`}></div>
            <span className="text-white/40 text-[11px] font-medium uppercase tracking-wider">{day.title.split(':')[1]}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mb-1.5">{day.title.split(':')[0]}</h2>
          <p className="text-white/30 text-xs leading-relaxed mb-5">{day.objective}</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/50 text-xs font-medium">Esercizi</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/30 text-xs font-medium">
                {day.exercises.filter(ex => completedExercises[ex.id]).length} / {day.exercises.length}
              </span>
            </div>
          </div>
          <ExerciseList
            day={day}
            exercises={day.exercises}
            onExerciseComplete={handleExerciseComplete}
            userLevel={userLevel}
            getLastWorkout={getLastWorkout}
            getNote={getNote}
            saveNote={saveNote}
            getPR={getPR}
            calc1RM={calc1RM}
            checkAndSavePR={checkAndSavePR}
          />
        </div>

        {/* Progress Section */}
        <div className="h-px bg-white/5 mx-8 mb-8 mt-8"></div>
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest text-center mb-5">Progressi</p>
        <ProgressTable workouts={workouts} onDelete={deleteWorkout} />
      </div>

      {/* Bottom safe area */}
      <div className="h-20"></div>

      {/* Theme Picker */}
      {showThemePicker && (
        <ThemePicker
          themes={themes}
          themeId={themeId}
          setTheme={setTheme}
          onClose={() => setShowThemePicker(false)}
        />
      )}

      {/* AI Workout Personalization Modal */}
      {showAIPersonalization && (
        <AIWorkoutPersonalization
          userProfile={profile}
          onClose={() => setShowAIPersonalization(false)}
          onWorkoutGenerated={async (userData) => {
            try {
              await aiWorkout.generateWorkoutPlan(userData);
              setShowAIPersonalization(false);
            } catch (err) {
              console.error('Error generating workout:', err);
            }
          }}
          isLoading={aiWorkout.isLoading}
          error={aiWorkout.error}
          rateLimitInfo={aiWorkout.rateLimitInfo}
        />
      )}
    </div>
  );
};

export default App;
