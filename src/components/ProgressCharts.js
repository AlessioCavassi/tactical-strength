import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

const fmt = iso => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { date, weight, reps } = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(16,16,20,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '8px 12px',
      backdropFilter: 'blur(20px)',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, marginBottom: 2 }}>{date}</p>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{weight} kg</p>
      {reps && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{reps} reps</p>}
    </div>
  );
}

export default function ProgressCharts({ workouts }) {
  // Group workouts by exercise name
  const exerciseMap = useMemo(() => {
    const map = {};
    (workouts || []).forEach(w => {
      if (!w.exerciseName || !w.weight) return;
      if (!map[w.exerciseName]) map[w.exerciseName] = [];
      map[w.exerciseName].push({
        date: fmt(w.completedAt || w.createdAt || new Date()),
        rawDate: w.completedAt || w.createdAt || new Date().toISOString(),
        weight: parseFloat(w.weight) || 0,
        reps: w.reps,
      });
    });
    // Sort each exercise by date
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    });
    return map;
  }, [workouts]);

  const exercises = Object.keys(exerciseMap);
  const [selected, setSelected] = useState(null);

  const activeEx = selected || exercises[0];
  const data = exerciseMap[activeEx] || [];

  // Compute PR (max weight)
  const pr = data.length ? Math.max(...data.map(d => d.weight)) : 0;
  // Compute improvement % vs first session
  const firstWeight = data[0]?.weight || 0;
  const lastWeight = data[data.length - 1]?.weight || 0;
  const improvement = firstWeight > 0
    ? Math.round(((lastWeight - firstWeight) / firstWeight) * 100)
    : 0;

  if (!exercises.length) {
    return (
      <div className="glass rounded-[24px] p-6 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-white/50 text-sm font-semibold">Nessun dato ancora</p>
        <p className="text-white/25 text-xs mt-1">Completa degli esercizi per vedere i grafici</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[24px] p-5 shadow-premium-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-bold text-sm tracking-tight">📈 Progressione</p>
          <p className="text-white/30 text-[10px] mt-0.5">Peso per esercizio nel tempo</p>
        </div>
        {improvement !== 0 && (
          <div className="px-2.5 py-1 rounded-xl text-[10px] font-bold"
            style={{
              background: improvement > 0 ? 'rgba(48,209,88,0.12)' : 'rgba(255,69,58,0.12)',
              color: improvement > 0 ? '#30d158' : '#ff453a',
            }}>
            {improvement > 0 ? '+' : ''}{improvement}% vs inizio
          </div>
        )}
      </div>

      {/* Exercise selector chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {exercises.map(ex => (
          <button
            key={ex}
            onClick={() => setSelected(ex)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all active:scale-95"
            style={{
              background: (activeEx === ex)
                ? 'linear-gradient(135deg, var(--accent-from), var(--accent-to))'
                : 'rgba(255,255,255,0.06)',
              color: activeEx === ex ? '#fff' : 'rgba(255,255,255,0.4)',
              border: activeEx === ex ? 'none' : '1px solid rgba(255,255,255,0.07)',
              whiteSpace: 'nowrap',
            }}
          >
            {ex.length > 18 ? ex.substring(0, 16) + '…' : ex}
          </button>
        ))}
      </div>

      {/* PR stat */}
      {pr > 0 && (
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="text-center">
            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">PR</p>
            <p className="text-white font-bold text-lg leading-none">{pr}<span className="text-white/40 text-xs ml-0.5">kg</span></p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">Sessioni</p>
            <p className="text-white font-bold text-lg leading-none">{data.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">Ultimo</p>
            <p className="text-white font-bold text-lg leading-none">{lastWeight}<span className="text-white/40 text-xs ml-0.5">kg</span></p>
          </div>
        </div>
      )}

      {/* Chart */}
      {data.length >= 2 ? (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
              axisLine={false} tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            {pr > 0 && (
              <ReferenceLine y={pr} stroke="rgba(255,214,10,0.3)"
                strokeDasharray="3 3"
                label={{ value: 'PR', fill: 'rgba(255,214,10,0.5)', fontSize: 9, position: 'right' }}
              />
            )}
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-from, #0a84ff)" />
                <stop offset="100%" stopColor="var(--accent-to, #00c6ff)" />
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="weight"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--accent-from, #0a84ff)', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#fff', stroke: 'var(--accent-from)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-20 flex items-center justify-center">
          <p className="text-white/20 text-xs">Ancora pochi dati — continua ad allenarti!</p>
        </div>
      )}
    </div>
  );
}
