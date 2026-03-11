import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ── Exercise type detection ──────────────────────────────────────────────────
// standard   → weight (kg) + reps
// bodyweight → reps only
// time       → seconds (holds)
// distance   → weight (kg) + meters
// cardio     → resistance/level + note
// class      → just mark done
function getInputType(exercise) {
  const sr = (exercise.setsReps || '').toLowerCase();
  const sw = (exercise.suggestedWeight || '').toLowerCase();
  if (sr.includes('classe') || sr.includes('guidata') || sw.includes('segui')) return 'class';
  if (sw === 'nessun peso') return 'class';
  if (sr.startsWith('tempo:') || (sr.includes('minut') && !sr.includes(' x '))) return 'cardio';
  if (sr.includes('massimo')) return 'time';
  if (sr.includes('metr') || sr.includes('km')) return 'distance';
  if (sw === 'corpo libero' || sw === 'corpo libero (regola inclinazione)') return 'bodyweight';
  return 'standard';
}

function parseSetsCount(setsReps) {
  const m = setsReps?.match(/^(\d+)\s*[xX×]/);
  return m ? parseInt(m[1]) : 1;
}

function parseTargetReps(setsReps) {
  const m = setsReps?.match(/[xX×]\s*(.+)/);
  return m ? m[1].trim() : '';
}

