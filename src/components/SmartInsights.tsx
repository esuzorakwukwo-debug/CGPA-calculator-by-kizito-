import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Semester } from '../types';
import { calculateCGPA } from '../utils';
import { GoogleGenAI } from '@google/genai';

interface SmartInsightsProps {
  semesters: Semester[];
}

export function SmartInsights({ semesters }: SmartInsightsProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (semesters.length === 0 || semesters.every(s => s.courses.length === 0)) {
      setInsight(null);
      return;
    }

    const fetchInsight = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("No API key");

        const ai = new GoogleGenAI({ apiKey });
        const cgpa = calculateCGPA(semesters);
        
        const summary = semesters.map(s => {
          const credits = s.courses.reduce((sum, c) => sum + c.creditUnit, 0);
          const points = s.courses.reduce((sum, c) => {
            const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }[c.grade] || 0;
            return sum + (gradePoints * c.creditUnit);
          }, 0);
          const gpa = credits > 0 ? points / credits : 0;
          return `${s.name || s.level + ' ' + s.term}: GPA ${gpa.toFixed(2)} (${credits} credits)`;
        }).join('\n');

        const prompt = `You are an academic advisor. A university student has a current CGPA of ${cgpa.toFixed(2)} on a 5.0 scale.
Here is their semester-by-semester performance:
${summary}

Provide a very short, encouraging, and actionable insight (max 2 sentences). 
Examples: "You are close to First Class! Maintain at least a 4.2 next semester." or "Your grades dipped slightly last semester. Focus on high-credit courses to bounce back."
Do not use markdown formatting, just plain text.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });

        setInsight(response.text || "Keep up the good work!");
      } catch (error) {
        console.error("Failed to fetch insight:", error);
        const cgpa = calculateCGPA(semesters);
        if (cgpa >= 4.5) setInsight("Excellent work! You are maintaining a First Class. Keep it up!");
        else if (cgpa >= 4.0) setInsight("You are very close to a First Class! A strong push next semester can get you there.");
        else if (cgpa >= 3.5) setInsight("Solid Second Class Upper. Focus on your core courses to boost your CGPA further.");
        else if (cgpa >= 2.4) setInsight("You're in the Second Class Lower range. Try targeting a 4.0+ GPA next semester to climb higher.");
        else setInsight("Keep pushing! Every extra point counts towards improving your standing.");
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchInsight, 1500);
    return () => clearTimeout(timeoutId);
  }, [semesters]);

  if (semesters.length === 0 || semesters.every(s => s.courses.length === 0)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-3xl p-5 mb-6 border border-violet-100 dark:border-violet-800/30 flex items-start gap-4 transition-colors shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-1">Smart Insight</h4>
        <p className="text-sm text-violet-800/80 dark:text-violet-300/80 leading-relaxed">
          {loading ? "Analyzing your performance..." : insight}
        </p>
      </div>
    </div>
  );
}
