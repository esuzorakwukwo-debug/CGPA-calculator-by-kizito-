import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';

interface TourStep {
  id: string;
  targetId: string;
  title?: string;
  text: string;
  waitForClick?: string; // ID of the element to wait for a click on
  highlightIds?: string[]; // Multiple IDs to highlight
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    targetId: 'tour-dashboard-gpa',
    text: 'Your academic vitals at a glance.',
  },
  {
    id: 'step-2',
    targetId: 'tour-semester-cards',
    text: 'Tap any course to edit your grades or credit units.',
  },
  {
    id: 'step-3',
    targetId: 'tour-target-simulator',
    text: 'Plan your comeback. See exactly what GPA you need to reach your goal.',
  },
  {
    id: 'step-4',
    targetId: 'tour-export-btn',
    text: 'Generate a clean, professional academic report here.',
  },
  {
    id: 'step-5',
    targetId: 'tour-add-semester-btn',
    text: 'Start building your record. Add a new level or semester here.',
    waitForClick: 'tour-add-semester-btn',
  },
  {
    id: 'step-6',
    targetId: 'tour-add-method',
    highlightIds: ['tour-single-add', 'tour-bulk-add'],
    text: 'Precision Mode: Add courses one by one for accurate tracking.\n\nThe Scholar Shortcut: Paste your full result list to fill a semester instantly.',
  },
  {
    id: 'step-7',
    targetId: 'tour-dashboard-gpa',
    text: 'Watch it grow. Your class standing updates instantly as you add results.',
  }
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

  const currentStep = TOUR_STEPS[currentStepIndex];

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updateRects = () => {
      const targetEl = document.getElementById(currentStep.targetId);
      if (targetEl) {
        setTargetRect(targetEl.getBoundingClientRect());
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    };

    // Small delay to allow UI to render/animate
    const timeoutId = setTimeout(updateRects, 300);
    const intervalId = setInterval(updateRects, 1000); // Keep it updated if things move

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [currentStep, isActive, windowSize]);

  useEffect(() => {
    if (!isActive || !currentStep?.waitForClick) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = document.getElementById(currentStep.waitForClick!);
      if (el && (el === target || el.contains(target))) {
        handleNext();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isActive || !currentStep) return null;

  const rectsToDraw = highlightRects.length > 0 ? highlightRects : (targetRect ? [targetRect] : []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed Background Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity duration-300" />

      {/* Highlights */}
      {rectsToDraw.map((rect, i) => (
        <motion.div
          key={`${currentStep.id}-highlight-${i}`}
          initial={false}
          animate={{
            top: rect.top - 10,
            left: rect.left - 10,
            width: rect.width + 20,
            height: rect.height + 20,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute bg-transparent border-2 border-indigo-500 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)] pointer-events-none z-[101]"
        />
      ))}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute z-[102] pointer-events-auto w-full max-w-sm"
            style={{
              top: targetRect.bottom + 24 > windowSize.height - 200 
                ? Math.max(16, targetRect.top - 200)
                : targetRect.bottom + 24,
              left: Math.max(16, Math.min(targetRect.left, windowSize.width - 384 - 16)),
            }}
          >
            <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-2xl text-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStepIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-gray-700'}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors text-xs font-medium"
                >
                  Skip
                </button>
              </div>
              
              <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                {currentStep.text}
              </p>

              {!currentStep.waitForClick && (
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              {currentStep.waitForClick && (
                <div className="mt-4 flex justify-end">
                  <span className="text-xs text-indigo-400 animate-pulse flex items-center gap-1">
                    Click the highlighted button to continue <ChevronRight size={14} />
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
