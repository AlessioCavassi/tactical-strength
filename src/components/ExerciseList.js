import React from 'react';
import ExerciseModal from './ExerciseModal';

const DIFF_ICONS = {
  easy: { color: 'text-green-400', bg: 'bg-green-500/15', label: '🟢' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/15', label: '🟡' },
  hard: { color: 'text-red-400', bg: 'bg-red-500/15', label: '🔴' },
};

const ExerciseList = ({
  day, exercises, onExerciseComplete, userLevel = 'beginner',
  getLastWorkout, getNote, saveNote, getPR, calc1RM, checkAndSavePR,
}) => {
  const [selectedExercise, setSelectedExercise] = React.useState(null);

  const isBeginner = userLevel === 'beginner';
  const isAdvanced = userLevel === 'advanced';

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

  return (
    <div className={`space-y-${isAdvanced ? '1' : '2'}`}>
      {exercises.map((exercise, index) => {
        const lastW = getLastWorkout ? getLastWorkout(exercise.id) : null;
        const pr = getPR ? getPR(exercise.id) : null;
        const diff = DIFF_ICONS[exercise.difficulty] || DIFF_ICONS.medium;

        return (
          <div
            key={exercise.id}
            className={`glass-light overflow-hidden transition-all-smooth active:scale-[0.98] hover:bg-white/[0.07] ${isAdvanced ? 'rounded-xl' : 'rounded-2xl'}`}
          >
            <button
              onClick={() => setSelectedExercise(exercise)}
              className={`w-full text-left focus:outline-none ${isAdvanced ? 'p-2.5' : 'p-3.5'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`${isAdvanced ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'} rounded-xl ${getDayGradient(day.color)} flex items-center justify-center text-white font-bold shadow-premium-sm`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className={`text-white/90 font-semibold truncate ${isAdvanced ? 'text-xs' : 'text-sm'}`}>{exercise.name}</h3>
                      {isBeginner && exercise.videoUrl && (
                        <span className="text-red-400/50 flex-shrink-0" title="Video disponibile">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] mt-0.5">
                      <span className="text-blue-400/80 font-medium">{exercise.setsReps}</span>
                      {exercise.recovery > 0 && <span className="text-white/20">⏱{exercise.recovery}s</span>}

                      {/* Beginner: difficulty + muscle preview */}
                      {isBeginner && (
                        <span className="text-[9px]">{diff.label}</span>
                      )}

                      {/* Intermediate/Advanced: last weight */}
                      {!isBeginner && lastW && (
                        <span className="text-white/25 text-[10px]">{lastW.weight}kg×{lastW.reps}</span>
                      )}

                      {/* Advanced: PR badge */}
                      {isAdvanced && pr && (
                        <span className="text-yellow-400/40 text-[9px] font-bold">PR:{pr.estimated1RM}kg</span>
                      )}
                    </div>

                    {/* Beginner: muscle tags */}
                    {isBeginner && exercise.muscleGroups?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exercise.muscleGroups.slice(0, 3).map(m => (
                          <span key={m} className="bg-purple-500/8 text-purple-400/50 text-[8px] font-medium px-1.5 py-0.5 rounded">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-white/20 ml-2">
                  <svg width={isAdvanced ? "12" : "16"} height={isAdvanced ? "12" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        );
      })}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onComplete={onExerciseComplete}
          userLevel={userLevel}
          noteText={getNote ? getNote(selectedExercise.id) : ''}
          onSaveNote={saveNote}
          lastWorkout={getLastWorkout ? getLastWorkout(selectedExercise.id) : null}
          exercisePR={getPR ? getPR(selectedExercise.id) : null}
          calc1RM={calc1RM}
          onCheckPR={checkAndSavePR}
        />
      )}
    </div>
  );
};

export default ExerciseList;
