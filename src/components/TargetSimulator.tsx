import { useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { Semester } from '../types';
import { calculateCGPA } from '../utils';

interface TargetSimulatorProps {
  semesters: Semester[];
}

export function TargetSimulator({ semesters }: TargetSimulatorProps) {
  const [targetCGPA, setTargetCGPA] = useState<string>('');
  const [nextCredits, setNextCredits] = useState<string>('15');

  const currentCGPA = calculateCGPA(semesters);
  const totalCurrentPoints = semesters.reduce((sum, sem) => 
    sum + sem.courses.reduce((cSum, c) => {
      const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }[c.grade] || 0;
      return cSum + (gradePoints * c.creditUnit);
    }, 0), 0
  );
  
  const totalCurrentCredits = semesters.reduce((sum, sem) => 
    sum + sem.courses.reduce((cSum, c) => cSum + c.creditUnit, 0), 0
  );

  let requiredGPA: number | null = null;
  let isPossible = true;

  if (targetCGPA && nextCredits) {
    const target = parseFloat(targetCGPA);
    const credits = parseInt(nextCredits, 10);
    
    if (!isNaN(target) && !isNaN(credits) && credits > 0) {
      const totalRequiredPoints = target * (totalCurrentCredits + credits);
      const pointsNeeded = totalRequiredPoints - totalCurrentPoints;
      requiredGPA = pointsNeeded / credits;
      
      if (requiredGPA > 5.0) {
        isPossible = false;
      }
    }
  }

  if (semesters.length === 0 || semesters.every(s => s.courses.length === 0)) {
    return null;
  }

  return (
    <div id="tour-target-simulator" className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Target size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Target Simulator</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target CGPA</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.01"
            value={targetCGPA}
            onChange={(e) => setTargetCGPA(e.target.value)}
            placeholder="e.g. 4.50"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Next Semester Credits</label>
          <input
            type="number"
            min="1"
            step="1"
            value={nextCredits}
            onChange={(e) => setNextCredits(e.target.value)}
            placeholder="e.g. 15"
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {requiredGPA !== null && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${isPossible ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
          <ArrowRight size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">
              {isPossible 
                ? `You need a GPA of ${Math.max(0, requiredGPA).toFixed(2)} next semester to reach ${targetCGPA}.` 
                : `It's mathematically impossible to reach ${targetCGPA} next semester (requires ${requiredGPA.toFixed(2)} GPA).`}
            </p>
            {isPossible && requiredGPA < 0 && (
              <p className="text-xs mt-1 opacity-80">You've already secured this target even if you fail all courses!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
