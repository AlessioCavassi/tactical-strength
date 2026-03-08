import React, { useState } from 'react';
import { exercisesData } from './data/exercises';
import ExerciseList from './components/ExerciseList';
import HeroFuturistic from './components/ui/hero-futuristic';

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
      <div id="main-content" className="max-w-md mx-auto px-6 py-12">
        {/* Day Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
          {Object.entries(exercisesData).map(([dayNum, dayData]) => (
            <button
              key={dayNum}
              onClick={() => setCurrentDay(parseInt(dayNum))}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl font-medium transition-all-smooth ${
                currentDay === parseInt(dayNum)
                  ? `${getDayGradient(dayData.color)} text-white shadow-premium-sm scale-105`
                  : 'glass text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-light opacity-80">Giorno</div>
              <div className="text-lg font-semibold">{dayNum}</div>
            </button>
          ))}
        </div>

        <div className={`glass rounded-3xl p-6 mb-6 shadow-premium-sm`}>
          <div className={`inline-block px-3 py-1 rounded-full ${getDayGradient(day.color)} text-white text-xs font-medium mb-4`}>
            {day.title.split(':')[1]}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">{day.title.split(':')[0]}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{day.objective}</p>
          
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                Esercizi
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">
                  {day.exercises.filter(ex => completedExercises[ex.id]).length}/{day.exercises.length}
                </span>
              </div>
            </div>
            
            <ExerciseList
              day={day}
              exercises={day.exercises}
              onExerciseComplete={handleExerciseComplete}
            />
          </div>
        </div>

        {Object.keys(completedExercises).length > 0 && (
          <div className="glass rounded-3xl p-6 shadow-premium-sm mb-8">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Progressi di oggi
            </h3>
            <div className="space-y-3">
              {day.exercises
                .filter(ex => completedExercises[ex.id])
                .map(ex => {
                  const completion = completedExercises[ex.id];
                  return (
                    <div key={ex.id} className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm font-medium">{ex.name}</span>
                      <div className="flex gap-4">
                        <span className="text-blue-400 text-sm font-medium">{completion.weight || 0} kg</span>
                        <span className="text-green-400 text-sm font-medium">{completion.reps || 0} reps</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20"></div>
    </div>
  );
};

export default App;
