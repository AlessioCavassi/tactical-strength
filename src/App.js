import React, { useState } from 'react';
import { exercisesData } from './data/exercises';
import ExerciseList from './components/ExerciseList';

const App = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedExercises, setCompletedExercises] = useState({});

  const handleExerciseComplete = (exerciseId, weight, reps) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: { weight, reps, completedAt: new Date().toISOString() }
    }));
  };

  const getDayColorClasses = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getDayButtonColor = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 hover:bg-green-600';
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'yellow':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'red':
        return 'bg-red-500 hover:bg-red-600';
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const day = exercisesData[currentDay];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 text-center">TACTICAL STRENGTH</h1>
          <p className="text-center text-gray-600 text-sm mt-1">La tua scheda di allenamento digitale</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {Object.entries(exercisesData).map(([dayNum, dayData]) => (
            <button
              key={dayNum}
              onClick={() => setCurrentDay(parseInt(dayNum))}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentDay === parseInt(dayNum)
                  ? `${getDayButtonColor(dayData.color)} text-white`
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {dayData.title.split(':')[0]}
            </button>
          ))}
        </div>

        <div className={`rounded-lg border-2 p-6 mb-6 ${getDayColorClasses(day.color)}`}>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{day.title}</h2>
          <p className="text-gray-700 font-medium mb-4">Obiettivo: {day.objective}</p>
          
          <div className="bg-white bg-opacity-70 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                Esercizi ({day.exercises.length})
              </h3>
              <div className="text-sm text-gray-600">
                Completati: {day.exercises.filter(ex => completedExercises[ex.id]).length}/{day.exercises.length}
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
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Progressi di oggi</h3>
            <div className="space-y-2">
              {day.exercises
                .filter(ex => completedExercises[ex.id])
                .map(ex => {
                  const completion = completedExercises[ex.id];
                  return (
                    <div key={ex.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{ex.name}</span>
                      <div className="flex gap-4">
                        <span className="text-blue-600">{completion.weight || 0} kg</span>
                        <span className="text-green-600">{completion.reps || 0} reps</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
