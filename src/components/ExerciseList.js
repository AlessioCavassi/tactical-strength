import React from 'react';
import ExerciseModal from './ExerciseModal';

const ExerciseList = ({ day, exercises, onExerciseComplete }) => {
  const [selectedExercise, setSelectedExercise] = React.useState(null);

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

  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          className="glass rounded-2xl overflow-hidden transition-all-smooth hover:bg-white/10"
        >
          <button
            onClick={() => setSelectedExercise(exercise)}
            className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-inset"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-xl ${getDayGradient(day.color)} flex items-center justify-center text-white font-bold text-sm shadow-premium-sm`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-blue-400 font-medium">{exercise.setsReps}</span>
                    {exercise.recovery > 0 && (
                      <span className="text-gray-500">⏱ {exercise.recovery}s</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-gray-400 transition-all-smooth group-hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </button>
        </div>
      ))}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onComplete={onExerciseComplete}
        />
      )}
    </div>
  );
};

export default ExerciseList;
