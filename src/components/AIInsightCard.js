import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useLanguage } from '../i18n/LanguageContext';

const CACHE_KEY  = 'ai_insights_cache';
const CACHE_TTL  = 24 * 60 * 60 * 1000; // refresh once per day

function loadCache(userId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj.userId !== userId) return null;
    if (Date.now() - obj.ts > CACHE_TTL) return null;
    return obj.insights;
  } catch { return null; }
}

function saveCache(userId, insights) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ userId, ts: Date.now(), insights }));
  } catch {}
}

function buildPrompt(profile, workouts, prs, gamStats, lang) {
  const goal        = profile?.goals?.[0] || 'salute';
  const level       = profile?.level || 'beginner';
  const age         = profile?.ageRange || '?';
  const weight      = profile?.bodyWeight ? `${profile.bodyWeight} kg` : (lang === 'en' ? 'not specified' : 'non specificato');
  const freq        = profile?.weeklyFrequency ? `${profile.weeklyFrequency} ${lang === 'en' ? 'days/week' : 'giorni/sett.'}` : '?';
  const duration    = profile?.sessionDuration ? `${profile.sessionDuration} min` : '?';
  const streak      = gamStats?.currentStreak || 0;
  const totalEx     = gamStats?.totalExercises || 0;
  const totalPRs    = gamStats?.totalPRs || 0;
  const prCount     = Object.keys(prs || {}).length;

  const recentEx = workouts
    .slice(-10)
    .map(w => `${w.exerciseName}: ${w.weight > 0 ? w.weight + 'kg' : ''} ${w.reps > 0 ? '×' + w.reps : ''}`.trim())
    .join(', ');

  const langInstr = lang === 'en'
    ? 'You are an expert personal trainer. Analyze the training data and generate EXACTLY 3 personalized suggestions in English, concise and motivating.'
    : 'Sei un personal trainer esperto. Analizza questi dati di allenamento e genera ESATTAMENTE 3 suggerimenti personalizzati in italiano, concisi e motivanti.';

  const rulesInstr = lang === 'en'
    ? `RULES:
- Reply ONLY with a JSON array of exactly 3 objects, nothing else
- Each object has: "icon" (1 emoji), "title" (max 5 words), "text" (max 20 words, concrete and actionable)
- Tone: direct, motivating, specific to the data
- If not enough data, give general advice for the stated goal`
    : `REGOLE:
- Rispondi SOLO con un JSON array di esattamente 3 oggetti, niente altro
- Ogni oggetto ha: "icon" (1 emoji), "title" (max 5 parole), "text" (max 20 parole, concreto e actionable)
- Tono: diretto, motivante, specifico ai dati
- Se non ci sono abbastanza dati, dai consigli generali per l'obiettivo indicato`;

  const noData = recentEx || (lang === 'en' ? 'none yet' : 'nessuno ancora');

  return `${langInstr}

ATHLETE DATA:
- Goal: ${goal}
- Level: ${level}
- Age: ${age}
- Weight: ${weight}
- Target frequency: ${freq}
- Session duration: ${duration}
- Current streak: ${streak} days
- Total exercises completed: ${totalEx}
- Personal records: ${prCount} (totalPRs: ${totalPRs})
- Recent exercises: ${noData}

${rulesInstr}

Example format:
[{"icon":"🔥","title":"Keep the streak","text":"You're at ${streak} consecutive days. Don't skip tomorrow to build the habit."},{"icon":"💪","title":"Increase load","text":"After 3 sessions at the same weight, it's time to go up 2.5 kg."},{"icon":"📊","title":"Track reps","text":"Logging reps helps you see progress week over week."}]`;
}

export default function AIInsightCard({ profile, workouts, prs, gamStats }) {
  const { t, lang } = useLanguage();
  const [insights, setInsights]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [expanded, setExpanded]   = useState(false);

  const userId = profile?.uid || 'anon';

  const generate = useCallback(async (force = false) => {
    if (!force) {
      const cached = loadCache(userId);
      if (cached) { setInsights(cached); return; }
    }

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) { setError(t.aiKeyMissing); return; }

    setLoading(true);
    setError(null);
    try {
      const genAI  = new GoogleGenerativeAI(apiKey);
      const model  = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = buildPrompt(profile, workouts || [], prs || {}, gamStats, lang);
      const result = await model.generateContent(prompt);
      const text   = result.response.text().trim();

      // Extract JSON array from response
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Formato risposta non valido');
      const parsed = JSON.parse(match[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Array vuoto');

      saveCache(userId, parsed);
      setInsights(parsed);
    } catch (err) {
      setError(t.aiRetryLater);
      console.error('AI Insights error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, profile, workouts, prs, gamStats]);

  useEffect(() => {
    if (userId) generate(false);
  }, [userId]); // eslint-disable-line

  // Don't render if no API key
  if (!process.env.REACT_APP_GEMINI_API_KEY) return null;

  return (
    <div className="glass-light rounded-2xl overflow-hidden mb-6">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/25 to-blue-500/25 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#aigrad)" strokeWidth="1.8" strokeLinecap="round">
            <defs>
              <linearGradient id="aigrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-white/70 text-xs font-bold">{t.aiSuggestions}</p>
          <p className="text-white/25 text-[9px]">{t.aiAnalysis}</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-3 h-3 rounded-full border border-violet-400/40 border-t-violet-400 animate-spin" />
          )}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round"
            className={`text-white/20 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5 border-t border-white/5 pt-3">
              {loading && (
                <div className="flex items-center gap-3 py-3">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-white/25 text-xs">{t.aiAnalyzing}</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex items-center justify-between py-2">
                  <p className="text-white/30 text-xs">{error}</p>
                  <button onClick={() => generate(true)}
                    className="text-violet-400/60 text-xs font-semibold hover:text-violet-400 transition-colors">
                    {t.retry}
                  </button>
                </div>
              )}

              {insights && !loading && insights.map((ins, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 bg-white/4 rounded-xl p-3"
                >
                  <span className="text-xl flex-shrink-0">{ins.icon}</span>
                  <div>
                    <p className="text-white/80 text-xs font-bold mb-0.5">{ins.title}</p>
                    <p className="text-white/40 text-[11px] leading-relaxed">{ins.text}</p>
                  </div>
                </motion.div>
              ))}

              {insights && !loading && (
                <div className="flex items-center justify-between pt-1">
                  <p className="text-white/15 text-[9px]">{t.aiUpdatedEvery}</p>
                  <button onClick={() => generate(true)}
                    className="text-white/15 text-[9px] font-semibold hover:text-white/30 transition-colors flex items-center gap-1">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10"/><path d="M20.49 15a9 9 0 01-14.85 3.36L1 14"/>
                    </svg>
                    {t.aiRefresh}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
