import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dayColors = {
  1: { bg: 'bg-green-500/15', text: 'text-green-400' },
  2: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  3: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  4: { bg: 'bg-red-500/15', text: 'text-red-400' },
  5: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
};

export default function ProgressTable({ workouts = [], onDelete }) {
  const completedCount = workouts.filter(w => w.completed).length;
  const totalWeight = workouts
    .filter(w => w.completed)
    .reduce((sum, w) => sum + (Number(w.weight) || 0) * (Number(w.reps) || 1), 0);

  const handleDelete = (id) => {
    if (onDelete) onDelete(id);
  };

  return (
    <div className="w-full">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass-light rounded-2xl p-4 text-center">
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">Completati</p>
          <p className="text-2xl font-bold text-green-400">{completedCount}<span className="text-white/20 text-sm font-normal">/{workouts.length}</span></p>
        </div>
        <div className="glass-light rounded-2xl p-4 text-center">
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-1">Volume</p>
          <p className="text-2xl font-bold text-blue-400">{totalWeight}<span className="text-white/20 text-sm font-normal"> kg</span></p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        <AnimatePresence>
          {workouts.map((w, i) => {
            const colors = dayColors[w.day] || dayColors[1];
            return (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass-light rounded-2xl p-3.5 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-xl ${w.completed ? 'gradient-green' : 'glass'} flex items-center justify-center flex-shrink-0`}>
                      {w.completed ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"><circle cx="12" cy="12" r="10"/></svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white/90 text-sm font-semibold truncate">{w.exerciseName || w.exercise}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`${colors.text} text-[10px] font-semibold px-1.5 py-0.5 ${colors.bg} rounded-md`}>GG{w.day}</span>
                        <span className="text-white/25 text-[10px]">{w.setsReps || w.sets || ''}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all-smooth flex-shrink-0 ml-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
                <div className="flex gap-4 pl-[42px]">
                  <div>
                    <p className="text-white/20 text-[9px] font-medium uppercase">Peso</p>
                    <p className="text-blue-400/80 text-xs font-bold">{w.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-white/20 text-[9px] font-medium uppercase">Reps</p>
                    <p className="text-green-400/80 text-xs font-bold">{w.reps}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {workouts.length === 0 && (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-full glass mx-auto mb-3 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <p className="text-white/30 text-xs">Nessun allenamento registrato</p>
        </div>
      )}
    </div>
  );
}
