import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GraduationCap, Sun, Moon, Sparkles, Download, Share2, HelpCircle, Info, Smartphone, MoreVertical, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Semester } from './types';
import { LEVELS, TERMS, GRADE_POINTS } from './constants';
import { Dashboard } from './components/Dashboard';
import { SemesterCard } from './components/SemesterCard';
import { TargetSimulator } from './components/TargetSimulator';
import { SmartInsights } from './components/SmartInsights';
import { CgpaPlanner } from './components/CgpaPlanner';
import { ConfirmModal } from './components/ConfirmModal';
import { ShareModal } from './components/ShareModal';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingTour } from './components/OnboardingTour';
import { SmartPdfScanner } from './components/SmartPdfScanner';
import { AboutModal } from './components/AboutModal';
import { InstallModal } from './components/InstallModal';
import { PrivacyAssuranceModal } from './components/PrivacyAssuranceModal';
import { UpdateNotification } from './components/UpdateNotification';
import { calculateCGPA, getDegreeClass } from './utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DUMMY_SEMESTERS: Semester[] = [
  {
    id: 'dummy-1',
    level: '100L',
    term: '1st Semester',
    name: 'Year 1 First Semester',
    courses: [
      { id: 'c1', title: 'MTH 101', creditUnit: 3, grade: 'A' },
      { id: 'c2', title: 'PHY 101', creditUnit: 3, grade: 'B' },
      { id: 'c3', title: 'CHM 101', creditUnit: 3, grade: 'A' },
      { id: 'c4', title: 'BIO 101', creditUnit: 3, grade: 'C' },
    ]
  }
];

