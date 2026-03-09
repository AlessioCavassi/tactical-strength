import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const useAIWorkoutAssignment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAssignment, setLastAssignment] = useState(null);

  const generateWorkoutPlan = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

      const prompt = createWorkoutPrompt(userData);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
    lastAssignment
  };
};

const createWorkoutPrompt = (userData) => {
  const { level, goals, injuries, experience, preferredDays, sessionDuration } = userData;
  
  return `You are an expert fitness trainer specializing in tactical strength training. Create a personalized workout plan based on the following user profile:

USER PROFILE:
- Level: ${level} (beginner/intermediate/advanced)
- Goals: ${goals.join(', ')}
- Injuries/Limitations: ${injuries.length > 0 ? injuries.join(', ') : 'None'}
- Experience: ${experience} months/years
- Preferred Training Days: ${preferredDays.join(', ')}
- Session Duration: ${sessionDuration} minutes

AVAILABLE EXERCISES DATABASE:
1. Push Press - explosive overhead movement
2. Goblet Squat - lower body strength
3. Renegade Row - core and back strength
4. Turkish Get-Up - full body mobility
5. Box Jumps - explosive power
6. Kettlebell Swing - hip hinge power
7. Pull-ups - upper body pulling
8. Handstand Push-ups - overhead pressing
9. Pistol Squats - single leg strength
10. Muscle-ups - full body pulling/pushing
11. L-sit - core strength
12. Front Lever - static strength
13. Back Lever - static strength
14. Planche - static strength
15. Human Flag - side core strength
16. One Arm Push-up - unilateral strength
17. One Arm Pull-up - unilateral pulling

REQUIREMENTS:
1. Select 4-6 exercises appropriate for the user's level and goals
2. Consider injuries and modify exercises accordingly
3. Structure for ${preferredDays.length} days per week
4. Each session should not exceed ${sessionDuration} minutes
5. Include sets, reps, and rest periods
6. Provide progressions and regressions
7. Focus on compound, functional movements
8. Include warm-up and cool-down recommendations

RESPONSE FORMAT (JSON):
{
  "workoutPlan": {
    "level": "${level}",
    "daysPerWeek": ${preferredDays.length},
    "sessionDuration": ${sessionDuration},
    "focus": ["primary", "goals"],
    "schedule": [
      {
        "day": "Day 1",
        "exercises": [
          {
            "name": "Exercise Name",
            "sets": 3,
            "reps": "8-12",
            "rest": "90s",
            "difficulty": "moderate",
            "modifications": "If injured, do X instead",
            "progression": "Increase weight when comfortable"
          }
        ],
        "warmup": ["dynamic stretch 1", "dynamic stretch 2"],
        "cooldown": ["static stretch 1", "static stretch 2"]
      }
    ],
    "progressionStrategy": "weekly progression plan",
    "deloadFrequency": "every 4 weeks",
    "notes": "specific coaching cues"
  }
}

Generate only the JSON response, no additional text.`;
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
