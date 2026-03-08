import React, { useState, useEffect } from 'react';

const ExerciseModal = ({ exercise, onClose, onComplete }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => {
    setTimeLeft(exercise.recovery);
    setIsTimerRunning(true);
  };

  const handleComplete = () => {
    onComplete(exercise.id, weight, reps);
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">{exercise.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <span className="text-sm font-semibold text-blue-600">{exercise.setsReps}</span>
            {exercise.recovery > 0 && (
              <span className="text-sm text-gray-600 ml-2">Recupero: {exercise.recovery} sec</span>
            )}
          </div>

          {exercise.setup && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">Setup</h3>
              <p className="text-sm text-gray-600">{exercise.setup}</p>
            </div>
          )}

          {exercise.execution && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">Esecuzione</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{exercise.execution}</p>
            </div>
          )}

          {exercise.breathing && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">Respirazione</h3>
              <p className="text-sm text-gray-600">{exercise.breathing}</p>
            </div>
          )}

          {exercise.error && (
            <div className="mb-4">
              <h3 className="font-semibold text-red-600 mb-1">Errore da evitare</h3>
              <p className="text-sm text-red-600">{exercise.error}</p>
            </div>
          )}

          {exercise.recovery > 0 && (
            <div className="mb-6">
              <button
                onClick={startTimer}
                disabled={isTimerRunning}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isTimerRunning ? `Recupero: ${formatTime(timeLeft)}` : `Avvia timer (${exercise.recovery} sec)`}
              </button>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso usato (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reps fatte
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Fatto ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
