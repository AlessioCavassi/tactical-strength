import React, { useState, useEffect } from 'react';

const BEGINNER_TIPS = [
  "💡 Non avere fretta: la tecnica viene prima del peso!",
  "💡 Se senti dolore, fermati. Fastidio muscolare è ok, dolore articolare no.",
  "💡 Conta i secondi nella fase eccentrica (scendere): lento è meglio!",
  "💡 Concentrati sulla connessione mente-muscolo.",
  "💡 Bevi acqua tra un set e l'altro.",
];

const ExerciseModal = ({ exercise, onClose, onComplete, userLevel = 'beginner' }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [expandedSections, setExpandedSections] = useState(
    userLevel === 'beginner' ? { setup: true, execution: true, breathing: true, error: true }
    : userLevel === 'intermediate' ? { execution: true }
    : {}
  );

  const isBeginner = userLevel === 'beginner';
  const isAdvanced = userLevel === 'advanced';
  const totalSets = parseInt(exercise.setsReps) || 4;
  const randomTip = BEGINNER_TIPS[Math.floor(Math.random() * BEGINNER_TIPS.length)];

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (currentSet < totalSets) {
        setCurrentSet(s => s + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, currentSet, totalSets]);

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

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!exercise) return null;

  const SectionCard = ({ id, icon, iconColor, iconBg, title, content, borderColor }) => {
    const isOpen = expandedSections[id];
    if (!content) return null;
    
    // Advanced users: hide all explanations
    if (isAdvanced) return null;

    return (
      <div className={`glass-light rounded-2xl overflow-hidden ${borderColor || ''}`}>
        <button
          onClick={() => toggleSection(id)}
          className="w-full text-left p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center`}>
              {icon}
            </div>
            <span className={`text-sm font-semibold ${iconColor || 'text-white/90'}`}>{title}</span>
          </div>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className={`text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {isOpen && (
          <div className="px-4 pb-4 pt-0">
            <p className={`text-xs leading-relaxed whitespace-pre-line pl-7 ${id === 'error' ? 'text-red-400/60' : 'text-white/50'}`}>{content}</p>
          </div>
        )}
      </div>
    );
  };

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
              <h2 className={`font-bold text-white tracking-tight ${isAdvanced ? 'text-base' : 'text-lg'}`}>{exercise.name}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-blue-400 font-medium text-xs">{exercise.setsReps}</span>
                {exercise.recovery > 0 && (
                  <span className="text-white/30 text-xs">⏱ {exercise.recovery}s</span>
                )}
                {/* Set tracker */}
                <span className="text-white/20 text-[10px] font-semibold uppercase tracking-wider">Set {currentSet}/{totalSets}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all-smooth"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Set progress dots */}
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: totalSets }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i < currentSet ? 'gradient-green' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        <div className={`px-6 space-y-3 ${isAdvanced ? 'py-4' : 'py-5'}`}>
          {/* Beginner: motivational tip */}
          {isBeginner && (
            <div className="bg-blue-500/8 rounded-2xl p-3 border border-blue-500/10">
              <p className="text-blue-400/70 text-[11px] leading-relaxed">{randomTip}</p>
            </div>
          )}

          {/* Exercise detail sections */}
          <SectionCard
            id="setup"
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-blue-400"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            iconBg="bg-blue-500/20"
            title={isBeginner ? "📋 Come posizionarti" : "Setup"}
            content={exercise.setup}
          />

          <SectionCard
            id="execution"
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
            iconBg="bg-green-500/20"
            title={isBeginner ? "🎯 Come eseguirlo" : "Esecuzione"}
            content={exercise.execution}
          />

          <SectionCard
            id="breathing"
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-purple-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
            iconBg="bg-purple-500/20"
            title={isBeginner ? "🫁 Respirazione" : "Respirazione"}
            content={exercise.breathing}
          />

          <SectionCard
            id="error"
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            iconBg="bg-red-500/20"
            iconColor="text-red-400/90"
            title={isBeginner ? "⚠️ Errore comune" : "Errore da evitare"}
            content={exercise.error}
            borderColor="border-red-500/10"
          />

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
                  {isBeginner && <span className="text-white/30 text-xs ml-2">Riposa...</span>}
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {isBeginner ? `Recupera ${exercise.recovery}s prima del prossimo set` : `Recupero · ${exercise.recovery}s`}
                </span>
              )}
            </button>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/30 text-xs font-medium mb-1.5 pl-1">
                {isBeginner ? 'Peso usato (kg)' : 'Peso (kg)'}
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
                {isBeginner ? 'Ripetizioni fatte' : 'Reps'}
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

          {/* Beginner encouragement */}
          {isBeginner && weight && reps && (
            <div className="text-center py-1">
              <p className="text-green-400/60 text-[11px]">🎉 Ottimo lavoro! Registra e passa al prossimo set.</p>
            </div>
          )}

          {/* Complete button */}
          <button
            onClick={handleComplete}
            className="w-full gradient-green text-white py-3.5 px-6 rounded-2xl font-semibold text-sm shadow-premium-sm active:scale-[0.97] transition-all-smooth flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {isBeginner ? 'Esercizio completato! 💪' : 'Completato'}
          </button>

          {/* Bottom safe area */}
          <div className="h-2 sm:h-0"></div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
