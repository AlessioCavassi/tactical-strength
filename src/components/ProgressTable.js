import React, { useMemo, useState } from 'react';

// ── Goal-to-metric mapping ───────────────────────────────────────────────────
const GOAL_META = {
  strength:   { icon: '🏋️', label: 'Forza',       stats: ['sessions','pr','week'] },
  muscle:     { icon: '💎', label: 'Massa',        stats: ['sessions','pr','week'] },
  endurance:  { icon: '🫁', label: 'Resistenza',   stats: ['sessions','week','streak'] },
  weightloss: { icon: '⚡', label: 'Definizione',  stats: ['week','sessions','streak'] },
  health:     { icon: '🧘', label: 'Salute',       stats: ['week','sessions','streak'] },
  sport:      { icon: '🎯', label: 'Sport',        stats: ['sessions','week','pr'] },
};

const DAY_COLOR = ['','text-green-400','text-blue-400','text-yellow-400','text-red-400','text-orange-400'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function toDate(v) {
  if (!v) return new Date();
  if (typeof v === 'string') return new Date(v);
  if (v?.toDate) return v.toDate();
  return new Date(v);
}
function dayStr(v)  { return toDate(v).toDateString(); }
function fmt(v)     { const d = toDate(v); return `${d.getDate()}/${d.getMonth() + 1}`; }

function calcStreak(workouts) {
  const days = new Set(workouts.map(w => dayStr(w.createdAt)));
  let streak = 0;
  const d = new Date(); d.setHours(0,0,0,0);
  // allow missing today — check yesterday first if today absent
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

function bestImprovement(workouts) {
  const map = {};
  workouts.forEach(w => {
    if (!w.exerciseId || !(parseFloat(w.weight) > 0)) return;
    const id = String(w.exerciseId);
    if (!map[id]) map[id] = { name: w.exerciseName || id, entries: [] };
    map[id].entries.push({ weight: parseFloat(w.weight), date: toDate(w.createdAt) });
  });
  let best = null, bestPct = 0;
  Object.values(map).forEach(({ name, entries }) => {
    if (entries.length < 2) return;
    entries.sort((a,b) => a.date - b.date);
    const first = entries[0].weight, last = entries[entries.length-1].weight;
    if (first <= 0) return;
    const pct = Math.round(((last - first) / first) * 100);
    if (pct > bestPct) { bestPct = pct; best = { name, pct }; }
  });
  return best;
}

export default function ProgressTable({ workouts = [], prs = {}, profile, onDelete }) {
  const [showAll, setShowAll] = useState(false);

  const goals     = profile?.goals || [];
  const goalId    = goals[0];
  const goalCfg   = GOAL_META[goalId] || null;
  const statsKeys = goalCfg?.stats || ['sessions', 'week', 'pr'];

  const completed = useMemo(() => workouts.filter(w => w.completed), [workouts]);
  const weekAgo   = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);

  const sessionsThisWeek = useMemo(() => {
    const days = new Set(
      completed
        .filter(w => toDate(w.createdAt).getTime() > weekAgo)
        .map(w => dayStr(w.createdAt))
    );
    return days.size;
  }, [completed, weekAgo]);

  const streak   = useMemo(() => calcStreak(completed), [completed]);
  const prCount  = Object.keys(prs).length;
  const topGain  = useMemo(() => bestImprovement(completed), [completed]);

  const recentList = useMemo(() =>
    [...completed]
      .sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
      .slice(0, showAll ? 30 : 5),
    [completed, showAll]
  );

  // ── Stat definitions ──────────────────────────────────────────────────────
  const statDefs = {
    sessions: { label: 'Allenamenti', value: completed.length, color: 'text-blue-400',   unit: '' },
    week:     { label: 'Giorni · 7gg', value: sessionsThisWeek, color: 'text-purple-400', unit: '' },
    pr:       { label: 'Record',       value: prCount,          color: 'text-yellow-400', unit: '' },
    streak:   { label: 'Streak',       value: streak,           color: 'text-orange-400', unit: 'gg' },
  };

  return (
    <div className="w-full">

      {/* Goal label */}
      {goalCfg && (
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-sm">{goalCfg.icon}</span>
          <span className="text-white/25 text-[10px] font-semibold uppercase tracking-wider">
            Obiettivo · {goalCfg.label}
          </span>
        </div>
      )}

      {/* Stat cards — 3 columns, goal-adaptive */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {statsKeys.map(key => {
          const s = statDefs[key];
          return (
            <div key={key} className="glass-light rounded-2xl p-3 text-center">
              <p className="text-white/25 text-[9px] font-semibold uppercase tracking-wider mb-1.5 leading-tight">{s.label}</p>
              <p className={`text-2xl font-black leading-none ${s.color}`}>
                {s.value}
                <span className="text-white/20 text-xs font-normal ml-0.5">{s.unit}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Best improvement banner */}
      {topGain && topGain.pct > 0 && (
        <div className="glass-light rounded-2xl p-3.5 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/25 text-[9px] font-semibold uppercase tracking-wider">Miglioramento top</p>
            <p className="text-white/70 text-xs font-bold truncate">{topGain.name}</p>
          </div>
          <span className="text-green-400 font-black text-sm flex-shrink-0">+{topGain.pct}%</span>
        </div>
      )}

      {/* Onboarding nudge — no PRs yet for strength/muscle */}
      {(goalId === 'strength' || goalId === 'muscle') && prCount === 0 && completed.length >= 1 && (
        <div className="bg-blue-500/8 border border-blue-500/10 rounded-2xl p-3.5 mb-5">
          <p className="text-blue-400/60 text-xs leading-relaxed">
            💡 Inserisci il peso che usi per vedere i tuoi record personali e la progressione nel tempo.
          </p>
        </div>
      )}

      {/* Recent log */}
      {recentList.length > 0 && (
        <>
          <p className="text-white/20 text-[9px] font-semibold uppercase tracking-wider mb-3">Storico recente</p>
          <div className="space-y-2">
            {recentList.map(w => {
              const col = DAY_COLOR[w.day] || 'text-white/30';
              const wStr = w.weight > 0 ? `${w.weight} kg` : '';
              const rStr = w.reps   > 0 ? `× ${w.reps}`   : '';
              const detail = [wStr, rStr].filter(Boolean).join(' ') || (w.setsReps || '—');
              return (
                <div key={w.id} className="flex items-center gap-3 px-3.5 py-2.5 glass-light rounded-2xl">
                  <div className={`w-1.5 h-7 rounded-full flex-shrink-0 ${
                    w.day === 1 ? 'bg-green-500/40'  :
                    w.day === 2 ? 'bg-blue-500/40'   :
                    w.day === 3 ? 'bg-yellow-500/40' :
                    w.day === 4 ? 'bg-red-500/40'    : 'bg-orange-500/40'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs font-semibold truncate">{w.exerciseName || '—'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-bold ${col}`}>GG{w.day}</span>
                      <span className="text-white/30 text-[9px]">{detail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-white/20 text-[9px]">{fmt(w.createdAt)}</span>
                    <button onClick={() => onDelete?.(w.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-90">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {completed.length > 5 && (
            <button onClick={() => setShowAll(v => !v)}
              className="w-full text-center text-white/20 text-[10px] py-3 hover:text-white/40 transition-colors">
              {showAll ? 'Mostra meno ↑' : `Vedi tutti (${completed.length}) ↓`}
            </button>
          )}
        </>
      )}

      {workouts.length === 0 && (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full glass mx-auto mb-3 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <p className="text-white/30 text-xs">Nessun allenamento registrato</p>
          <p className="text-white/15 text-[10px] mt-1">Completa il primo esercizio per iniziare a tracciare i progressi</p>
        </div>
      )}
    </div>
  );
}