export default function App() {
  const [semesters, setSemesters] = useLocalStorage<Semester[]>('cgpa-pro-data', []);
  const [isDark, setIsDark] = useLocalStorage('cgpa-pro-theme', true);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [newLevel, setNewLevel] = useState(LEVELS[0]);
  const [newTerm, setNewTerm] = useState(TERMS[0]);
  const [customName, setCustomName] = useState('');
  
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasSeenSplash, setHasSeenSplash] = useLocalStorage('cgpa-pro-splash-seen', false);
  const [hasAcknowledgedPrivacy, setHasAcknowledgedPrivacy] = useLocalStorage('cgpa-pro-privacy-acknowledged', false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('cgpa-pro-tour-seen', false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !hasSeenSplash);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Close actions dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };
    if (isActionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  // Check standalone mode, iOS platform, and capture beforeinstallprompt
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isApple);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult && choiceResult.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Use dummy data if tour is active and no real data exists
  const displaySemesters = isTourActive && semesters.length === 0 ? DUMMY_SEMESTERS : semesters;

  const cgpa = calculateCGPA(displaySemesters);
  const totalCredits = displaySemesters.reduce((sum, sem) => 
    sum + sem.courses.reduce((cSum, c) => cSum + c.creditUnit, 0), 0
  );
  const degreeClass = getDegreeClass(cgpa).label;

  const semesterBeingDeleted = semesters.find((s) => s.id === semesterToDelete);
  const semesterDeletedCredits = semesterBeingDeleted
    ? semesterBeingDeleted.courses.reduce((sum, c) => sum + c.creditUnit, 0)
    : 0;

  useEffect(() => {
    // On first launch, once splash completes, show privacy assurance if not yet acknowledged
    if (!showSplash) {
      if (!hasAcknowledgedPrivacy) {
        setShowPrivacyModal(true);
      } else if (!hasSeenTour) {
        setIsTourActive(true);
      }
    }
  }, [showSplash, hasAcknowledgedPrivacy, hasSeenTour]);

  const handleConfirmPrivacy = () => {
    setHasAcknowledgedPrivacy(true);
    setShowPrivacyModal(false);
    if (!hasSeenTour) {
      setIsTourActive(true);
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Verify API key is detected without logging the actual key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
    console.log(`[App] Gemini API Key detected: ${!!apiKey}`);
  }, []);

  useEffect(() => {
    if (showSplash) {
      setHasSeenSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSplash, setHasSeenSplash]);

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

  const handleExport = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Helper for footer
      const addFooter = () => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(
            'Generated by CGPA Pro - Kizito Atelier',
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      };

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('ACADEMIC PERFORMANCE REPORT', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleDateString();
      doc.text(`Date Generated: ${dateStr}`, pageWidth / 2, 28, { align: 'center' });

      // Summary Section
      autoTable(doc, {
        startY: 35,
        head: [['Cumulative GPA', 'Total Credits', 'Degree Classification']],
        body: [[cgpa.toFixed(2), totalCredits.toString(), degreeClass]],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { halign: 'center', textColor: 0 },
        margin: { left: 14, right: 14 }
      });

      let finalY = (doc as any).lastAutoTable.finalY + 15;

      // Semester Tables
      displaySemesters.forEach((semester) => {
        // Check if we need a new page for the header
        if (finalY > pageHeight - 40) {
          doc.addPage();
          finalY = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`${semester.level} - ${semester.term} (${semester.name})`, 14, finalY);
        
        const tableData: any[] = semester.courses.map(course => {
          const points = (GRADE_POINTS[course.grade] || 0) * course.creditUnit;
          return [
            course.title || 'Unnamed Course',
            course.creditUnit.toString(),
            course.grade,
            points.toString()
          ];
        });

        // Add semester GPA/Credits summary row at the bottom of the table
        const semCredits = semester.courses.reduce((sum, c) => sum + c.creditUnit, 0);
        const semPoints = semester.courses.reduce((sum, c) => sum + (GRADE_POINTS[c.grade] || 0) * c.creditUnit, 0);
        const semGPA = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';
        
        tableData.push([
          { content: 'Semester Summary', styles: { fontStyle: 'bold' } },
          { content: semCredits.toString(), styles: { fontStyle: 'bold' } },
          { content: `GPA: ${semGPA}`, styles: { fontStyle: 'bold' } },
          { content: semPoints.toString(), styles: { fontStyle: 'bold' } }
        ]);

        autoTable(doc, {
          startY: finalY + 5,
          head: [['Course Code', 'Units', 'Grade', 'Points']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [243, 244, 246], textColor: 0, fontStyle: 'bold' },
          styles: { textColor: 0 },
          pageBreak: 'auto',
          margin: { left: 14, right: 14 }
        });

        finalY = (doc as any).lastAutoTable.finalY + 15;
      });

      addFooter();
      doc.save('Academic_Performance_Report.pdf');
    } catch (error: any) {
      console.error('Export failed', error);
      alert(`Failed to export PDF: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <GraduationCap size={22} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight flex items-center flex-wrap gap-x-1.5">
                <span>CGPA Pro</span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">by Kizito Atelier</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">Track. Improve. Graduate Strong.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="min-h-[44px] min-w-[44px] px-3 py-2.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-800/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm text-xs font-semibold"
                title="Install CGPA Pro"
              >
                <Smartphone size={16} />
                <span className="hidden xs:inline sm:inline">Install</span>
              </button>
            )}

            <button
              onClick={() => setIsDark(!isDark)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center"
              title="Toggle Dark Mode"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Consolidated Actions Dropdown Menu */}
            <div className="relative" ref={actionsMenuRef}>
              <button
                id="tour-actions-btn"
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                className={`min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs font-medium border ${
                  isActionsMenuOpen
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
                title="Actions & Options"
                aria-expanded={isActionsMenuOpen}
                aria-haspopup="true"
              >
                <MoreVertical size={18} />
                <span className="hidden sm:inline font-semibold">Actions</span>
              </button>

              <AnimatePresence>
                {isActionsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Tools & Reports
                    </div>

                    {displaySemesters.length > 0 && (
                      <>
                        <button
                          id="tour-export-btn"
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            handleExport();
                          }}
                          disabled={isExporting}
                          className="w-full text-left min-h-[44px] px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                        >
                          <FileText size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="font-medium">
                            {isExporting ? 'Exporting Report...' : 'Full Transcript Report (PDF)'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            setIsShareModalOpen(true);
                          }}
                          className="w-full text-left min-h-[44px] px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                        >
                          <Share2 size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="font-medium">Share Snapshot Card</span>
                        </button>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                      </>
                    )}

                    <button
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        setIsAddingSemester(false);
                        setIsTourActive(true);
                      }}
                      className="w-full text-left min-h-[44px] px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                    >
                      <HelpCircle size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
                      <span className="font-medium">Interactive Guide & Tour</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        setIsAboutModalOpen(true);
                      }}
                      className="w-full text-left min-h-[44px] px-4 py-2.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                    >
                      <Info size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
                      <span className="font-medium">About & Data Protection</span>
                    </button>

                    {displaySemesters.length > 0 && (
                      <>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                        <button
                          onClick={() => {
                            setIsActionsMenuOpen(false);
                            setIsResetting(true);
                          }}
                          className="w-full text-left min-h-[44px] px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                        >
                          <Trash2 size={16} className="shrink-0" />
                          <span className="font-medium">Clear All Semesters</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="export-content">
        <Dashboard semesters={displaySemesters} />
        <SmartInsights semesters={displaySemesters} />
        <TargetSimulator semesters={displaySemesters} />
        <CgpaPlanner semesters={displaySemesters} />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Semesters</h2>
          <div className="flex items-center gap-3">
            <SmartPdfScanner onDataExtracted={(newSemesters) => {
              const updatedSemesters = [...semesters];
              newSemesters.forEach(newSem => {
                const existingSemIndex = updatedSemesters.findIndex(
                  s => s.level === newSem.level && s.term === newSem.term
                );
                if (existingSemIndex >= 0) {
                  // Merge courses into existing semester, avoiding duplicates by course title
                  const existingCourses = updatedSemesters[existingSemIndex].courses;
                  const newUniqueCourses = newSem.courses.filter(
                    nc => !existingCourses.some(ec => ec.title.toLowerCase() === nc.title.toLowerCase())
                  );
                  updatedSemesters[existingSemIndex] = {
                    ...updatedSemesters[existingSemIndex],
                    courses: [...existingCourses, ...newUniqueCourses]
                  };
                } else {
                  // Add as new semester
                  updatedSemesters.push(newSem);
                }
              });
              setSemesters(updatedSemesters);
            }} />
            {!isAddingSemester && (
              <button
                id="tour-add-semester-btn"
                onClick={() => setIsAddingSemester(true)}
                className="min-h-[44px] flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-500/20"
              >
                <Plus size={18} />
                <span>Add Semester</span>
              </button>
            )}
          </div>
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
                      className="w-full h-11 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none text-gray-900 dark:text-white"
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
                      className="w-full h-11 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none text-gray-900 dark:text-white"
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
                      className="w-full h-11 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleAddSemester}
                      className="flex-1 sm:flex-none min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setIsAddingSemester(false)}
                      className="flex-1 sm:flex-none min-h-[44px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displaySemesters.length === 0 && !isAddingSemester ? (
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
              className="inline-flex items-center gap-2 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 relative z-10"
            >
              <Plus size={18} />
              Add Your First Semester
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4" id="tour-semester-cards">
            <AnimatePresence>
              {displaySemesters.map((semester, index) => (
                <SemesterCard
                  key={semester.id}
                  semester={semester}
                  isFirst={index === 0}
                  forceExpand={isTourActive && index === 0}
                  onUpdate={handleUpdateSemester}
                  onDelete={(id) => setSemesterToDelete(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <OnboardingTour 
        isActive={isTourActive} 
        onComplete={() => {
          setIsTourActive(false);
          setHasSeenTour(true);
        }} 
      />

      <ConfirmModal
        isOpen={semesterToDelete !== null}
        title={
          semesterBeingDeleted
            ? `Delete ${semesterBeingDeleted.name || `${semesterBeingDeleted.level} — ${semesterBeingDeleted.term}`}`
            : 'Delete Semester'
        }
        message="This will permanently delete this semester and all courses recorded within it. This action cannot be undone."
        confirmText="Delete Semester"
        details={
          semesterBeingDeleted
            ? [
                {
                  label: 'Semester',
                  value: semesterBeingDeleted.name || `${semesterBeingDeleted.level} — ${semesterBeingDeleted.term}`,
                },
                {
                  label: 'Courses Included',
                  value: `${semesterBeingDeleted.courses.length} ${semesterBeingDeleted.courses.length === 1 ? 'Course' : 'Courses'}`,
                },
                {
                  label: 'Total Credit Units',
                  value: `${semesterDeletedCredits} ${semesterDeletedCredits === 1 ? 'Unit' : 'Units'}`,
                },
              ]
            : undefined
        }
        onConfirm={handleDeleteSemester}
        onCancel={() => setSemesterToDelete(null)}
      />

      <ConfirmModal
        isOpen={isResetting}
        title="Erase All Academic Data"
        message="This will permanently delete all your semesters, courses, and calculated GPA records from this device. This cannot be undone."
        confirmText="Erase Everything"
        requireVerificationText="DELETE"
        details={[
          {
            label: 'Total Semesters',
            value: `${semesters.length} ${semesters.length === 1 ? 'Semester' : 'Semesters'}`,
          },
          {
            label: 'Total Recorded Courses',
            value: `${semesters.reduce((acc, s) => acc + s.courses.length, 0)} Courses`,
          },
          {
            label: 'Total Credit Units',
            value: `${totalCredits} Units`,
          },
        ]}
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

      <PrivacyAssuranceModal
        isOpen={showPrivacyModal}
        onConfirm={handleConfirmPrivacy}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
        isInstalled={isStandalone}
      />

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isIOS={isIOS}
        hasNativePrompt={!!deferredPrompt}
        onTriggerNativePrompt={() => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult && choiceResult.outcome === 'accepted') {
                setIsStandalone(true);
              }
              setDeferredPrompt(null);
            });
          }
        }}
      />

      <UpdateNotification enabled={!showSplash && !showPrivacyModal && !isTourActive} />

      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-auto text-center w-full flex flex-col items-center gap-3">
        {semesters.length > 0 && (
          <button
            onClick={() => setIsResetting(true)}
            className="min-h-[44px] px-4 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-4 flex items-center justify-center"
          >
            Clear All Data
          </button>
        )}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built by <span className="font-semibold text-gray-600 dark:text-gray-300">Kizito Atelier</span>
          </p>
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="min-h-[44px] px-4 py-2 text-xs text-gray-400/90 dark:text-gray-500/90 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center"
          >
            Version 1.0.1 (Release & Privacy Info)
          </button>
        </div>
      </footer>
    </div>
    </>
  );
}
