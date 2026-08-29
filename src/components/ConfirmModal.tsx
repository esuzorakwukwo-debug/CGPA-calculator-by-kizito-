import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface DetailItem {
  label: string;
  value: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  details?: DetailItem[];
  requireVerificationText?: string;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  details,
  requireVerificationText,
}: ConfirmModalProps) {
  const [verificationInput, setVerificationInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVerificationInput('');
    }
  }, [isOpen]);

  const isConfirmDisabled =
    !!requireVerificationText &&
    verificationInput.trim().toUpperCase() !== requireVerificationText.toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                {requireVerificationText ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{message}</p>

                {details && details.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 mb-4 border border-gray-100 dark:border-gray-700/60 space-y-1.5">
                    {details.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {requireVerificationText && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Type <span className="font-bold text-red-600 dark:text-red-400 font-mono tracking-wider">{requireVerificationText}</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={verificationInput}
                      onChange={(e) => setVerificationInput(e.target.value)}
                      placeholder={`Type ${requireVerificationText}`}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono uppercase"
                      autoFocus
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-2">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    disabled={isConfirmDisabled}
                    onClick={() => {
                      if (!isConfirmDisabled) {
                        onConfirm();
                        onCancel();
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isConfirmDisabled
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20'
                    }`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
