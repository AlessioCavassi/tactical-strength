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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-end sm:items-center justify-center z-50">
      <div className="glass-heavy rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-premium">
        {/* iOS-style drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-white/30"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 glass-heavy px-6 py-5 border-b border-white/5 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-lg font-bold text-white tracking-tight">{exercise.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-blue-400 font-medium text-xs">{exercise.setsReps}</span>
                {exercise.recovery > 0 && (
                  <span className="text-white/30 text-xs">⏱ {exercise.recovery}s</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all-smooth"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {exercise.setup && (
            <div className="glass-light rounded-2xl p-4">
              <h3 className="text-white/90 text-sm font-semibold mb-1.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                Setup
              </h3>
              <p className="text-white/50 text-xs leading-relaxed pl-7">{exercise.setup}</p>
            </div>
          )}

          {exercise.execution && (
            <div className="glass-light rounded-2xl p-4">
              <h3 className="text-white/90 text-sm font-semibold mb-1.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                Esecuzione
              </h3>
              <p className="text-white/50 text-xs leading-relaxed whitespace-pre-line pl-7">{exercise.execution}</p>
            </div>
          )}

          {exercise.breathing && (
            <div className="glass-light rounded-2xl p-4">
              <h3 className="text-white/90 text-sm font-semibold mb-1.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                Respirazione
              </h3>
              <p className="text-white/50 text-xs leading-relaxed pl-7">{exercise.breathing}</p>
            </div>
          )}

          {exercise.error && (
            <div className="glass-light rounded-2xl p-4 border border-red-500/10">
              <h3 className="text-red-400/90 text-sm font-semibold mb-1.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                Errore da evitare
              </h3>
              <p className="text-red-400/60 text-xs leading-relaxed pl-7">{exercise.error}</p>
            </div>
          )}

          {/* Timer */}
          {exercise.recovery > 0 && (
            <button
              onClick={startTimer}
              disabled={isTimerRunning}
              className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all-smooth ${
                isTimerRunning 
                  ? 'glass-light text-white/60' 
                  : 'gradient-blue text-white shadow-premium-sm active:scale-[0.97]'
              }`}
            >
              {isTimerRunning ? (
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-lg font-mono tracking-wider">{formatTime(timeLeft)}</span>
                </div>
              ) : (
                `Avvia recupero · ${exercise.recovery}s`
              )}
            </button>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/30 text-xs font-medium mb-1.5 pl-1">
                Peso (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 glass-light rounded-xl text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all-smooth placeholder-white/20"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-white/30 text-xs font-medium mb-1.5 pl-1">
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="w-full px-4 py-3 glass-light rounded-xl text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all-smooth placeholder-white/20"
                placeholder="—"
              />
            </div>
          </div>

          {/* Complete button */}
          <button
            onClick={handleComplete}
            className="w-full gradient-green text-white py-3.5 px-6 rounded-2xl font-semibold text-sm shadow-premium-sm active:scale-[0.97] transition-all-smooth flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Completato
          </button>

          {/* Bottom safe area */}
          <div className="h-2 sm:h-0"></div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
