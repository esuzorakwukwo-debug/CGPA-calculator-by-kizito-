import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share, PlusSquare, Smartphone, Check, Download } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  onTriggerNativePrompt?: () => void;
  hasNativePrompt?: boolean;
}

export function InstallModal({
  isOpen,
  onClose,
  isIOS,
  onTriggerNativePrompt,
  hasNativePrompt,
}: InstallModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 z-10 p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Install CGPA Pro</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add to your device for instant offline access</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content based on platform */}
            {hasNativePrompt ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Install CGPA Pro on your device for a full-screen, lightning-fast native experience with complete offline support.
                </p>
                <button
                  onClick={() => {
                    if (onTriggerNativePrompt) {
                      onTriggerNativePrompt();
                    }
                    onClose();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-md shadow-indigo-500/20"
                >
                  <Download size={16} />
                  <span>Install Now</span>
                </button>
              </div>
            ) : isIOS ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Follow these simple steps in <strong>Safari</strong> on iPhone or iPad to install CGPA Pro to your Home Screen:
                </p>

                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                        Tap the Share button <Share size={13} className="text-indigo-600 dark:text-indigo-400 inline" />
                      </span>
                      <p className="text-gray-500 dark:text-gray-400">Located at the bottom of Safari on iPhone (or top right on iPad).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                        Select "Add to Home Screen" <PlusSquare size={13} className="text-indigo-600 dark:text-indigo-400 inline" />
                      </span>
                      <p className="text-gray-500 dark:text-gray-400">Scroll down the share menu options to find this item.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white mb-0.5 block">
                        Tap "Add" in top-right
                      </span>
                      <p className="text-gray-500 dark:text-gray-400">The CGPA Pro icon will be placed directly onto your Home Screen.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="min-h-[44px] px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Got It
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  To install CGPA Pro, click the <strong>Install Icon</strong> in your browser's address bar or open your browser menu (⋮) and select <strong>"Install CGPA Pro"</strong>.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="min-h-[44px] px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
