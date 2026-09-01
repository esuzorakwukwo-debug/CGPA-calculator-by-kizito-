import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculateCGPA, getDegreeClass, calculateGPA } from '../utils';
import { Semester } from '../types';
import { TrendingUp, TrendingDown, Minus, Award, BookOpen, GraduationCap, BarChart3, Eye, EyeOff } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface DashboardProps {
  semesters: Semester[];
  isPrivacyBlurred?: boolean;
  onTogglePrivacy?: () => void;
}

export function Dashboard({ semesters, isPrivacyBlurred = false, onTogglePrivacy }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cgpa = calculateCGPA(semesters);
  const degreeClass = getDegreeClass(cgpa);
  
  const totalCredits = semesters.reduce((sum, sem) => 
    sum + sem.courses.reduce((cSum, c) => cSum + c.creditUnit, 0), 0
  );

  const totalCourses = semesters.reduce((sum, sem) => sum + sem.courses.length, 0);

  const gradeDistribution = useMemo(() => {
    const dist = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        if (dist[course.grade as keyof typeof dist] !== undefined) {
          dist[course.grade as keyof typeof dist]++;
        }
      });
    });
    return [
      { name: 'A', count: dist.A, color: '#10b981' }, // emerald-500
      { name: 'B', count: dist.B, color: '#3b82f6' }, // blue-500
      { name: 'C', count: dist.C, color: '#f59e0b' }, // amber-500
      { name: 'D', count: dist.D, color: '#f97316' }, // orange-500
      { name: 'E', count: dist.E, color: '#ef4444' }, // red-500
      { name: 'F', count: dist.F, color: '#b91c1c' }, // red-700
    ];
  }, [semesters]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Grade {label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-bold" style={{ color: payload[0].payload.color }}>{payload[0].value}</span> courses
          </p>
        </div>
      );
    }
    return null;
  };

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <motion.div
        id="tour-dashboard-gpa"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-violet-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-300"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-indigo-100 dark:text-indigo-200 font-medium text-xs sm:text-sm tracking-wide uppercase">Cumulative GPA</h2>
              {onTogglePrivacy && (
                <button
                  type="button"
                  onClick={onTogglePrivacy}
                  aria-label={isPrivacyBlurred ? 'Show CGPA' : 'Hide CGPA'}
                  aria-pressed={isPrivacyBlurred}
                  title={isPrivacyBlurred ? 'Show CGPA' : 'Hide CGPA'}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 -mt-1 rounded-xl p-2.5 text-indigo-100 hover:text-white hover:bg-white/10 dark:hover:bg-black/20 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {isPrivacyBlurred ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
            <div className="flex items-end gap-2.5 sm:gap-3">
              <span className={`text-5xl sm:text-6xl font-bold tracking-tight transition-all duration-300 ${isPrivacyBlurred ? 'filter blur-md select-none opacity-80' : ''}`}>
                <AnimatedNumber value={cgpa} />
              </span>
              <span className="text-indigo-200 dark:text-indigo-300 text-lg sm:text-xl font-medium mb-1 sm:mb-2">/ 5.00</span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/20 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 ${isPrivacyBlurred ? 'filter blur-sm select-none' : ''}`}>
              <Award size={15} />
              {degreeClass.label}
            </div>
            
            {feedback && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/90 dark:bg-gray-900/90 ${feedback.color} shadow-sm transition-all duration-300 ${isPrivacyBlurred ? 'filter blur-sm select-none' : ''}`}>
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
        className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-1 items-center justify-between gap-3 md:gap-6 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Credits</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalCredits}</p>
          </div>
        </div>
        
        <div className="hidden md:block h-px w-full bg-gray-100 dark:bg-gray-800"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalCourses}</p>
          </div>
        </div>
      </motion.div>

      {totalCourses > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-3 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-6">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Grade Distribution</h3>
          </div>
          
          <div className="w-full h-[210px] sm:h-[260px] md:h-[280px]">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                <BarChart data={gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