// ── Constants ────────────────────────────────────────────────────────────────
const BEGINNER_TIPS = [
  "💡 Non avere fretta: la tecnica viene prima del peso!",
  "💡 Se senti dolore, fermati. Fastidio muscolare è ok, dolore articolare no.",
  "💡 Conta i secondi nella fase eccentrica (scendere): lento è meglio!",
  "💡 Concentrati sulla connessione mente-muscolo.",
  "💡 Bevi acqua tra un set e l'altro.",
  "💡 Meglio un peso leggero con tecnica perfetta che uno pesante fatto male.",
];
const DIFFICULTY_MAP = {
  easy:   { label: 'Facile',    color: 'text-green-400', bg: 'bg-green-500/15' },
  medium: { label: 'Medio',     color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  hard:   { label: 'Difficile', color: 'text-red-400',   bg: 'bg-red-500/15' },
};

// ── Component ────────────────────────────────────────────────────────────────
const ExerciseModal = ({
  exercise, onClose, onComplete, userLevel = 'beginner',
  noteText = '', onSaveNote, lastWorkout, exercisePR, calc1RM, onCheckPR,
}) => {
  const isBeginner     = userLevel === 'beginner';
  const isIntermediate = userLevel === 'intermediate';
  const isAdvanced     = userLevel === 'advanced';

  const inputType   = useMemo(() => getInputType(exercise), [exercise]);
  const setsCount   = useMemo(() => parseSetsCount(exercise.setsReps), [exercise.setsReps]);
  const targetReps  = useMemo(() => parseTargetReps(exercise.setsReps), [exercise.setsReps]);
  const isSimple    = inputType === 'class' || inputType === 'cardio';
  const diff        = DIFFICULTY_MAP[exercise.difficulty] || DIFFICULTY_MAP.medium;
  const randomTip   = useMemo(() => BEGINNER_TIPS[Math.floor(Math.random() * BEGINNER_TIPS.length)], []);

  // Per-set state — pre-fill from last workout
  const [sets, setSets] = useState(() =>
    Array.from({ length: setsCount }, () => ({
      weight: lastWorkout?.weight?.toString() || '',
      value:  lastWorkout?.reps?.toString()   || '',
    }))
  );
  const [activeSet, setActiveSet]     = useState(0);
  const [timerLeft, setTimerLeft]     = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [note, setNote]               = useState(noteText);
  const [showNote, setShowNote]       = useState(false);
  const [rpe, setRpe]                 = useState(0);
  const [newPR, setNewPR]             = useState(null);
  const [expandedSections, setExpandedSections] = useState(
    isBeginner ? { setup: true, execution: true, breathing: true, error: true }
    : isIntermediate ? { execution: true } : {}
  );

  const allSetsDone = activeSet >= setsCount;

  // Timer countdown
  useEffect(() => {
    if (!timerRunning || timerLeft <= 0) { if (timerLeft === 0) setTimerRunning(false); return; }
    const id = setInterval(() => setTimerLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerLeft]);

  const startTimer = useCallback(() => {
    if (!exercise.recovery) return;
    setTimerLeft(exercise.recovery);
    setTimerRunning(true);
  }, [exercise.recovery]);

  const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const updateSet = (idx, field, val) =>
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));

  const markSetDone = () => {
    const next = activeSet + 1;
    setActiveSet(next);
    if (next < setsCount && exercise.recovery > 0) startTimer();
  };

  const copyToAll = () => {
    const src = sets[activeSet];
    setSets(prev => prev.map((s, i) => i >= activeSet ? { ...src } : s));
  };

  // 1RM estimate & overload (uses last set in active row)
  const curSet = sets[Math.min(activeSet, setsCount - 1)];
  const estimated1RM = useMemo(() => {
    if (calc1RM && curSet?.weight && curSet?.value) return calc1RM(curSet.weight, curSet.value);
    return 0;
  }, [calc1RM, curSet]);

  const overloadStatus = useMemo(() => {
    if (!lastWorkout || !curSet?.weight || !curSet?.value) return null;
    const lv = (Number(lastWorkout.weight) || 0) * (Number(lastWorkout.reps) || 1);
    const cv = (Number(curSet.weight) || 0) * (Number(curSet.value) || 1);
    return cv > lv ? 'up' : cv < lv ? 'down' : 'same';
  }, [lastWorkout, curSet]);

  const handleComplete = async () => {
    const bestWeight = sets.reduce((m, s) => Math.max(m, parseFloat(s.weight) || 0), 0).toString();
    const bestValue  = sets[setsCount - 1]?.value || '';
    if (onCheckPR && bestWeight && bestValue) {
      const pr = await onCheckPR(exercise.id, bestWeight, bestValue, exercise.name);
      if (pr) {
        setNewPR(pr);
        setTimeout(() => { onComplete(exercise.id, bestWeight, bestValue, sets); onClose(); }, 1800);
        return;
      }
    }
    if (onSaveNote && note !== noteText) onSaveNote(exercise.id, note);
    onComplete(exercise.id, bestWeight, bestValue, sets);
    onClose();
  };

  const handleSimpleComplete = () => {
    if (onSaveNote && note !== noteText) onSaveNote(exercise.id, note);
    onComplete(exercise.id, '', '', []);
    onClose();
  };

  const toggleSection = key => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  if (!exercise) return null;

  // PR overlay
  if (newPR) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-50">
        <div className="text-center px-8">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-black text-white mb-2">NUOVO PR!</h2>
          <p className="text-white/60 text-sm mb-1">{exercise.name}</p>
          <p className="text-3xl font-black text-yellow-400">{estimated1RM} kg</p>
          <p className="text-white/30 text-xs mt-1">1RM stimato</p>
        </div>
      </div>
    );
  }

  const SectionCard = ({ id, iconBg, title, content, borderColor }) => {
    if (!content || isAdvanced) return null;
    const isOpen = expandedSections[id];
    return (
      <div className={`glass-light rounded-2xl overflow-hidden ${borderColor || ''}`}>
        <button onClick={() => toggleSection(id)} className="w-full text-left p-3.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-white/80">{title}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {isOpen && <div className="px-3.5 pb-3.5 pt-0"><p className={`text-xs leading-relaxed ${id === 'error' ? 'text-red-400/60' : 'text-white/50'}`}>{content}</p></div>}
      </div>
    );
  };

  // ── Label helpers ────────────────────────────────────────────────────────
  const fieldLabels = {
    standard:   { a: isBeginner ? 'Peso usato (kg)' : 'Peso (kg)', b: isBeginner ? 'Ripetizioni' : 'Reps', aPlaceholder: 'kg', bPlaceholder: targetReps || '—' },
    bodyweight: { a: null, b: isBeginner ? 'Ripetizioni' : 'Reps', aPlaceholder: null, bPlaceholder: targetReps || '—' },
    time:       { a: null, b: isBeginner ? 'Tempo (secondi)' : 'Sec', aPlaceholder: null, bPlaceholder: 'sec' },
    distance:   { a: isBeginner ? 'Peso per mano (kg)' : 'Kg/mano', b: 'Distanza (m)', aPlaceholder: 'kg', bPlaceholder: 'metri' },
    cardio:     { a: null, b: null, aPlaceholder: null, bPlaceholder: null },
    class:      { a: null, b: null, aPlaceholder: null, bPlaceholder: null },
  };
  const fl = fieldLabels[inputType] || fieldLabels.standard;

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
                {!isSimple && <span className="text-white/15 text-[10px]">{activeSet}/{setsCount} serie</span>}
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/40 active:scale-90 transition-transform">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {/* Progress dots */}
          {!isSimple && (
            <div className="flex gap-1 mt-3">
              {Array.from({ length: setsCount }, (_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < activeSet ? 'gradient-green' : i === activeSet ? 'bg-blue-500/60' : 'bg-white/8'}`} />
              ))}
            </div>
          )}
        </div>

        <div className={`px-5 space-y-3 ${isAdvanced ? 'py-3' : 'py-4'}`}>

          {/* BEGINNER extras */}
          {isBeginner && (
            <>
              <div className="bg-blue-500/8 rounded-xl p-2.5 border border-blue-500/10">
                <p className="text-blue-400/70 text-[11px] leading-relaxed">{randomTip}</p>
              </div>
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
              {exercise.instagramUrl && (
                <a href={exercise.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-4 rounded-2xl active:scale-[0.97] transition-transform"
                  style={{background:'linear-gradient(135deg,#f09433,#e6683c 20%,#dc2743 45%,#cc2366 75%,#bc1888)'}}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                  </div>
                  <div className="flex-1"><p className="text-white font-bold text-sm">▶ Guarda l'esecuzione corretta</p><p className="text-white/70 text-[11px] mt-0.5">Instagram Reel dal tuo PT</p></div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="opacity-70"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                </a>
              )}
            </>
          )}

          {/* INTERMEDIATE extras */}
          {isIntermediate && (
            <>
              {lastWorkout && (
                <div className="glass-light rounded-xl p-3 flex items-center justify-between">
                  <div><p className="text-white/30 text-[9px] font-semibold uppercase tracking-wider">Ultima volta</p>
                    <p className="text-white/70 text-sm font-bold">{lastWorkout.weight} kg × {lastWorkout.reps} reps</p></div>
                  {exercisePR && <div className="text-right"><p className="text-white/30 text-[9px] font-semibold uppercase tracking-wider">PR</p>
                    <p className="text-yellow-400/80 text-sm font-bold">{exercisePR.estimated1RM} kg</p></div>}
                </div>
              )}
              {exercise.instagramUrl && (
                <a href={exercise.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-3.5 rounded-2xl active:scale-[0.97] transition-transform"
                  style={{background:'linear-gradient(135deg,#f09433,#dc2743 50%,#bc1888)'}}>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                  </div>
                  <div className="flex-1"><p className="text-white font-bold text-xs">▶ Esecuzione corretta</p></div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="opacity-70"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                </a>
              )}
            </>
          )}

          {/* ADVANCED compact stats */}
          {isAdvanced && (
            <div className="flex gap-2">
              {lastWorkout && <div className="glass-light rounded-xl p-2.5 flex-1 text-center"><p className="text-white/20 text-[8px] font-bold uppercase">Precedente</p><p className="text-white/60 text-xs font-bold">{lastWorkout.weight}×{lastWorkout.reps}</p></div>}
              {exercisePR && <div className="glass-light rounded-xl p-2.5 flex-1 text-center"><p className="text-white/20 text-[8px] font-bold uppercase">PR 1RM</p><p className="text-yellow-400/70 text-xs font-bold">{exercisePR.estimated1RM}kg</p></div>}
              {exercise.instagramUrl && (
                <a href={exercise.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="rounded-xl p-2.5 flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
                  style={{background:'linear-gradient(135deg,#e6683c,#bc1888)'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                  <span className="text-white text-[9px] font-bold">Reel</span>
                </a>
              )}
            </div>
          )}

          {/* Instruction sections */}
          <SectionCard id="setup"     title={isBeginner ? "📋 Come posizionarti" : "Setup"}          content={exercise.setup} />
          <SectionCard id="execution" title={isBeginner ? "🎯 Come eseguirlo"    : "Esecuzione"}     content={exercise.execution} />
          <SectionCard id="breathing" title={isBeginner ? "🫁 Respirazione"      : "Respirazione"}   content={exercise.breathing} />
          <SectionCard id="error"     title={isBeginner ? "⚠️ Errore comune"     : "Errore"} content={exercise.error} borderColor="border-red-500/10" />

          {/* ── CLASS / CARDIO: single complete button ───────────────────── */}
          {isSimple && (
            <button onClick={handleSimpleComplete}
              className="w-full gradient-green text-white py-3.5 px-6 rounded-2xl font-semibold text-sm shadow-premium-sm active:scale-[0.97] transition-all-smooth flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {isBeginner ? 'Completato! 💪' : 'Completato'}
            </button>
          )}

          {/* ── TRACKING EXERCISES: set-by-set ───────────────────────────── */}
          {!isSimple && (
            <>
              {/* Timer */}
              {exercise.recovery > 0 && (
                <button onClick={startTimer} disabled={timerRunning}
                  className={`w-full py-2.5 px-5 rounded-2xl font-semibold text-sm transition-all-smooth ${timerRunning ? 'glass-light text-white/60' : 'gradient-blue text-white shadow-premium-sm active:scale-[0.97]'}`}>
                  {timerRunning ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-lg font-mono tracking-wider">{formatTime(timerLeft)}</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Recupero · {exercise.recovery}s
                    </span>
                  )}
                </button>
              )}

              {/* Set rows */}
              <div className="space-y-2">

                {sets.map((set, i) => {
                  const isDone    = i < activeSet;
                  const isActive  = i === activeSet;
                  const isPending = i > activeSet;
                  return (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all ${
                      isActive ? 'glass-light ring-1 ring-blue-500/30' :
                      isDone   ? 'bg-green-500/5' :
                      'bg-white/2 opacity-40'
                    }`}>
                      {/* Set number circle */}
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                        isDone   ? 'bg-green-500/15 border-green-500/30 text-green-400' :
                        isActive ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' :
                        'bg-white/5 border-white/10 text-white/20'
                      }`}>
                        {i + 1}
                      </div>

                      {/* Weight input */}
                      {fl.a && (
                        <input type="number" inputMode="decimal"
                          value={set.weight}
                          disabled={isDone || isPending}
                          onChange={e => updateSet(i, 'weight', e.target.value)}
                          className={`flex-1 px-2 py-1.5 rounded-xl text-center text-sm font-semibold focus:outline-none transition-all ${
                            isDone ? 'bg-transparent text-green-400/60 cursor-default' :
                            isActive ? 'glass text-white focus:ring-1 focus:ring-blue-500/50' :
                            'bg-transparent text-white/20 cursor-default'
                          }`}
                          placeholder={fl.aPlaceholder}
                        />
                      )}

                      {/* Value input (reps / sec / meters) */}
                      {fl.b && (
                        <input type="number" inputMode="decimal"
                          value={set.value}
                          disabled={isDone || isPending}
                          onChange={e => updateSet(i, 'value', e.target.value)}
                          className={`flex-1 px-2 py-1.5 rounded-xl text-center text-sm font-semibold focus:outline-none transition-all ${
                            isDone ? 'bg-transparent text-green-400/60 cursor-default' :
                            isActive ? 'glass text-white focus:ring-1 focus:ring-blue-500/50' :
                            'bg-transparent text-white/20 cursor-default'
                          }`}
                          placeholder={fl.bPlaceholder}
                        />
                      )}

                      {/* Action button */}
                      {isDone ? (
                        <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      ) : isActive ? (
                        <button onClick={markSetDone}
                          className="w-8 h-8 rounded-xl flex-shrink-0 gradient-blue flex items-center justify-center active:scale-90 transition-transform shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-white/15 text-xs">·</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Copy to remaining sets */}
              {!allSetsDone && activeSet > 0 && activeSet < setsCount && (
                <button onClick={copyToAll} className="text-blue-400/50 text-[10px] flex items-center gap-1 hover:text-blue-400/70 transition-colors mx-auto">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copia valori ai set restanti
                </button>
              )}

              {/* Overload indicator */}
              {!isBeginner && overloadStatus && (
                <div className={`text-center text-[11px] font-semibold ${overloadStatus === 'up' ? 'text-green-400' : overloadStatus === 'down' ? 'text-red-400' : 'text-white/30'}`}>
                  {overloadStatus === 'up' && '↑ Volume superiore alla scorsa volta!'}
                  {overloadStatus === 'down' && '↓ Volume inferiore alla scorsa volta'}
                  {overloadStatus === 'same' && '= Stesso volume della scorsa volta'}
                </div>
              )}

              {/* 1RM estimate */}
              {!isBeginner && estimated1RM > 0 && (
                <div className="text-center">
                  <span className="text-white/20 text-[9px] uppercase tracking-wider font-semibold">1RM stimato: </span>
                  <span className="text-white/50 text-xs font-bold">{estimated1RM} kg</span>
                </div>
              )}

              {/* RPE (advanced) */}
              {isAdvanced && (
                <div>
                  <p className="text-white/20 text-[9px] font-semibold uppercase tracking-wider mb-1.5 text-center">RPE</p>
                  <div className="flex gap-1 justify-center">
                    {[6,7,8,9,10].map(v => (
                      <button key={v} onClick={() => setRpe(v)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all active:scale-90 ${rpe === v ? 'gradient-blue text-white' : 'glass-light text-white/30'}`}>{v}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {!isAdvanced && (
                <div>
                  {showNote || note ? (
                    <div>
                      <label className="block text-white/30 text-[10px] font-medium mb-1 pl-1">{isBeginner ? '📝 I tuoi appunti' : 'Note'}</label>
                      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                        placeholder={isBeginner ? "Es: La prossima volta provo con 12kg..." : "Note..."}
                        className="w-full px-3 py-2 glass-light rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all-smooth placeholder-white/15 resize-none" />
                    </div>
                  ) : (
                    <button onClick={() => setShowNote(true)} className="text-white/20 text-[10px] flex items-center gap-1 hover:text-white/40 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                      {noteText ? 'Modifica nota' : 'Aggiungi nota'}
                    </button>
                  )}
                </div>
              )}

              {/* Complete button — only when all sets done */}
              {allSetsDone ? (
                <button onClick={handleComplete}
                  className="w-full gradient-green text-white py-3.5 px-6 rounded-2xl font-semibold text-sm shadow-premium-sm active:scale-[0.97] transition-all-smooth flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {isBeginner ? 'Esercizio completato! 💪' : 'Completa esercizio'}
                </button>
              ) : (
                <div className="glass-light rounded-2xl p-3 text-center">
                  <p className="text-white/25 text-[11px]">
                    Completa tutte le {setsCount} serie per finire l'esercizio
                    <span className="text-blue-400/50 ml-1">({activeSet}/{setsCount} fatto)</span>
                  </p>
                </div>
              )}
            </>
          )}

          <div className="h-2 sm:h-0" />
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
