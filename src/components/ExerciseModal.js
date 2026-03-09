import React, { useState, useEffect, useMemo } from 'react';

const BEGINNER_TIPS = [
  "💡 Non avere fretta: la tecnica viene prima del peso!",
  "💡 Se senti dolore, fermati. Fastidio muscolare è ok, dolore articolare no.",
  "💡 Conta i secondi nella fase eccentrica (scendere): lento è meglio!",
  "💡 Concentrati sulla connessione mente-muscolo.",
  "💡 Bevi acqua tra un set e l'altro.",
  "💡 Il riscaldamento non è opzionale, protegge le articolazioni.",
  "💡 Meglio un peso leggero con tecnica perfetta che uno pesante fatto male.",
];

const DIFFICULTY_MAP = {
  easy: { label: 'Facile', color: 'text-green-400', bg: 'bg-green-500/15' },
  medium: { label: 'Medio', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  hard: { label: 'Difficile', color: 'text-red-400', bg: 'bg-red-500/15' },
};

const ExerciseModal = ({
  exercise, onClose, onComplete, userLevel = 'beginner',
  noteText = '', onSaveNote, lastWorkout, exercisePR, calc1RM, onCheckPR,
}) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [note, setNote] = useState(noteText);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newPR, setNewPR] = useState(null);
  const [rpe, setRpe] = useState(0);
  const [expandedSections, setExpandedSections] = useState(
    userLevel === 'beginner' ? { setup: true, execution: true, breathing: true, error: true }
    : userLevel === 'intermediate' ? { execution: true }
    : {}
  );

  const isBeginner = userLevel === 'beginner';
  const isIntermediate = userLevel === 'intermediate';
  const isAdvanced = userLevel === 'advanced';
  const totalSets = parseInt(exercise.setsReps) || 4;
  const randomTip = useMemo(() => BEGINNER_TIPS[Math.floor(Math.random() * BEGINNER_TIPS.length)], []);
  const diff = DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.medium;

  // 1RM estimate
  const estimated1RM = useMemo(() => {
    if (calc1RM && weight && reps) return calc1RM(weight, reps);
    return 0;
  }, [calc1RM, weight, reps]);

  // Overload comparison
  const overloadStatus = useMemo(() => {
    if (!lastWorkout || !weight || !reps) return null;
    const lastVol = (Number(lastWorkout.weight) || 0) * (Number(lastWorkout.reps) || 1);
    const currVol = (Number(weight) || 0) * (Number(reps) || 1);
    if (currVol > lastVol) return 'up';
    if (currVol < lastVol) return 'down';
    return 'same';
  }, [lastWorkout, weight, reps]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (currentSet < totalSets) setCurrentSet(s => s + 1);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, currentSet, totalSets]);

  const startTimer = () => { setTimeLeft(exercise.recovery); setIsTimerRunning(true); };

  const handleComplete = async () => {
    // Check for PR
    if (onCheckPR && weight && reps) {
      const prResult = await onCheckPR(exercise.id, weight, reps, exercise.name);
      if (prResult) {
        setNewPR(prResult);
        setTimeout(() => { onComplete(exercise.id, weight, reps); onClose(); }, 1800);
        return;
      }
    }
    // Save note
    if (onSaveNote && note !== noteText) onSaveNote(exercise.id, note);
    onComplete(exercise.id, weight, reps);
    onClose();
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const toggleSection = (key) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  if (!exercise) return null;

  // PR celebration overlay
  if (newPR) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50">
        <div className="text-center px-8">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-black text-white mb-2">NUOVO PR!</h2>
          <p className="text-white/60 text-sm mb-1">{exercise.name}</p>
          <p className="text-3xl font-black text-yellow-400 mb-1">{estimated1RM} kg</p>
          <p className="text-white/30 text-xs">1RM stimato (Epley)</p>
          {newPR.previousBest > 0 && (
            <p className="text-green-400 text-sm font-semibold mt-3">+{estimated1RM - newPR.previousBest} kg dal record precedente</p>
          )}
        </div>
      </div>
    );
  }

  const SectionCard = ({ id, icon, iconBg, iconColor, title, content, borderColor }) => {
    const isOpen = expandedSections[id];
    if (!content || isAdvanced) return null;
    return (
      <div className={`glass-light rounded-2xl overflow-hidden ${borderColor || ''}`}>
        <button onClick={() => toggleSection(id)} className="w-full text-left p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center`}>{icon}</div>
            <span className={`text-sm font-semibold ${iconColor || 'text-white/90'}`}>{title}</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {isOpen && <div className="px-3.5 pb-3.5 pt-0"><p className={`text-xs leading-relaxed whitespace-pre-line pl-7 ${id === 'error' ? 'text-red-400/60' : 'text-white/50'}`}>{content}</p></div>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-end sm:items-center justify-center z-50">
      <div className="glass-heavy rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-premium">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-9 h-1 rounded-full bg-white/30" /></div>

        {/* Header */}
        <div className="sticky top-0 glass-heavy px-5 py-4 border-b border-white/5 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-3">
              <h2 className={`font-bold text-white tracking-tight ${isAdvanced ? 'text-sm' : 'text-base'}`}>{exercise.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-blue-400 font-medium text-xs">{exercise.setsReps}</span>
                {exercise.recovery > 0 && <span className="text-white/25 text-[10px]">⏱{exercise.recovery}s</span>}
                <span className={`${diff.bg} ${diff.color} text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase`}>{diff.label}</span>
                <span className="text-white/15 text-[10px]">Set {currentSet}/{totalSets}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 active:scale-90 transition-transform">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1 mt-3">{Array.from({length: totalSets}, (_,i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < currentSet ? 'gradient-green' : 'bg-white/8'}`}/>)}</div>
        </div>

        <div className={`px-5 space-y-3 ${isAdvanced ? 'py-3' : 'py-4'}`}>

          {/* ===== BEGINNER: Muscle groups + suggested weight + video + tip ===== */}
          {isBeginner && (
            <>
              {/* Tip */}
              <div className="bg-blue-500/8 rounded-xl p-2.5 border border-blue-500/10">
                <p className="text-blue-400/70 text-[11px] leading-relaxed">{randomTip}</p>
              </div>

              {/* Muscles + Difficulty + Suggested weight */}
              <div className="flex flex-wrap gap-1.5">
                {exercise.muscleGroups?.map(m => (
                  <span key={m} className="bg-purple-500/10 text-purple-400/80 text-[9px] font-semibold px-2 py-1 rounded-lg">{m}</span>
                ))}
              </div>

              {exercise.suggestedWeight && (
                <div className="glass-light rounded-xl p-3 flex items-center gap-2">
                  <span className="text-lg">⚖️</span>
                  <div>
                    <p className="text-white/40 text-[9px] font-semibold uppercase tracking-wider">Peso suggerito</p>
                    <p className="text-white/80 text-xs font-bold">{exercise.suggestedWeight}</p>
                  </div>
                </div>
              )}

              {/* Video button */}
              {exercise.videoUrl && (
                <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 glass-light rounded-xl p-3 active:scale-[0.98] transition-transform">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-semibold">Guarda il video esecuzione</p>
                    <p className="text-white/30 text-[9px]">YouTube · Come eseguire correttamente</p>
                  </div>
                </a>
              )}
            </>
          )}

          {/* ===== INTERMEDIATE: Last workout + overload ===== */}
          {isIntermediate && lastWorkout && (
            <div className="glass-light rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-white/30 text-[9px] font-semibold uppercase tracking-wider">Ultima volta</p>
                <p className="text-white/70 text-sm font-bold">{lastWorkout.weight} kg × {lastWorkout.reps} reps</p>
              </div>
              {exercisePR && (
                <div className="text-right">
                  <p className="text-white/30 text-[9px] font-semibold uppercase tracking-wider">PR</p>
                  <p className="text-yellow-400/80 text-sm font-bold">{exercisePR.estimated1RM} kg</p>
                </div>
              )}
            </div>
          )}

          {/* ===== INTERMEDIATE: Video compact ===== */}
          {isIntermediate && exercise.videoUrl && (
            <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors text-[10px]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-red-400/50"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Video esecuzione
            </a>
          )}

          {/* ===== ADVANCED: Compact last + PR + 1RM inline ===== */}
          {isAdvanced && (
            <div className="flex gap-2">
              {lastWorkout && (
                <div className="glass-light rounded-xl p-2.5 flex-1 text-center">
                  <p className="text-white/20 text-[8px] font-bold uppercase">Precedente</p>
                  <p className="text-white/60 text-xs font-bold">{lastWorkout.weight}×{lastWorkout.reps}</p>
                </div>
              )}
              {exercisePR && (
                <div className="glass-light rounded-xl p-2.5 flex-1 text-center">
                  <p className="text-white/20 text-[8px] font-bold uppercase">PR 1RM</p>
                  <p className="text-yellow-400/70 text-xs font-bold">{exercisePR.estimated1RM}kg</p>
                </div>
              )}
            </div>
          )}

          {/* Sections (beginner: open, intermediate: collapsible, advanced: hidden) */}
          <SectionCard id="setup" iconBg="bg-blue-500/20" title={isBeginner ? "📋 Come posizionarti" : "Setup"} content={exercise.setup}
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-blue-400"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
          <SectionCard id="execution" iconBg="bg-green-500/20" title={isBeginner ? "🎯 Come eseguirlo" : "Esecuzione"} content={exercise.execution}
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-green-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
          <SectionCard id="breathing" iconBg="bg-purple-500/20" title={isBeginner ? "🫁 Respirazione" : "Respirazione"} content={exercise.breathing}
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-purple-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
          <SectionCard id="error" iconBg="bg-red-500/20" iconColor="text-red-400/90" borderColor="border-red-500/10" title={isBeginner ? "⚠️ Errore comune" : "Errore da evitare"} content={exercise.error}
            icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />

          {/* Timer */}
          {exercise.recovery > 0 && (
            <button onClick={startTimer} disabled={isTimerRunning}
              className={`w-full py-3 px-5 rounded-2xl font-semibold text-sm transition-all-smooth ${isTimerRunning ? 'glass-light text-white/60' : 'gradient-blue text-white shadow-premium-sm active:scale-[0.97]'}`}>
              {isTimerRunning ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-lg font-mono tracking-wider">{formatTime(timeLeft)}</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {isBeginner ? `Recupera ${exercise.recovery}s` : `Recupero · ${exercise.recovery}s`}
                </span>
              )}
            </button>
          )}

          {/* Inputs + overload indicator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/30 text-[10px] font-medium mb-1 pl-1">{isBeginner ? 'Peso usato (kg)' : 'Peso (kg)'}</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                className="w-full px-3 py-2.5 glass-light rounded-xl text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all-smooth placeholder-white/20" placeholder="—" />
            </div>
            <div>
              <label className="block text-white/30 text-[10px] font-medium mb-1 pl-1">{isBeginner ? 'Ripetizioni' : 'Reps'}</label>
              <input type="number" value={reps} onChange={e => setReps(e.target.value)}
                className="w-full px-3 py-2.5 glass-light rounded-xl text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all-smooth placeholder-white/20" placeholder="—" />
            </div>
          </div>

          {/* Overload indicator (intermediate + advanced) */}
          {!isBeginner && overloadStatus && (
            <div className={`text-center text-[11px] font-semibold ${overloadStatus === 'up' ? 'text-green-400' : overloadStatus === 'down' ? 'text-red-400' : 'text-white/30'}`}>
              {overloadStatus === 'up' && '↑ Volume superiore alla scorsa volta!'}
              {overloadStatus === 'down' && '↓ Volume inferiore alla scorsa volta'}
              {overloadStatus === 'same' && '= Stesso volume della scorsa volta'}
            </div>
          )}

          {/* 1RM estimate (intermediate + advanced) */}
          {!isBeginner && estimated1RM > 0 && (
            <div className="text-center">
              <span className="text-white/20 text-[9px] uppercase tracking-wider font-semibold">1RM stimato: </span>
              <span className="text-white/50 text-xs font-bold">{estimated1RM} kg</span>
            </div>
          )}

          {/* RPE selector (advanced only) */}
          {isAdvanced && (
            <div>
              <p className="text-white/20 text-[9px] font-semibold uppercase tracking-wider mb-1.5 text-center">RPE (sforzo percepito)</p>
              <div className="flex gap-1 justify-center">
                {[6,7,8,9,10].map(v => (
                  <button key={v} onClick={() => setRpe(v)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all active:scale-90 ${rpe === v ? 'gradient-blue text-white' : 'glass-light text-white/30'}`}>{v}</button>
                ))}
              </div>
            </div>
          )}

          {/* Notes (beginner: full, intermediate: compact toggle, advanced: hidden unless toggled) */}
          {!isAdvanced && (
            <div>
              {showNoteInput || note ? (
                <div>
                  <label className="block text-white/30 text-[10px] font-medium mb-1 pl-1">{isBeginner ? '📝 I tuoi appunti' : 'Note'}</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={isBeginner ? "Es: La prossima volta provo con 12kg..." : "Note..."}
                    className="w-full px-3 py-2 glass-light rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all-smooth placeholder-white/15 resize-none" />
                </div>
              ) : (
                <button onClick={() => setShowNoteInput(true)} className="text-white/20 text-[10px] flex items-center gap-1 hover:text-white/40 transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  {noteText ? 'Modifica nota' : 'Aggiungi nota'}
                </button>
              )}
            </div>
          )}

          {/* Beginner encouragement */}
          {isBeginner && weight && reps && (
            <div className="text-center py-0.5"><p className="text-green-400/60 text-[11px]">🎉 Ottimo lavoro!</p></div>
          )}

          {/* Complete button */}
          <button onClick={handleComplete}
            className="w-full gradient-green text-white py-3.5 px-6 rounded-2xl font-semibold text-sm shadow-premium-sm active:scale-[0.97] transition-all-smooth flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            {isBeginner ? 'Completato! 💪' : 'Completato'}
          </button>

          <div className="h-2 sm:h-0" />
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
