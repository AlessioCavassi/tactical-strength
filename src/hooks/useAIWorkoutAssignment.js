import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PT_KNOWLEDGE_BASE } from '../data/ptKnowledge';

// ── STRICT RATE LIMITS (FREE TIER ONLY — ZERO COST) ──
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_REQUESTS_PER_DAY = 20;
const RATE_LIMIT_STORAGE_KEY = 'ai_workout_rate_limits';

const getRateLimitData = () => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!stored) return { hourly: [], daily: [] };
    return JSON.parse(stored);
  } catch {
    return { hourly: [], daily: [] };
  }
};

const saveRateLimitData = (data) => {
  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
};

const checkRateLimit = () => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const data = getRateLimitData();

  // Clean old entries
  data.hourly = data.hourly.filter(ts => ts > oneHourAgo);
  data.daily = data.daily.filter(ts => ts > oneDayAgo);
  saveRateLimitData(data);

  if (data.hourly.length >= MAX_REQUESTS_PER_HOUR) {
    const nextAvailable = Math.ceil((data.hourly[0] + 60 * 60 * 1000 - now) / 60000);
    return { allowed: false, reason: `Limite orario raggiunto (${MAX_REQUESTS_PER_HOUR}/ora). Riprova tra ${nextAvailable} minuti.` };
  }
  if (data.daily.length >= MAX_REQUESTS_PER_DAY) {
    const nextAvailable = Math.ceil((data.daily[0] + 24 * 60 * 60 * 1000 - now) / 3600000);
    return { allowed: false, reason: `Limite giornaliero raggiunto (${MAX_REQUESTS_PER_DAY}/giorno). Riprova tra ${nextAvailable} ore.` };
  }

  return { allowed: true, remainingHourly: MAX_REQUESTS_PER_HOUR - data.hourly.length, remainingDaily: MAX_REQUESTS_PER_DAY - data.daily.length };
};

const recordRequest = () => {
  const now = Date.now();
  const data = getRateLimitData();
  data.hourly.push(now);
  data.daily.push(now);
  saveRateLimitData(data);
};

const useAIWorkoutAssignment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAssignment, setLastAssignment] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(() => checkRateLimit());

  const generateWorkoutPlan = useCallback(async (userData) => {
    // ── RATE LIMIT CHECK (enforced before every call) ──
    const limit = checkRateLimit();
    setRateLimitInfo(limit);
    if (!limit.allowed) {
      const msg = limit.reason;
      setError(msg);
      throw new Error(msg);
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Chiave API Gemini non configurata. Aggiungi REACT_APP_GEMINI_API_KEY in .env');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // FREE TIER ONLY — gemini-2.0-flash is the stable free model
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
          maxOutputTokens: 2048,  // Cap output to stay well within free limits
          temperature: 0.7,
        },
      });

      const prompt = createWorkoutPrompt(userData);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Record successful request for rate limiting
      recordRequest();
      setRateLimitInfo(checkRateLimit());

      const workoutPlan = parseWorkoutResponse(text, userData.level);
      
      setLastAssignment(workoutPlan);
      return workoutPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateWorkoutPlan,
    isLoading,
    error,
    lastAssignment,
    rateLimitInfo
  };
};

const createWorkoutPrompt = (userData) => {
  const { level, goals, injuries, experience, preferredDays, sessionDuration } = userData;

  const injuryNote = injuries && injuries.length > 0 && !injuries.includes('none')
    ? injuries.join(', ')
    : 'Nessun problema fisico';

  const goalsText = goals && goals.length > 0 ? goals.join(', ') : 'forza generale';

  return `Sei un personal trainer esperto di Tactical Strength. Devi creare un piano di allenamento personalizzato basandoti ESCLUSIVAMENTE sulla metodologia qui sotto e sul profilo dell'atleta.

=== KNOWLEDGE BASE DEL PERSONAL TRAINER ===
${PT_KNOWLEDGE_BASE}

=== PROFILO ATLETA ===
- Livello: ${level}
- Obiettivi: ${goalsText}
- Problemi fisici/infortuni: ${injuryNote}
- Esperienza: ${experience}
- Giorni disponibili a settimana: ${preferredDays ? preferredDays.length : 4}
- Durata sessione: ${sessionDuration || 60} minuti

=== DATABASE ESERCIZI DISPONIBILI (usa questi) ===
TIRATA: Trazioni Assistite, Rematore Inverso TRX, Curl Bicipiti, Lat Machine
GAMBE (salva-ginocchio): Stacchi Rumeni (RDL), Affondi Indietro, Leg Curl, Hip Thrust, Step-Up, Cyclette
RECUPERO: Pilates Reformer, Stretching, Foam Rolling, Yoga, Mobilità
SPINTA: Piegamenti Zavorrati, Military Press manubri, Dip assistito, Alzate Laterali, Pushdown Tricipiti
CONDIZIONAMENTO: Kettlebell Swing, Farmer's Walk, Vogatore Concept 2, Assault Bike, Russian Twist, Circuito HIIT

=== ISTRUZIONI ===
1. Rispetta SEMPRE le limitazioni fisiche dell'atleta (infortuni).
2. Scegli esercizi DAL DATABASE sopra, adattati al livello.
3. Applica la periodizzazione della metodologia PT.
4. Per il ginocchio operato: VIETATI squat profondi e leg press heavy.
5. Includi note di coaching e cue tecnici in italiano.
6. Il piano deve essere realistico per la durata sessione indicata.
7. Aggiungi un consiglio mentale/psicologico per ogni giorno.

=== FORMATO RISPOSTA (JSON PURO, niente testo fuori dal JSON) ===
{
  "workoutPlan": {
    "level": "${level}",
    "daysPerWeek": ${preferredDays ? preferredDays.length : 4},
    "sessionDuration": ${sessionDuration || 60},
    "focus": ["obiettivo1", "obiettivo2"],
    "ptNote": "Nota personale del PT per l'atleta basata sul suo profilo",
    "schedule": [
      {
        "day": "Giorno 1 – Titolo",
        "theme": "Tirata/Spinta/Gambe/Condizionamento/Recupero",
        "mentalCue": "Consiglio mentale per questo allenamento",
        "exercises": [
          {
            "name": "Nome Esercizio",
            "sets": 4,
            "reps": "8-10",
            "rest": "90s",
            "weight": "Suggerimento peso",
            "coachingCue": "Cue tecnico del PT",
            "modifications": "Modifica se c'è infortunio"
          }
        ],
        "warmup": ["esercizio riscaldamento 1", "esercizio riscaldamento 2"],
        "cooldown": ["stretching 1", "stretching 2"]
      }
    ],
    "progressionStrategy": "Strategia progressione settimanale",
    "deloadFrequency": "ogni 4 settimane",
    "nutritionTip": "Consiglio nutrizionale base",
    "notes": "Note generali del PT"
  }
}`;
};

const parseWorkoutResponse = (text, userLevel) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const workoutPlan = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the workout plan
    return {
      ...workoutPlan.workoutPlan,
      generatedAt: new Date().toISOString(),
      adaptedForLevel: userLevel,
      isAIGenerated: true
    };
  } catch (err) {
    console.error('Error parsing AI response:', err);
    throw new Error('Failed to parse workout plan from AI response');
  }
};

export default useAIWorkoutAssignment;
