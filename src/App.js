import React, { useState } from 'react';
import { exercisesData } from './data/exercises';
import ExerciseList from './components/ExerciseList';
import HeroFuturistic from './components/ui/hero-futuristic';
import { AnimatedTabs } from './components/ui/animated-tabs';
import ProgressTable from './components/ProgressTable';

const App = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedExercises, setCompletedExercises] = useState({});

  const handleExerciseComplete = (exerciseId, weight, reps) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: { weight, reps, completedAt: new Date().toISOString() }
    }));
  };

  const getDayGradient = (color) => {
    switch (color) {
      case 'green':
        return 'gradient-green';
      case 'blue':
        return 'gradient-blue';
      case 'yellow':
        return 'gradient-yellow';
      case 'red':
        return 'gradient-red';
      case 'orange':
        return 'gradient-orange';
      default:
        return 'gradient-blue';
    }
  };

  const day = exercisesData[currentDay];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <HeroFuturistic />

      {/* Main Content */}
      <div id="main-content" className="max-w-md mx-auto px-5 py-10">
        {/* Section label */}
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest text-center mb-6">Programma</p>

        {/* Animated Tabs Section */}
        <div className="mb-10">
          <AnimatedTabs />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-8 mb-10"></div>

        {/* Day Selector */}
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest text-center mb-5">Seleziona Giorno</p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 justify-center">
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
          />
        </div>

        {/* Progress Table Section */}
        <div className="h-px bg-white/5 mx-8 mb-10 mt-10"></div>
        <div className="mb-10">
          <ProgressTable />
        </div>

        {/* Today's Progress */}
        {Object.keys(completedExercises).length > 0 && (
          <div className="glass rounded-[24px] p-5 shadow-premium-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Oggi</span>
            </div>
            <div className="space-y-3">
              {day.exercises
                .filter(ex => completedExercises[ex.id])
                .map(ex => {
                  const completion = completedExercises[ex.id];
                  return (
                    <div key={ex.id} className="flex justify-between items-center">
                      <span className="text-white/60 text-xs font-medium">{ex.name}</span>
                      <div className="flex gap-3">
                        <span className="text-blue-400/80 text-xs font-semibold">{completion.weight || 0} kg</span>
                        <span className="text-green-400/80 text-xs font-semibold">{completion.reps || 0} reps</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-8"></div>
    </div>
  );
};

export default App;
