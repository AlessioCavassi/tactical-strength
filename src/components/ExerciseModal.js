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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-end justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-t-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-premium">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{exercise.name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-medium text-sm">{exercise.setsReps}</span>
                {exercise.recovery > 0 && (
                  <span className="text-gray-500 text-sm">⏱ {exercise.recovery}s recupero</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-white transition-all-smooth"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {exercise.setup && (
            <div className="glass rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                Setup
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{exercise.setup}</p>
            </div>
          )}

          {exercise.execution && (
            <div className="glass rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                Esecuzione
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{exercise.execution}</p>
            </div>
          )}

          {exercise.breathing && (
            <div className="glass rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                Respirazione
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">{exercise.breathing}</p>
            </div>
          )}

          {exercise.error && (
            <div className="glass rounded-2xl p-4 border border-red-500/20">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                Errore da evitare
              </h3>
              <p className="text-red-300 text-sm leading-relaxed">{exercise.error}</p>
            </div>
          )}

          {exercise.recovery > 0 && (
            <div>
              <button
                onClick={startTimer}
                disabled={isTimerRunning}
                className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all-smooth ${
                  isTimerRunning 
                    ? 'bg-gray-800 text-gray-300' 
                    : 'gradient-blue text-white shadow-premium-sm hover:scale-[1.02]'
                }`}
              >
                {isTimerRunning ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
                  </div>
                ) : (
                  `Avvia recupero (${exercise.recovery}s)`
                )}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all-smooth"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all-smooth"
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full gradient-green text-white py-4 px-6 rounded-2xl font-semibold shadow-premium-sm hover:scale-[1.02] transition-all-smooth flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Completa esercizio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
