import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LEVELS = [
  {
    id: 'beginner',
    emoji: '🌱',
    title: 'Principiante',
    subtitle: 'Sono nuovo nel mondo del fitness',
    desc: 'Spiegazioni dettagliate, guida passo-passo, consigli su respirazione e postura.',
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  {
    id: 'intermediate',
    emoji: '💪',
    title: 'Intermedio',
    subtitle: 'Mi alleno da qualche mese',
    desc: 'Spiegazioni sintetiche, focus su progressione e tecnica avanzata.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  {
    id: 'advanced',
    emoji: '🔥',
    title: 'Esperto',
    subtitle: 'Mi alleno da anni',
    desc: 'UI minimale, dati e performance. Niente spiegazioni, solo numeri.',
    color: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
];

const GOALS = [
  { id: 'strength', emoji: '🏋️', label: 'Forza', desc: 'Sollevare di più' },
  { id: 'muscle', emoji: '💎', label: 'Massa', desc: 'Costruire muscolo' },
  { id: 'endurance', emoji: '🫁', label: 'Resistenza', desc: 'Più stamina' },
  { id: 'weightloss', emoji: '⚡', label: 'Definizione', desc: 'Perdere grasso' },
  { id: 'health', emoji: '🧘', label: 'Salute', desc: 'Stare meglio' },
  { id: 'sport', emoji: '🎯', label: 'Sport', desc: 'Performance atletica' },
];

const EXPERIENCE = [
  { id: '0-3', label: '0-3 mesi', desc: 'Appena iniziato' },
  { id: '3-6', label: '3-6 mesi', desc: 'Le basi ci sono' },
  { id: '6-12', label: '6-12 mesi', desc: 'Un anno di lavoro' },
  { id: '12-24', label: '1-2 anni', desc: 'Solidità tecnica' },
  { id: '24+', label: '2+ anni', desc: 'Veterano' },
];

const INJURIES = [
  { id: 'none', emoji: '✅', label: 'Nessuno' },
  { id: 'knee', emoji: '🦵', label: 'Ginocchia' },
  { id: 'shoulder', emoji: '💪', label: 'Spalle' },
  { id: 'back', emoji: '🔙', label: 'Schiena' },
  { id: 'wrist', emoji: '✋', label: 'Polsi' },
];

const pageVariants = {
  enter: { opacity: 0, x: 40, filter: 'blur(4px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -40, filter: 'blur(4px)' },
};

export default function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    level: '',
    goals: [],
    experience: '',
    injuries: [],
    displayName: user?.displayName || '',
  });

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const canContinue = () => {
    switch (step) {
      case 0: return !!data.level;
      case 1: return data.goals.length > 0;
      case 2: return !!data.experience;
      case 3: return data.injuries.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      onComplete(data);
    }
  };

  const toggleGoal = (id) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...prev.goals, id],
    }));
  };

  const toggleInjury = (id) => {
    if (id === 'none') {
      setData(prev => ({ ...prev, injuries: ['none'] }));
      return;
    }
    setData(prev => ({
      ...prev,
      injuries: prev.injuries.includes(id)
        ? prev.injuries.filter(i => i !== id)
        : [...prev.injuries.filter(i => i !== 'none'), id],
    }));
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .onb-fade { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Top bar */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-white/40 text-sm font-medium active:scale-95 transition-transform">
              ← Indietro
            </button>
          ) : <div />}
          <span className="text-white/20 text-[10px] font-semibold uppercase tracking-widest">{step + 1}/{totalSteps}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 pb-32 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">Qual è il tuo livello?</h1>
              <p className="text-white/40 text-sm mb-8">Adatteremo l'app alle tue esigenze</p>
              <div className="space-y-3">
                {LEVELS.map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => setData(prev => ({ ...prev, level: lvl.id }))}
                    className={`w-full text-left p-4 rounded-2xl border transition-all-smooth active:scale-[0.98] ${
                      data.level === lvl.id
                        ? `bg-gradient-to-r ${lvl.color} ${lvl.border} shadow-premium-sm`
                        : 'glass-light border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{lvl.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${data.level === lvl.id ? lvl.text : 'text-white/80'}`}>{lvl.title}</p>
                        <p className="text-white/40 text-xs mt-0.5">{lvl.subtitle}</p>
                        <p className="text-white/25 text-[10px] mt-1.5 leading-relaxed">{lvl.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        data.level === lvl.id ? `${lvl.border} ${lvl.text}` : 'border-white/15'
                      }`}>
                        {data.level === lvl.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-current" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">I tuoi obiettivi</h1>
              <p className="text-white/40 text-sm mb-8">Seleziona uno o più obiettivi</p>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`text-left p-4 rounded-2xl border transition-all-smooth active:scale-[0.97] ${
                      data.goals.includes(goal.id)
                        ? 'bg-blue-500/10 border-blue-500/30 shadow-premium-sm'
                        : 'glass-light border-transparent'
                    }`}
                  >
                    <span className="text-xl block mb-2">{goal.emoji}</span>
                    <p className={`font-bold text-xs ${data.goals.includes(goal.id) ? 'text-blue-400' : 'text-white/70'}`}>{goal.label}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">Da quanto ti alleni?</h1>
              <p className="text-white/40 text-sm mb-8">Aiuta a calibrare la progressione</p>
              <div className="space-y-2">
                {EXPERIENCE.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => setData(prev => ({ ...prev, experience: exp.id }))}
                    className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all-smooth active:scale-[0.98] ${
                      data.experience === exp.id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'glass-light border-transparent'
                    }`}
                  >
                    <div>
                      <p className={`font-bold text-sm ${data.experience === exp.id ? 'text-blue-400' : 'text-white/70'}`}>{exp.label}</p>
                      <p className="text-white/25 text-[10px] mt-0.5">{exp.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      data.experience === exp.id ? 'border-blue-500/50 text-blue-400' : 'border-white/15'
                    }`}>
                      {data.experience === exp.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-current" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">Problemi fisici?</h1>
              <p className="text-white/40 text-sm mb-8">Per adattare gli esercizi alle tue necessità</p>
              <div className="grid grid-cols-2 gap-3">
                {INJURIES.map(inj => (
                  <button
                    key={inj.id}
                    onClick={() => toggleInjury(inj.id)}
                    className={`text-left p-4 rounded-2xl border transition-all-smooth active:scale-[0.97] ${
                      data.injuries.includes(inj.id)
                        ? inj.id === 'none'
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                        : 'glass-light border-transparent'
                    }`}
                  >
                    <span className="text-xl block mb-2">{inj.emoji}</span>
                    <p className={`font-bold text-xs ${
                      data.injuries.includes(inj.id)
                        ? inj.id === 'none' ? 'text-green-400' : 'text-red-400'
                        : 'text-white/70'
                    }`}>{inj.label}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black via-black/95 to-transparent">
        <button
          onClick={handleNext}
          disabled={!canContinue()}
          className={`w-full py-4 rounded-2xl font-bold text-sm transition-all-smooth active:scale-[0.97] ${
            canContinue()
              ? 'gradient-blue text-white shadow-premium-sm'
              : 'glass-light text-white/20 cursor-not-allowed'
          }`}
        >
          {step < totalSteps - 1 ? 'Continua' : 'Inizia ad allenarti'}
        </button>
      </div>
    </div>
  );
}
