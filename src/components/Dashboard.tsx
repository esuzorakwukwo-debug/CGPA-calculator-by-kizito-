import { motion } from 'motion/react';
import { calculateCGPA, getDegreeClass, calculateGPA } from '../utils';
import { Semester } from '../types';
import { TrendingUp, TrendingDown, Minus, Award, BookOpen, GraduationCap } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface DashboardProps {
  semesters: Semester[];
}

export function Dashboard({ semesters }: DashboardProps) {
  const cgpa = calculateCGPA(semesters);
  const degreeClass = getDegreeClass(cgpa);
  
  const totalCredits = semesters.reduce((sum, sem) => 
    sum + sem.courses.reduce((cSum, c) => cSum + c.creditUnit, 0), 0
  );

  const totalCourses = semesters.reduce((sum, sem) => sum + sem.courses.length, 0);

  // Calculate performance feedback
  let feedback = null;
  if (semesters.length >= 2) {
    const lastSem = semesters[semesters.length - 1];
    const prevSem = semesters[semesters.length - 2];
    
    const lastGpa = calculateGPA(lastSem.courses);
    const prevGpa = calculateGPA(prevSem.courses);
    
    const diff = lastGpa - prevGpa;
    
    if (diff > 0) {
      feedback = {
        text: `Improved by +${diff.toFixed(2)}`,
        icon: <TrendingUp size={16} className="text-emerald-500" />,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10'
      };
    } else if (diff < 0) {
      feedback = {
        text: `Dropped by ${Math.abs(diff).toFixed(2)}`,
        icon: <TrendingDown size={16} className="text-red-500" />,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-500/10'
      };
    } else {
      feedback = {
        text: `Maintained GPA`,
        icon: <Minus size={16} className="text-gray-500 dark:text-gray-400" />,
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-800'
      };
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-violet-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-300"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <h2 className="text-indigo-100 dark:text-indigo-200 font-medium text-sm tracking-wide uppercase mb-1">Cumulative GPA</h2>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-bold tracking-tight"><AnimatedNumber value={cgpa} /></span>
              <span className="text-indigo-200 dark:text-indigo-300 text-xl font-medium mb-2">/ 5.00</span>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 dark:bg-black/20 backdrop-blur-sm`}>
              <Award size={16} />
              {degreeClass.label}
            </div>
            
            {feedback && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/90 dark:bg-gray-900/90 ${feedback.color} shadow-sm`}>
                {feedback.icon}
                {feedback.text}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 flex flex-col justify-center gap-6 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Credits</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCredits}</p>
          </div>
        </div>
        
        <div className="h-px w-full bg-gray-100 dark:bg-gray-800"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCourses}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
