import { useState, useEffect } from 'react';
import { Plus, Trash2, GraduationCap, Sun, Moon, Sparkles, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Semester } from './types';
import { LEVELS, TERMS } from './constants';
import { Dashboard } from './components/Dashboard';
import { SemesterCard } from './components/SemesterCard';
import { TargetSimulator } from './components/TargetSimulator';
import { SmartInsights } from './components/SmartInsights';
import { ConfirmModal } from './components/ConfirmModal';
import { ShareModal } from './components/ShareModal';
import { calculateCGPA, getDegreeClass } from './utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function App() {
  const [semesters, setSemesters] = useLocalStorage<Semester[]>('cgpa-pro-data', []);
  const [isDark, setIsDark] = useLocalStorage('cgpa-pro-theme', false);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [newLevel, setNewLevel] = useState(LEVELS[0]);
  const [newTerm, setNewTerm] = useState(TERMS[0]);
  const [customName, setCustomName] = useState('');
  
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const cgpa = calculateCGPA(semesters);
  const totalCredits = semesters.reduce((sum, sem) => 
    sum + sem.courses.reduce((cSum, c) => cSum + c.creditUnit, 0), 0
  );
  const degreeClass = getDegreeClass(cgpa).label;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAddSemester = () => {
    const newSemester: Semester = {
      id: crypto.randomUUID(),
      level: newLevel,
      term: newTerm,
      name: customName.trim() || `${newLevel} - ${newTerm}`,
      courses: [],
    };
    setSemesters([...semesters, newSemester]);
    setIsAddingSemester(false);
    setCustomName('');
  };

  const handleUpdateSemester = (id: string, updatedSemester: Semester) => {
    setSemesters(semesters.map((s) => (s.id === id ? updatedSemester : s)));
  };

  const handleDeleteSemester = () => {
    if (semesterToDelete) {
      setSemesters(semesters.filter((s) => s.id !== semesterToDelete));
      setSemesterToDelete(null);
    }
  };

  const handleReset = () => {
    setSemesters([]);
    setIsResetting(false);
  };

  const handleExport = async () => {
    const element = document.getElementById('export-content');
    if (!element) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: isDark ? '#030712' : '#f9fafb' 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CGPA_Report.pdf');
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap size={22} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                CGPA Pro <span className="text-sm font-medium text-gray-400 dark:text-gray-500 ml-1">by Kizito</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">Track. Improve. Graduate Strong.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {semesters.length > 0 && (
              <>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Share Result"
                >
                  <Share2 size={18} />
                  <span className="hidden sm:inline text-sm font-medium">Share</span>
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Export as PDF"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline text-sm font-medium">{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>
              </>
            )}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {semesters.length > 0 && (
              <button
                onClick={() => setIsResetting(true)}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Reset All</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="export-content">
        <Dashboard semesters={semesters} />
        <SmartInsights semesters={semesters} />
        <TargetSimulator semesters={semesters} />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Semesters</h2>
          {!isAddingSemester && (
            <button
              onClick={() => setIsAddingSemester(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-500/20"
            >
              <Plus size={16} />
              Add Semester
            </button>
          )}
        </div>

        <AnimatePresence>
          {isAddingSemester && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Level</label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none text-gray-900 dark:text-white"
                    >
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Term</label>
                    <select
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none text-gray-900 dark:text-white"
                    >
                      {TERMS.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Custom Name (Optional)</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={`e.g. Year 2 Rain Semester`}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleAddSemester}
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-500/20"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setIsAddingSemester(false)}
                      className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {semesters.length === 0 && !isAddingSemester ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-32 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
              <Sparkles size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 relative z-10">Your academic journey starts here</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-8 relative z-10">
              Add your first semester to start tracking your courses, grades, and calculate your CGPA.
            </p>
            <button
              onClick={() => setIsAddingSemester(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 relative z-10"
            >
              <Plus size={18} />
              Add Your First Semester
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {semesters.map((semester) => (
                <SemesterCard
                  key={semester.id}
                  semester={semester}
                  onUpdate={handleUpdateSemester}
                  onDelete={(id) => setSemesterToDelete(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={semesterToDelete !== null}
        title="Delete Semester"
        message="Are you sure you want to delete this semester? All courses inside it will be lost."
        confirmText="Delete"
        onConfirm={handleDeleteSemester}
        onCancel={() => setSemesterToDelete(null)}
      />

      <ConfirmModal
        isOpen={isResetting}
        title="Reset All Data"
        message="Are you sure you want to delete all semesters and courses? This action cannot be undone."
        confirmText="Reset All"
        onConfirm={handleReset}
        onCancel={() => setIsResetting(false)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        cgpa={cgpa}
        totalCredits={totalCredits}
        degreeClass={degreeClass}
      />

      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-auto text-center w-full">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Built by <span className="font-medium text-gray-600 dark:text-gray-300">Kizito Atelier</span>
        </p>
      </footer>
    </div>
  );
}
