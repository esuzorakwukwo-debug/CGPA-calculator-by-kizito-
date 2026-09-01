import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  id: string;
  targetId: string;
  title: string;
  text: string;
  waitForClick?: string;
  highlightIds?: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-academic-standing',
    targetId: 'tour-dashboard-gpa',
    title: 'Academic Standing & Privacy',
    text: 'View your real-time CGPA, degree classification, and completed credits. Tap the Eye icon anytime in public or study halls to blur your academic records instantly.',
  },
  {
    id: 'step-add-semester',
    targetId: 'tour-add-semester-btn',
    title: 'Adding a Semester',
    text: 'Organize your academic journey term by term. Select your level (100L–600L) and term (1st or 2nd Semester), or provide a custom name like "Industrial Training".',
  },
  {
    id: 'step-single-add',
    targetId: 'tour-single-add',
    title: 'Adding Single Courses',
    text: 'Use "Add Course" to enter individual courses with their course code, assigned credit units, and letter grade.',
  },
  {
    id: 'step-units-grades',
    targetId: 'tour-course-item-first',
    title: 'Units, Grades & GPA Math',
    text: 'Courses are weighted by Credit Units (1–12) and Nigerian Grade Points (A=5, B=4, C=3, D=2, E=1, F=0). Quality Points are automatically tallied to compute your exact GPA and CGPA.',
  },
  {
    id: 'step-folding-semesters',
    targetId: 'tour-semester-header-first',
    title: 'Folding & Managing Semesters',
    text: 'Tap anywhere on a semester header to fold or unfold it. Folding keeps your dashboard tidy and focused—your courses and calculations remain fully saved and remembered across sessions.',
  },
  {
    id: 'step-quick-add',
    targetId: 'tour-bulk-add',
    title: 'Quick Multi-Course Entry',
    text: 'Need to add multiple courses quickly? Tap "Quick Add Courses" to create repeatable draft rows with "＋ Add Another Course", then press "Save Courses" to commit them all at once.',
  },
  {
    id: 'step-smart-scanner',
    targetId: 'tour-smart-scanner-btn',
    title: 'Smart Course Scanner',
    text: 'Save time by scanning your syllabus, course registration document, or university transcript PDF. AI automatically extracts course codes, titles, and credit units.',
  },
  {
    id: 'step-cgpa-planner',
    targetId: 'tour-cgpa-planner',
    title: 'CGPA Planner & Goal Tracker',
    text: 'Plan ahead toward your dream degree division. Set your degree duration and target CGPA to see the realistic semester-by-semester GPA needed across your remaining degree.',
  },
  {
    id: 'step-actions',
    targetId: 'tour-actions-btn',
    title: 'Actions, Reports & Transcripts',
    text: 'Generate official Full Transcript PDFs, export Share Snapshot cards, switch themes, or review data protection policies anytime from the Actions menu.',
  },
];

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ isActive, onComplete }: OnboardingTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [highlightRects, setHighlightRects] = useState<DOMRect[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [tooltipHeight, setTooltipHeight] = useState<number>(240);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth scroll to target when step changes
  useEffect(() => {
    if (!isActive || !currentStep) return;
    
    if (currentStep.targetId === 'tour-actions-btn') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetEl = document.getElementById(currentStep.targetId);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      }
    }
  }, [currentStepIndex, currentStep, isActive]);

  // Update rects continuously for animations/resizes/scrolls
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updateRects = () => {
      const targetEl = document.getElementById(currentStep.targetId);
      if (targetEl) {
        setTargetRect(targetEl.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }

      if (currentStep.highlightIds) {
        const rects = currentStep.highlightIds
          .map(id => document.getElementById(id)?.getBoundingClientRect())
          .filter(Boolean) as DOMRect[];
        setHighlightRects(rects);
      } else {
        setHighlightRects([]);
      }

      if (tooltipRef.current) {
        const h = tooltipRef.current.offsetHeight;
        if (h > 0) {
          setTooltipHeight(h);
        }
      }
    };

    updateRects();
    window.addEventListener('scroll', updateRects, { passive: true });
    window.addEventListener('resize', updateRects, { passive: true });

    const intervalId = setInterval(updateRects, 60);

    return () => {
      window.removeEventListener('scroll', updateRects);
      window.removeEventListener('resize', updateRects);
      clearInterval(intervalId);
    };
  }, [currentStep, isActive, windowSize]);

  // Keyboard navigation and click blocking
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        if (!currentStep?.waitForClick) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    const blockInteractions = (e: Event) => {
      const tooltip = document.getElementById('tour-tooltip');
      if (tooltip && tooltip.contains(e.target as Node)) {
        return;
      }
      
      if (currentStep?.waitForClick) {
        const target = document.getElementById(currentStep.waitForClick);
        if (target && target.contains(e.target as Node)) {
          return;
        }
      }

      e.stopPropagation();
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    
    document.addEventListener('click', blockInteractions, true);
    document.addEventListener('mousedown', blockInteractions, true);
    document.addEventListener('mouseup', blockInteractions, true);
    document.addEventListener('touchstart', blockInteractions, true);
    document.addEventListener('touchend', blockInteractions, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', blockInteractions, true);
      document.removeEventListener('mousedown', blockInteractions, true);
      document.removeEventListener('mouseup', blockInteractions, true);
      document.removeEventListener('touchstart', blockInteractions, true);
      document.removeEventListener('touchend', blockInteractions, true);
    };
  }, [isActive, currentStepIndex, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const rectsToDraw = highlightRects.length > 0 ? highlightRects : (targetRect ? [targetRect] : []);

  // Adaptive Clearance and Collision-Free Positioning
  const clearance = 16;
  const cardWidth = Math.min(windowSize.width - 32, 380);
  const cardHeight = tooltipHeight || 240;

  let computedTop = 16;
  let computedLeft = 16;

  if (targetRect) {
    // 1. Horizontal positioning: Center horizontally relative to target with 16px viewport margins
    const targetCenterX = targetRect.left + targetRect.width / 2;
    computedLeft = targetCenterX - cardWidth / 2;
    computedLeft = Math.max(16, Math.min(computedLeft, windowSize.width - cardWidth - 16));

    // 2. Vertical positioning: Measure space above and below with 16px clearance
    const spaceBelow = windowSize.height - targetRect.bottom - clearance;
    const spaceAbove = targetRect.top - clearance;

    if (spaceBelow >= cardHeight + clearance) {
      // Ample space below the highlighted element
      computedTop = targetRect.bottom + clearance;
    } else if (spaceAbove >= cardHeight + clearance) {
      // Ample space above the highlighted element
      computedTop = targetRect.top - cardHeight - clearance;
    } else {
      // Tight mobile viewport fallback: Place on side with more space, strictly respecting viewport bounds
      if (spaceBelow >= spaceAbove) {
        computedTop = Math.max(targetRect.bottom + clearance, windowSize.height - cardHeight - 16);
      } else {
        computedTop = Math.min(targetRect.top - cardHeight - clearance, 16);
      }
    }

    // Safety clamp within viewport bounds
    computedTop = Math.max(16, Math.min(computedTop, Math.max(16, windowSize.height - cardHeight - 16)));
  } else {
    // Fallback if target element is momentarily not found
    computedLeft = Math.max(16, (windowSize.width - cardWidth) / 2);
    computedTop = Math.max(16, (windowSize.height - cardHeight) / 2);
  }

  return (
    <AnimatePresence>
      {isActive && currentStep && (
        <>
          {/* SVG Dimmed Overlay with Physical Cutouts for Highlighted Targets */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
          >
            <svg className="w-full h-full" width="100%" height="100%">
              <defs>
                <mask id="tour-spotlight-mask">
                  {/* White background: creates dark overlay */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {/* Black rects: punch out crystal clear holes over targets */}
                  {rectsToDraw.map((rect, i) => (
                    <rect
                      key={`mask-cutout-${i}`}
                      x={rect.left - 6}
                      y={rect.top - 6}
                      width={rect.width + 12}
                      height={rect.height + 12}
                      rx="14"
                      ry="14"
                      fill="black"
                    />
                  ))}
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.65)"
                mask="url(#tour-spotlight-mask)"
              />
            </svg>
          </motion.div>

          {/* Glowing Animated Spotlight Ring - z-[9999] directly above mask */}
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            {rectsToDraw.map((rect, i) => (
              <motion.div
                key={`${currentStep.id}-spotlight-ring-${i}`}
                initial={false}
                animate={{
                  top: rect.top - 6,
                  left: rect.left - 6,
                  width: rect.width + 12,
                  height: rect.height + 12,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="absolute bg-transparent border-2 border-indigo-400 dark:border-indigo-400 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_0_24px_rgba(99,102,241,0.7)] pointer-events-none ring-4 ring-indigo-500/20"
              />
            ))}
          </div>

          {/* Tooltip Container - z-[10001] so it sits above both overlay and target elements */}
          <motion.div className="fixed inset-0 z-[10001] pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                ref={tooltipRef}
                id="tour-tooltip"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute pointer-events-auto w-full max-w-sm"
                style={{
                  top: computedTop,
                  left: computedLeft,
                  width: cardWidth,
                }}
              >
                  <div className="bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-700/80 rounded-2xl p-5 shadow-2xl text-white">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                          Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                        </span>
                      </div>
                      <button 
                        onClick={handleSkip}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center p-2.5 text-gray-400 hover:text-white rounded-full transition-colors"
                        title="Close Tour"
                        aria-label="Close Tour"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5">
                      {currentStep.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed text-gray-300">
                      {currentStep.text}
                    </p>

                    <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between">
                      <button
                        onClick={handleSkip}
                        className="min-h-[44px] flex items-center text-gray-400 hover:text-white transition-colors text-xs font-semibold px-2 py-2"
                      >
                        Skip Tour
                      </button>

                      <div className="flex items-center gap-2">
                        {currentStepIndex > 0 && (
                          <button
                            onClick={handleBack}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors border border-gray-700/60"
                            title="Previous Step"
                            aria-label="Previous Step"
                          >
                            <ChevronLeft size={18} />
                          </button>
                        )}
                        <button
                          onClick={handleNext}
                          className="min-h-[44px] flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
                        >
                          <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                          {currentStepIndex !== TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
