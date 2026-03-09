import React from 'react';
import ExerciseModal from './ExerciseModal';

const ExerciseList = ({ day, exercises, onExerciseComplete, userLevel = 'beginner' }) => {
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
    <div className="space-y-2">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          className="glass-light rounded-2xl overflow-hidden transition-all-smooth active:scale-[0.98] hover:bg-white/[0.07]"
        >
          <button
            onClick={() => setSelectedExercise(exercise)}
            className="w-full text-left p-3.5 focus:outline-none"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-9 h-9 rounded-xl ${getDayGradient(day.color)} flex items-center justify-center text-white font-bold text-xs shadow-premium-sm`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white/90 font-semibold text-sm truncate">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-2 text-[11px] mt-0.5">
                    <span className="text-blue-400/80 font-medium">{exercise.setsReps}</span>
                    {exercise.recovery > 0 && (
                      <span className="text-white/20">⏱ {exercise.recovery}s</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-white/20 ml-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          userLevel={userLevel}
        />
      )}
    </div>
  );
};

export default ExerciseList;
