import React, { useState } from 'react';
import { exercisesData } from './data/exercises';
import ExerciseList from './components/ExerciseList';
import HeroFuturistic from './components/ui/hero-futuristic.js';
import { AnimatedTabs } from './components/ui/animated-tabs';
import ProgressTable from './components/ProgressTable';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import { useAuth } from './hooks/useAuth';
import { useWorkouts } from './hooks/useWorkouts';
import { useUserProfile } from './hooks/useUserProfile';
import { useExerciseNotes } from './hooks/useExerciseNotes';
import { useExerciseHistory } from './hooks/useExerciseHistory';

const App = () => {
  const { user, loading, logout } = useAuth();
  const { profile, loading: profileLoading, saveProfile, needsOnboarding } = useUserProfile(user?.uid);
  const [currentDay, setCurrentDay] = useState(1);
  const [completedExercises, setCompletedExercises] = useState({});
  const { workouts, saveWorkout, deleteWorkout } = useWorkouts(user?.uid);
  const { getNote, saveNote } = useExerciseNotes(user?.uid);
  const { getLastWorkout, getPR, calc1RM, checkAndSavePR } = useExerciseHistory(user?.uid);

  const userLevel = profile?.level || 'beginner';
  const currentDayData = exercisesData[currentDay];

  const handleExerciseComplete = async (exerciseId, weight, reps) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: { weight, reps, completedAt: new Date().toISOString() }
    }));

    // Save to Firebase if logged in
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

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (needsOnboarding) {
    return (
      <OnboardingScreen
        user={user}
        onComplete={async (onboardingData) => {
          await saveProfile(onboardingData);
        }}
      />
    );
  }

  const day = currentDayData;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <HeroFuturistic />

      {/* Main Content */}
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
              <p className="text-white/25 text-[10px]">Benvenuto</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-8 h-8 rounded-xl glass-light flex items-center justify-center text-white/30 hover:text-white/60 transition-all-smooth active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>

        {/* Section label */}
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest text-center mb-5">Programma</p>

        {/* Animated Tabs Section */}
        <div className="mb-8">
          <AnimatedTabs />
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
              className={`flex-shrink-0 w-14 h-14 rounded-2xl font-medium transition-all-smooth active:scale-95 ${
                currentDay === parseInt(dayNum)
                  ? `${getDayGradient(dayData.color)} text-white shadow-premium-sm`
                  : 'glass-light text-white/40 hover:text-white/70'
              }`}
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
          
          {/* Exercise count */}
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
    </div>
  );
};

export default App;
