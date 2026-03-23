import { useState, useMemo, useEffect } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Calculator, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Semester } from '../types';
import { calculateCGPA } from '../utils';

interface CgpaPlannerProps {
  semesters: Semester[];
}

export function CgpaPlanner({ semesters }: CgpaPlannerProps) {
  const [durationOption, setDurationOption] = useState<string>('8');
  const [manualSemesters, setManualSemesters] = useState<string>('8');
  const [targetCgpaInput, setTargetCgpaInput] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  const completedSemesters = semesters.length;
  
  const totalSemesters = durationOption === 'custom' 
    ? parseInt(manualSemesters) || 0 
    : parseInt(durationOption);

  const remainingSemesters = Math.max(0, totalSemesters - completedSemesters);
  
  const currentCgpa = calculateCGPA(semesters);
  const totalCompletedCredits = semesters.reduce((sum, sem) => 
    sum + sem.courses.reduce((cSum, c) => cSum + c.creditUnit, 0), 0
  );

  const averageCreditsPerSemester = completedSemesters > 0 ? totalCompletedCredits / completedSemesters : 0;
  const estimatedRemainingCredits = remainingSemesters * averageCreditsPerSemester;

  // Reset results if inputs change to encourage recalculation, 
  // though we can also just let it update dynamically.
  useEffect(() => {
    setShowResults(false);
  }, [durationOption, manualSemesters, targetCgpaInput, semesters]);

  const handleCalculate = () => {
    setShowResults(true);
  };

  const renderResults = () => {
    if (!showResults) return null;

    if (completedSemesters === 0) {
      return (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl flex items-start gap-3 border border-amber-200 dark:border-amber-800/30">
          <Info className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm">Please add at least one semester with courses to use the CGPA Planner.</p>
        </div>
      );
    }

    if (remainingSemesters === 0) {
      return (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-xl flex items-start gap-3 border border-blue-200 dark:border-blue-800/30">
          <Info className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm">You have already completed all {totalSemesters} semesters! Your final CGPA is {currentCgpa.toFixed(2)}.</p>
        </div>
      );
    }

    const target = parseFloat(targetCgpaInput);
    const isTargetMode = !isNaN(target) && targetCgpaInput.trim() !== '';

    if (isTargetMode) {
      const requiredGpa = (target * (totalCompletedCredits + estimatedRemainingCredits) - currentCgpa * totalCompletedCredits) / estimatedRemainingCredits;

      if (requiredGpa > 5.0) {
        return (
          <div className="mt-6 p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <AlertCircle size={20} />
              <h4 className="font-semibold">Target Not Achievable</h4>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200 mb-4">
              To reach a {target.toFixed(2)} CGPA, you would need an average GPA of <span className="font-bold">{requiredGpa.toFixed(2)}</span> in your remaining {remainingSemesters} semesters, which is above the 5.0 maximum.
            </p>
            <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl text-xs text-red-700 dark:text-red-300">
              <span className="font-semibold block mb-1">Insight:</span>
              Focus on maximizing your grades to get as close to your target as possible. Every high-credit course counts!
            </div>
          </div>
        );
      }

      if (requiredGpa <= 0) {
        return (
          <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 size={20} />
              <h4 className="font-semibold">Target Already Exceeded</h4>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4">
              Your current CGPA ({currentCgpa.toFixed(2)}) is already well above your target. Even with a 0.0 GPA in remaining semesters, you would stay above {target.toFixed(2)}.
            </p>
            <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
              <span className="font-semibold block mb-1">Insight:</span>
              Keep up the excellent work! Aim for consistency to maintain your stellar record.
            </div>
          </div>
        );
      }

      return (
        <div className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <Target size={20} />
            <h4 className="font-semibold">Target Achievable</h4>
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4">
            To reach a {target.toFixed(2)} CGPA, you need an average GPA of <span className="font-bold text-lg">{requiredGpa.toFixed(2)}</span> in your remaining {remainingSemesters} semesters.
          </p>
          <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
            <span className="font-semibold block mb-1">Insight:</span>
            {requiredGpa > currentCgpa 
              ? "You'll need to perform slightly better than your current average. Focus on high-credit courses to boost your GPA faster."
              : "Aim for consistency. Maintaining your current study habits will comfortably get you to your goal."}
          </div>
        </div>
      );
    }

    // Maximize Mode
    const maxPossibleCgpa = ((5.0 * estimatedRemainingCredits) + (currentCgpa * totalCompletedCredits)) / (totalCompletedCredits + estimatedRemainingCredits);

    return (
      <div className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-4">
          <TrendingUp size={20} />
          <h4 className="font-semibold">Maximize Your Potential</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl">
            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium mb-1 uppercase tracking-wider">Projected CGPA</p>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{currentCgpa.toFixed(2)}</p>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70 mt-1">If you maintain current trend</p>
          </div>
          <div className="bg-white/60 dark:bg-black/20 p-4 rounded-xl">
            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 font-medium mb-1 uppercase tracking-wider">Maximum Possible</p>
            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{maxPossibleCgpa.toFixed(2)}</p>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70 mt-1">With 5.0 in remaining sems</p>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl text-xs text-indigo-800 dark:text-indigo-200">
          <span className="font-semibold block mb-1">Insight:</span>
          To maximize your CGPA, aim for a GPA of ≥ 4.5 in your remaining semesters. Focus heavily on high-credit courses as they have the most impact on your final grade.
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-inner">
          <Target size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CGPA Planner</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plan your academic performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Left Column: Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Total Program Duration
            </label>
            <select
              value={durationOption}
              onChange={(e) => setDurationOption(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white appearance-none"
            >
              <option value="8">4 years (8 semesters)</option>
              <option value="10">5 years (10 semesters)</option>
              <option value="12">6 years (12 semesters)</option>
              <option value="custom">Custom duration...</option>
            </select>
          </div>

          {durationOption === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Total Semesters
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={manualSemesters}
                onChange={(e) => setManualSemesters(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white"
                placeholder="e.g., 8"
              />
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Target CGPA</span>
              <span className="text-xs text-gray-400 font-normal">Optional</span>
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.01"
              value={targetCgpaInput}
              onChange={(e) => setTargetCgpaInput(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white"
              placeholder="e.g., 4.50"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Leave blank to see how to maximize your final CGPA.
            </p>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            <Calculator size={18} />
            Calculate Plan
          </button>
        </div>

        {/* Right Column: Stats & Results */}
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedSemesters} <span className="text-sm font-medium text-gray-400">sems</span></p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{remainingSemesters} <span className="text-sm font-medium text-gray-400">sems</span></p>
            </div>
          </div>

          {renderResults()}
        </div>
      </div>
    </div>
  );
}
