import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';

const getLEVELS = (t) => [
  {
    id: 'beginner',
    emoji: '🌱',
    title: t.lvl_beginner,
    subtitle: t.lvl_beginnerSub,
    desc: t.lvl_beginnerDesc,
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  {
    id: 'intermediate',
    emoji: '💪',
    title: t.lvl_intermediate,
    subtitle: t.lvl_intermediateSub,
    desc: t.lvl_intermediateDesc,
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  {
    id: 'advanced',
    emoji: '🔥',
    title: t.lvl_advanced,
    subtitle: t.lvl_advancedSub,
    desc: t.lvl_advancedDesc,
    color: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
];

const getGOALS = (t) => [
  { id: 'strength', emoji: '🏋️', label: t.goal_strength, desc: t.goal_strengthDesc },
  { id: 'muscle', emoji: '💎', label: t.goal_muscle, desc: t.goal_muscleDesc },
  { id: 'endurance', emoji: '🫁', label: t.goal_endurance, desc: t.goal_enduranceDesc },
  { id: 'weightloss', emoji: '⚡', label: t.goal_weightloss, desc: t.goal_weightlossDesc },
  { id: 'health', emoji: '🧘', label: t.goal_health, desc: t.goal_healthDesc },
  { id: 'sport', emoji: '🎯', label: t.goal_sport, desc: t.goal_sportDesc },
];

const getEXPERIENCE = (t) => [
  { id: '0-3', label: t.exp_0_3, desc: t.exp_0_3_desc },
  { id: '3-6', label: t.exp_3_6, desc: t.exp_3_6_desc },
  { id: '6-12', label: t.exp_6_12, desc: t.exp_6_12_desc },
  { id: '12-24', label: t.exp_12_24, desc: t.exp_12_24_desc },
  { id: '24+', label: t.exp_24, desc: t.exp_24_desc },
];

const getINJURIES = (t) => [
  { id: 'none', emoji: '✅', label: t.inj_none },
  { id: 'knee', emoji: '🦵', label: t.inj_knee },
  { id: 'shoulder', emoji: '💪', label: t.inj_shoulder },
  { id: 'back', emoji: '🔙', label: t.inj_back },
  { id: 'wrist', emoji: '✋', label: t.inj_wrist },
];

const AGE_RANGES = [
  { id: 'u20',   label: '< 20',   emoji: '🌱' },
  { id: '20-25', label: '20–25',  emoji: '🏃' },
  { id: '26-30', label: '26–30',  emoji: '💪' },
  { id: '31-40', label: '31–40',  emoji: '🎯' },
  { id: '41-50', label: '41–50',  emoji: '🔥' },
  { id: '50+',   label: '50+',    emoji: '🦅' },
];

const getFREQ_OPTIONS = (t) => [
  { id: '2', label: t.freq_2, desc: t.freq_2_desc },
  { id: '3', label: t.freq_3, desc: t.freq_3_desc },
  { id: '4', label: t.freq_4, desc: t.freq_4_desc },
  { id: '5', label: t.freq_5, desc: t.freq_5_desc },
];

const getDURATION_OPTIONS = (t) => [
  { id: '30',  label: '30 min', desc: t.dur_30_desc },
  { id: '45',  label: '45 min', desc: t.dur_45_desc },
  { id: '60',  label: '60 min', desc: t.dur_60_desc },
  { id: '90',  label: '90 min', desc: t.dur_90_desc },
];

const pageVariants = {
  enter: { opacity: 0, x: 40, filter: 'blur(4px)' },
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, x: -40, filter: 'blur(4px)' },
};

export default function OnboardingScreen({ user, onComplete }) {
  const { t } = useLanguage();
  const LEVELS = getLEVELS(t);
  const GOALS = getGOALS(t);
  const EXPERIENCE = getEXPERIENCE(t);
  const INJURIES = getINJURIES(t);
  const FREQ_OPTIONS = getFREQ_OPTIONS(t);
  const DURATION_OPTIONS = getDURATION_OPTIONS(t);

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    level: '',
    goals: [],
    experience: '',
    ageRange: '',
    bodyWeight: '',
    weeklyFrequency: '',
    sessionDuration: '',
    injuries: [],
    displayName: user?.displayName || '',
  });

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const canContinue = () => {
    switch (step) {
      case 0: return !!data.level;
      case 1: return data.goals.length > 0;
      case 2: return !!data.experience;
      case 3: return !!data.ageRange;
      case 4: return !!data.weeklyFrequency && !!data.sessionDuration;
      case 5: return data.injuries.length > 0;
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
              {t.back}
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
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t.onb_levelTitle}</h1>
              <p className="text-white/40 text-sm mb-8">{t.onb_levelSubtitle}</p>
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
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t.onb_goalsTitle}</h1>
              <p className="text-white/40 text-sm mb-8">{t.onb_goalsSubtitle}</p>
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
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t.onb_experienceTitle}</h1>
              <p className="text-white/40 text-sm mb-8">{t.onb_experienceSubtitle}</p>
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
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t.onb_dataTitle}</h1>
              <p className="text-white/40 text-sm mb-8">{t.onb_dataSubtitle}</p>

              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t.onb_age}</p>
              <div className="grid grid-cols-3 gap-2 mb-8">
                {AGE_RANGES.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setData(prev => ({ ...prev, ageRange: a.id }))}
                    className={`p-3.5 rounded-2xl border text-center transition-all-smooth active:scale-[0.97] ${
                      data.ageRange === a.id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'glass-light border-transparent'
                    }`}
                  >
                    <span className="text-xl block mb-1">{a.emoji}</span>
                    <p className={`font-bold text-xs ${
                      data.ageRange === a.id ? 'text-blue-400' : 'text-white/60'
                    }`}>{a.label}</p>
                  </button>
                ))}
              </div>

              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t.onb_weightLabel}</p>
              <div className="flex items-center glass-light rounded-2xl px-4 py-3.5 gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={t.onb_weightPlaceholder}
                  value={data.bodyWeight}
                  onChange={e => setData(prev => ({ ...prev, bodyWeight: e.target.value }))}
                  className="flex-1 bg-transparent text-white text-lg font-bold outline-none placeholder-white/15"
                />
                <span className="text-white/30 text-sm font-semibold">kg</span>
              </div>
              <p className="text-white/15 text-[10px] mt-2 ml-1">{t.onb_weightHint}</p>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t.onb_planTitle}</h1>
              <p className="text-white/40 text-sm mb-8">{t.onb_planSubtitle}</p>

              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t.onb_daysPerWeek}</p>
              <div className="grid grid-cols-2 gap-2.5 mb-8">
                {FREQ_OPTIONS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setData(prev => ({ ...prev, weeklyFrequency: f.id }))}
                    className={`p-4 rounded-2xl border text-left transition-all-smooth active:scale-[0.97] ${
                      data.weeklyFrequency === f.id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'glass-light border-transparent'
                    }`}
                  >
                    <p className={`font-bold text-sm ${
                      data.weeklyFrequency === f.id ? 'text-blue-400' : 'text-white/70'
                    }`}>{f.label}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>

              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t.onb_sessionDuration}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setData(prev => ({ ...prev, sessionDuration: d.id }))}
                    className={`p-4 rounded-2xl border text-left transition-all-smooth active:scale-[0.97] ${
                      data.sessionDuration === d.id
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'glass-light border-transparent'
                    }`}
                  >
                    <p className={`font-bold text-sm ${
                      data.sessionDuration === d.id ? 'text-purple-400' : 'text-white/70'
                    }`}>{d.label}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">{d.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t.onb_injuriesTitle}</h1>
              <p className="text-white/40 text-sm mb-8">{t.onb_injuriesSubtitle}</p>
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
          {step < totalSteps - 1 ? t.continue : t.onb_startTraining}
        </button>
      </div>
    </div>
  );
}
