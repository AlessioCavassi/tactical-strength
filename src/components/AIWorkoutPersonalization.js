import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaDumbbell, FaClock, FaCalendarAlt, FaBullseye, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaTimes, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../i18n/LanguageContext';

const AIWorkoutPersonalization = ({ userProfile, onWorkoutGenerated, onClose, isLoading, error, rateLimitInfo }) => {
  const { t, lang } = useLanguage();
  const [formData, setFormData] = useState({
    goals: userProfile?.goals || [],
    injuries: userProfile?.injuries || [],
    experience: userProfile?.experience || '',
    preferredDays: userProfile?.preferredDays || [],
    sessionDuration: userProfile?.sessionDuration || 45
  });
  
  const [expandedSection, setExpandedSection] = useState('goals');

  const goalOptions = t.aiGoalOptions || [
    'Forza', 'Ipertrofia', 'Dimagrimento', 'Resistenza', 
    'Performance Atletica', 'Fitness Funzionale', 'Riabilitazione'
  ];

  const injuryOptions = t.aiInjuryOptions || [
    'Spalle', 'Lombare', 'Ginocchia', 'Collo',
    'Polsi', 'Caviglie', 'Anche', 'Nessuno'
  ];

  const dayOptions = t.aiDayOptions || ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const durationOptions = [30, 45, 60, 75, 90];

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleInjuryToggle = (injury) => {
    if (injury === (t.aiInjuryOptions?.[7] || 'Nessuno')) {
      setFormData(prev => ({ ...prev, injuries: [] }));
    } else {
      setFormData(prev => ({
        ...prev,
        injuries: prev.injuries.includes(injury) 
          ? prev.injuries.filter(i => i !== injury)
          : [...prev.injuries, injury]
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day) 
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      level: userProfile?.level || 'beginner',
      ...formData
    };
    onWorkoutGenerated(userData);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const rateLimited = rateLimitInfo && !rateLimitInfo.allowed;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25 }}
          className="glass rounded-t-[28px] sm:rounded-[28px] p-5 max-w-lg w-full max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FaRobot className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Workout</h2>
                <p className="text-white/40 text-[11px]">{t.aiPersonalizedPlan}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl glass-light flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Rate Limit Info */}
          <div className="mb-4 p-3 rounded-xl glass-light flex items-center gap-2">
            <FaShieldAlt className="text-green-400 text-sm flex-shrink-0" />
            <div className="text-[10px] text-white/50">
              {rateLimited ? (
                <span className="text-orange-400">{lang === 'en' ? (rateLimitInfo.reasonEN || rateLimitInfo.reason) : (rateLimitInfo.reasonIT || rateLimitInfo.reason)}</span>
              ) : (
                <span>Free tier — {rateLimitInfo?.remainingHourly ?? '?'} {t.aiReqHour} · {rateLimitInfo?.remainingDaily ?? '?'} {t.aiReqDay}</span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-400 text-sm flex-shrink-0" />
              <span className="text-red-300 text-xs">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goals Section */}
            <div className="rounded-2xl glass-light overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('goals')}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FaBullseye className="text-purple-400 text-sm" />
                  <span className="font-semibold text-white/80 text-sm">{t.aiGoals}</span>
                  <span className="text-[10px] text-white/30">({formData.goals.length})</span>
                </div>
                {expandedSection === 'goals' ? <FaChevronUp className="text-white/30 text-xs" /> : <FaChevronDown className="text-white/30 text-xs" />}
              </button>
              
              {expandedSection === 'goals' && (
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {goalOptions.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleGoalToggle(goal)}
                        className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                          formData.goals.includes(goal)
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'glass-light text-white/50 border border-white/5 hover:border-white/10'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Injuries Section */}
            <div className="rounded-2xl glass-light overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('injuries')}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-400 text-sm" />
                  <span className="font-semibold text-white/80 text-sm">{t.aiInjuries}</span>
                  <span className="text-[10px] text-white/30">({formData.injuries.length})</span>
                </div>
                {expandedSection === 'injuries' ? <FaChevronUp className="text-white/30 text-xs" /> : <FaChevronDown className="text-white/30 text-xs" />}
              </button>
              
              {expandedSection === 'injuries' && (
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {injuryOptions.map(injury => (
                      <button
                        key={injury}
                        type="button"
                        onClick={() => handleInjuryToggle(injury)}
                        className={`p-2.5 rounded-xl text-xs font-medium transition-all ${
                          (injury === 'Nessuno' && formData.injuries.length === 0) || formData.injuries.includes(injury)
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : 'glass-light text-white/50 border border-white/5 hover:border-white/10'
                        }`}
                      >
                        {injury}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Experience Level */}
            <div className="rounded-2xl glass-light p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-3">
                <FaDumbbell className="text-blue-400 text-sm" />
                {t.aiExperience}
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:border-purple-500/50"
                required
              >
                <option value="" className="bg-gray-900">{t.aiSelectExp}</option>
                <option value="Principiante (0-6 mesi)" className="bg-gray-900">{t.aiExpBeg}</option>
                <option value="Intermedio (6-18 mesi)" className="bg-gray-900">{t.aiExpInt}</option>
                <option value="Avanzato (18+ mesi)" className="bg-gray-900">{t.aiExpAdv}</option>
                <option value="Esperto (3+ anni)" className="bg-gray-900">{t.aiExpExpert}</option>
              </select>
            </div>

            {/* Preferred Training Days */}
            <div className="rounded-2xl glass-light p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-3">
                <FaCalendarAlt className="text-green-400 text-sm" />
                {t.aiTrainingDays}
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {dayOptions.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all ${
                      formData.preferredDays.includes(day)
                        ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                        : 'glass-light text-white/40 border border-white/5'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Duration */}
            <div className="rounded-2xl glass-light p-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-3">
                <FaClock className="text-indigo-400 text-sm" />
                {t.aiSessionDuration}
              </label>
              <div className="flex gap-2">
                {durationOptions.map(duration => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, sessionDuration: duration }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      formData.sessionDuration === duration
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'glass-light text-white/40 border border-white/5'
                    }`}
                  >
                    {duration}'
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || rateLimited || formData.goals.length === 0 || formData.preferredDays.length === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-premium-sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span className="text-sm">{t.aiCreatingPlan}</span>
                </>
              ) : rateLimited ? (
                <span className="text-sm">{t.aiLimitReached}</span>
              ) : (
                <>
                  <FaRobot />
                  <span className="text-sm">{t.aiGeneratePlan}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIWorkoutPersonalization;
