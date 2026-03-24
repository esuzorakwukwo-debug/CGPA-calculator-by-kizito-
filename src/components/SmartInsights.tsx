import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { Semester } from '../types';
import { calculateCGPA, checkAndIncrementAILimit } from '../utils';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { LimitModal } from './LimitModal';

interface SmartInsightsProps {
  semesters: Semester[];
}

export function SmartInsights({ semesters }: SmartInsightsProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const fetchInsight = useCallback(async (deep: boolean = false) => {
    if (semesters.length === 0 || semesters.every(s => s.courses.length === 0)) {
      setInsight(null);
      return;
    }

    const cgpa = calculateCGPA(semesters);
    const fallbackInsight = () => {
      if (cgpa >= 4.5) setInsight("Excellent work! You are maintaining a First Class. Keep it up!");
      else if (cgpa >= 4.0) setInsight("You are very close to a First Class! A strong push next semester can get you there.");
      else if (cgpa >= 3.5) setInsight("Solid Second Class Upper. Focus on your core courses to boost your CGPA further.");
      else if (cgpa >= 2.4) setInsight("You're in the Second Class Lower range. Try targeting a 4.0+ GPA next semester to climb higher.");
      else setInsight("Keep pushing! Every extra point counts towards improving your standing.");
    };

    if (!checkAndIncrementAILimit()) {
      if (deep) {
        setShowLimitModal(true);
        setIsDeepThinking(false);
      }
      fallbackInsight();
      return;
    }

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("An API Key must be set when running in a browser");

      const ai = new GoogleGenAI({ apiKey });
      
      const summary = semesters.map(s => {
        const credits = s.courses.reduce((sum, c) => sum + c.creditUnit, 0);
        const points = s.courses.reduce((sum, c) => {
          const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }[c.grade] || 0;
          return sum + (gradePoints * c.creditUnit);
        }, 0);
        const gpa = credits > 0 ? points / credits : 0;
        return `${s.name || s.level + ' ' + s.term}: GPA ${gpa.toFixed(2)} (${credits} credits)`;
      }).join('\n');

      const prompt = deep 
        ? `You are an expert academic advisor. A university student has a current CGPA of ${cgpa.toFixed(2)} on a 5.0 scale.
Here is their semester-by-semester performance:
${summary}

Provide a deep, strategic, and highly personalized academic analysis. Identify trends (e.g., struggling with high-credit courses, improving over time), and give specific, actionable advice on how they can maximize their CGPA in upcoming semesters. Keep it concise but highly analytical (max 3-4 sentences). Do not use markdown formatting, just plain text.`
        : `You are an academic advisor. A university student has a current CGPA of ${cgpa.toFixed(2)} on a 5.0 scale.
Here is their semester-by-semester performance:
${summary}

Provide a very short, encouraging, and actionable insight (max 2 sentences). 
Examples: "You are close to First Class! Maintain at least a 4.2 next semester." or "Your grades dipped slightly last semester. Focus on high-credit courses to bounce back."
Do not use markdown formatting, just plain text.`;

      const response = await ai.models.generateContent({
        model: deep ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
        contents: prompt,
        config: deep ? {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        } : undefined
      });

      setInsight(response.text || "Keep up the good work!");
    } catch (error) {
      console.error("Failed to fetch insight:", error);
      fallbackInsight();
    } finally {
      setLoading(false);
    }
  }, [semesters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchInsight(false), 1500);
    return () => clearTimeout(timeoutId);
  }, [fetchInsight]);

  if (semesters.length === 0 || semesters.every(s => s.courses.length === 0)) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-3xl p-5 mb-6 border border-violet-100 dark:border-violet-800/30 flex flex-col sm:flex-row items-start gap-4 transition-colors shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-1">
          {loading ? <Loader2 size={20} className="animate-spin" /> : (isDeepThinking ? <BrainCircuit size={20} /> : <Sparkles size={20} />)}
        </div>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-200">
              {isDeepThinking ? "Deep Academic Analysis" : "Smart Insight"}
            </h4>
            {!isDeepThinking && !loading && (
              <button
                onClick={() => {
                  setIsDeepThinking(true);
                  fetchInsight(true);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 bg-violet-100/50 dark:bg-violet-900/30 hover:bg-violet-200/50 dark:hover:bg-violet-800/40 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <BrainCircuit size={14} />
                Think Deeper
              </button>
            )}
          </div>
          <p className="text-sm text-violet-800/80 dark:text-violet-300/80 leading-relaxed">
            {loading ? (isDeepThinking ? "Analyzing your academic trends deeply..." : "Analyzing your performance...") : insight}
          </p>
        </div>
      </div>

      <LimitModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)} 
      />
    </>
  );
}
