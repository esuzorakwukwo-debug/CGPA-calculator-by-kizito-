import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Database, Sparkles, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

interface PrivacyAssuranceModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export function PrivacyAssuranceModal({ isOpen, onConfirm }: PrivacyAssuranceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 z-10 max-h-[92vh] flex flex-col"
          >
            {/* Header / Identity */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-700/30 shadow-sm">
                  <ShieldCheck size={26} strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Data Protection & Privacy
                    </h3>
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">
                      100% On-Device
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your academic records are private, secure, and under your full control.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Verification Items */}
            <div className="p-6 overflow-y-auto space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
              {/* Highlight Card */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl p-3.5 flex items-start gap-3">
                <Lock className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={17} />
                <div className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  <span className="font-semibold block mb-0.5 text-emerald-900 dark:text-emerald-100">
                    Local Device Storage Only
                  </span>
                  Your manually entered courses, grades, semesters, Target Simulator goals, and CGPA calculations are stored exclusively on your device's browser.
                </div>
              </div>

              {/* Point 1: No Cloud DB */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <Database className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                    Zero Remote Servers & No Account Creation
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    No sign-up, email, or password required. CGPA Pro has no external user databases and attaches zero telemetry or tracking analytics.
                  </p>
                </div>
              </div>

              {/* Point 2: AI Scanner Disclosure */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <Sparkles className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                    Transparent Smart PDF Scanner Disclosure
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    Only when you explicitly choose to upload a document to the Smart PDF Scanner is that document's text transmitted to Google Gemini to extract course titles and units. Your manual records are never shared.
                  </p>
                </div>
              </div>

              {/* Point 3: Offline capability */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <Cpu className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-0.5">
                    Full Offline Independence
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    All grade computations, GPA predictions, and graduation modeling work 100% offline without requiring internet access.
                  </p>
                </div>
              </div>
            </div>

            {/* Acknowledgment Action */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Acknowledged once upon first launch</span>
              </div>
              <button
                onClick={onConfirm}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>I Understand — Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
