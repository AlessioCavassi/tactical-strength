import React from 'react';
import ExerciseModal from './ExerciseModal';

const ExerciseList = ({ day, exercises, onExerciseComplete }) => {
  const [selectedExercise, setSelectedExercise] = React.useState(null);

  const getColorClasses = (color) => {
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

  return (
    <div className="space-y-3">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setSelectedExercise(exercise)}
            className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{exercise.name}</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-blue-600 font-medium">{exercise.setsReps}</span>
                  {exercise.recovery > 0 && (
                    <span className="text-gray-600">Recupero: {exercise.recovery} sec</span>
                  )}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full ${getColorClasses(day.color)} flex items-center justify-center text-white text-sm font-bold`}>
                →
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
