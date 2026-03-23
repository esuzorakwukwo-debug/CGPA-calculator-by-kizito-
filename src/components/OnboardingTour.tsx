import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

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
    
    const targetEl = document.getElementById(currentStep.targetId);
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentStep, isActive]);

  // Update rects continuously for animations/resizes without interrupting scroll
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
    };

    const timeoutId = setTimeout(updateRects, 50);
    const intervalId = setInterval(updateRects, 100); // Fast update for smooth tracking

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [currentStep, isActive, windowSize]);

  // Handle z-index for highlighted elements (The Blur Bug Fix)
  useEffect(() => {
    if (!isActive || !currentStep) return;

    const targetIds = currentStep.highlightIds || [currentStep.targetId];
    const elements = targetIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    // Find all parents that create stacking contexts to elevate them too
    const elementsToElevate = new Set<HTMLElement>();
    
    elements.forEach(el => {
      elementsToElevate.add(el);
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        // If the parent has a z-index other than auto, or is sticky/fixed/absolute/relative, it might create a stacking context
        if (
          style.zIndex !== 'auto' || 
          style.position === 'sticky' || 
          style.position === 'fixed' ||
          style.transform !== 'none' ||
          style.opacity !== '1'
        ) {
          elementsToElevate.add(parent);
        }
        parent = parent.parentElement;
      }
    });

    const elevatedElements = Array.from(elementsToElevate);

    // Store original styles to restore them later
    const originalStyles = elevatedElements.map(el => ({
      position: el.style.getPropertyValue('position'),
      positionPriority: el.style.getPropertyPriority('position'),
      zIndex: el.style.getPropertyValue('z-index'),
      zIndexPriority: el.style.getPropertyPriority('z-index'),
    }));

    elevatedElements.forEach(el => {
      const currentPos = window.getComputedStyle(el).position;
      if (currentPos === 'static') {
        el.style.setProperty('position', 'relative', 'important');
      }
      el.style.setProperty('z-index', '9999', 'important');
    });

    return () => {
      elevatedElements.forEach((el, index) => {
        const orig = originalStyles[index];
        if (orig.position) {
          el.style.setProperty('position', orig.position, orig.positionPriority);
        } else {
          el.style.removeProperty('position');
        }
        
        if (orig.zIndex) {
          el.style.setProperty('z-index', orig.zIndex, orig.zIndexPriority);
        } else {
          el.style.removeProperty('z-index');
        }
      });
    };
  }, [currentStep, isActive]);

  // Handle click-to-advance steps
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
      // Allow clicks inside the tooltip
      const tooltip = document.getElementById('tour-tooltip');
      if (tooltip && tooltip.contains(e.target as Node)) {
        return;
      }
      
      // If it's a waitForClick step, allow clicks on the target
      if (currentStep?.waitForClick) {
        const target = document.getElementById(currentStep.waitForClick);
        if (target && target.contains(e.target as Node)) {
          return;
        }
      }

      // Otherwise, block the interaction
      e.stopPropagation();
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Block clicks and touches outside the tooltip
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

  return (
    <AnimatePresence>
      {isActive && currentStep && (
        <>
          {/* Overlay Container - z-[9998] so target elements (z-[9999]) sit above it */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9998] pointer-events-none"
          >
            {/* Dimmed Background Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />

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
                className="absolute bg-transparent border-2 border-indigo-500 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)] pointer-events-none"
              />
            ))}
          </motion.div>

          {/* Tooltip Container - z-[10001] so it sits above both overlay and target elements */}
          <motion.div className="fixed inset-0 z-[10001] pointer-events-none">
            <AnimatePresence mode="wait">
              {targetRect && (
                <motion.div
                  key={currentStep.id}
                  id="tour-tooltip"
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute pointer-events-auto w-full max-w-sm"
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
                        <X size={16} />
                      </button>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
                      {currentStep.text}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <button
                        onClick={handleSkip}
                        className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                      >
                        Skip Tour
                      </button>

                      <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                          <button
                            onClick={handleBack}
                            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                        )}
                        {!currentStep.waitForClick && (
                          <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                          >
                            {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                            {currentStepIndex !== TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                    
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

