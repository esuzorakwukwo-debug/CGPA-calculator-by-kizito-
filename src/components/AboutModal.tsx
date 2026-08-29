import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Award, Info, Lock, Cpu, Sparkles, Database, CheckCircle2, ChevronRight } from 'lucide-react';
import { GRADE_POINTS } from '../constants';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstall?: () => void;
  isInstalled?: boolean;
}

export function AboutModal({ isOpen, onClose, onOpenInstall, isInstalled }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'grading' | 'release'>('privacy');

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
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50/50 dark:bg-gray-800/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-indigo-500/20 shrink-0">
                  <img
                    src="/icon-192.png"
                    alt="CGPA Pro"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">CGPA Pro</h3>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono">
                      v1.0.1
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By <span className="font-medium text-gray-700 dark:text-gray-300">Kizito Atelier</span> • Track. Improve. Graduate Strong.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 bg-white dark:bg-gray-900 shrink-0">
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-medium transition-colors mr-6 ${
                  activeTab === 'privacy'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ShieldCheck size={15} />
                Data Protection
              </button>
              <button
                onClick={() => setActiveTab('grading')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-medium transition-colors mr-6 ${
                  activeTab === 'grading'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Award size={15} />
                5.0 Grading System
              </button>
              <button
                onClick={() => setActiveTab('release')}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-medium transition-colors ${
                  activeTab === 'release'
                    ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Info size={15} />
                About & Release
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600 dark:text-gray-300">
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-4 flex items-start gap-3">
                    <Lock className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
                    <div className="text-xs text-emerald-950 dark:text-emerald-200">
                      <span className="font-semibold block mb-0.5">On-Device Local Storage</span>
                      All your manually entered courses, grades, semesters, and GPA/CGPA calculations are processed and stored locally on your device.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <Database className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">Zero Remote Databases & No Accounts</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          CGPA Pro requires no signups, passwords, or personal profiles. No analytics servers or tracking telemetry are attached.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <Sparkles className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">AI PDF Scanner Data Disclosure</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          When you explicitly upload a syllabus or transcript to the Smart PDF Scanner, that document's text is sent to the Google Gemini API solely to parse course codes and units. No manual records or unrelated grades are ever transmitted.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <Cpu className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">Full Offline Independence</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Once installed, all GPA/CGPA calculators, target simulators, and planners operate seamlessly without an internet connection.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'grading' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    CGPA Pro uses the standard 5-point tertiary grading system adopted across major universities.
                  </p>

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="p-2.5">Grade</th>
                          <th className="p-2.5">Score Range</th>
                          <th className="p-2.5">Points</th>
                          <th className="p-2.5">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                        <tr>
                          <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">A</td>
                          <td className="p-2.5">70% – 100%</td>
                          <td className="p-2.5 font-mono font-semibold">5.0</td>
                          <td className="p-2.5">Excellent</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">B</td>
                          <td className="p-2.5">60% – 69%</td>
                          <td className="p-2.5 font-mono font-semibold">4.0</td>
                          <td className="p-2.5">Very Good</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">C</td>
                          <td className="p-2.5">50% – 59%</td>
                          <td className="p-2.5 font-mono font-semibold">3.0</td>
                          <td className="p-2.5">Good</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">D</td>
                          <td className="p-2.5">45% – 49%</td>
                          <td className="p-2.5 font-mono font-semibold">2.0</td>
                          <td className="p-2.5">Pass / Fair</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-orange-600 dark:text-orange-400">E</td>
                          <td className="p-2.5">40% – 44%</td>
                          <td className="p-2.5 font-mono font-semibold">1.0</td>
                          <td className="p-2.5">Bare Pass</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-red-600 dark:text-red-400">F</td>
                          <td className="p-2.5">0% – 39%</td>
                          <td className="p-2.5 font-mono font-semibold">0.0</td>
                          <td className="p-2.5">Fail</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800 space-y-1 text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">Class of Degree Thresholds:</span>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>First Class Honours:</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400">4.50 – 5.00</span></div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Second Class (Upper Division):</span> <span className="font-semibold text-blue-600 dark:text-blue-400">3.50 – 4.49</span></div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Second Class (Lower Division):</span> <span className="font-semibold text-indigo-600 dark:text-indigo-400">2.40 – 3.49</span></div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Third Class:</span> <span className="font-semibold text-amber-600 dark:text-amber-400">1.50 – 2.39</span></div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Pass:</span> <span className="font-semibold text-orange-600 dark:text-orange-400">1.00 – 1.49</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'release' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">What's New in v1.0.1</h4>
                    <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>High-res iOS Safari Home Screen touch icon & PWA configuration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>Protected deletion safeguards with course/semester detail previews</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>Non-destructive AI PDF course import with safe semester merge</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>Real-time bulk course addition live counter and validation</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                    <p>Designed and built for university scholars worldwide.</p>
                    <p>© {new Date().getFullYear()} Kizito Atelier. All rights reserved.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
              {onOpenInstall && !isInstalled ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenInstall();
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Install CGPA Pro on this device
                  <ChevronRight size={14} />
                </button>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {isInstalled ? 'App installed in standalone mode' : 'Offline-ready web application'}
                </span>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
