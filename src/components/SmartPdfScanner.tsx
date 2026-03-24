import React, { useState, useRef } from 'react';
import { FileText, AlertCircle, X, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, Type } from '@google/genai';
import { Semester, Course, Grade } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface SmartPdfScannerProps {
  onDataExtracted: (semesters: Semester[]) => void;
}

export function SmartPdfScanner({ onDataExtracted }: SmartPdfScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Semester[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setIsOpen(true);
    setIsProcessing(true);
    setError(null);
    setPreviewData(null);
    setProgressMessage('Reading your results...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      if (!fullText.trim()) {
        throw new Error('No text found in the PDF.');
      }

      setProgressMessage('Analyzing courses and credits...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract academic semesters and courses from the following text.
        
        Rules:
        - Identify Semester Headers (e.g., "100 Level - 1st Semester").
        - For each semester, extract courses.
        - courseCode should be the course code (e.g., "MTH101").
        - creditUnit must be a number.
        - grade must be one of: "A", "B", "C", "D", "E", "F".
        - Ignore irrelevant text, names, GPA summaries, remarks.
        - Only extract valid courses.
        - Avoid duplicates.
        - If uncertain about a course, skip it.
        
        Text:
        ${fullText.substring(0, 30000)} // Limit text to avoid token limits if too large
        `,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                semester: { type: Type.STRING, description: "Semester name, e.g., '100 Level - 1st Semester'" },
                courses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      courseCode: { type: Type.STRING },
                      creditUnit: { type: Type.NUMBER },
                      grade: { type: Type.STRING }
                    },
                    required: ["courseCode", "creditUnit", "grade"]
                  }
                }
              },
              required: ["semester", "courses"]
            }
          }
        }
      });

      setProgressMessage('Almost done...');
      
      const jsonStr = response.text?.trim() || '[]';
      const parsedData = JSON.parse(jsonStr);
      
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('Could not extract data clearly. Please review or enter manually.');
      }

      // Map to Semester type
      const mappedSemesters: Semester[] = parsedData.map((sem: any) => {
        // Try to parse level and term from semester string
        let level = '100L';
        let term = '1st Semester';
        
        const levelMatch = sem.semester.match(/(\d{3})\s*(?:Level|L)/i);
        if (levelMatch) level = `${levelMatch[1]}L`;
        
        const termMatch = sem.semester.match(/(1st|2nd|First|Second)\s*Semester/i);
        if (termMatch) {
          term = termMatch[1].toLowerCase().startsWith('1') || termMatch[1].toLowerCase() === 'first' 
            ? '1st Semester' : '2nd Semester';
        }

        return {
          id: crypto.randomUUID(),
          level,
          term,
          name: sem.semester,
          courses: sem.courses.map((c: any) => ({
            id: crypto.randomUUID(),
            title: c.courseCode || '',
            creditUnit: Number(c.creditUnit) || 0,
            grade: ['A','B','C','D','E','F'].includes(c.grade) ? c.grade as Grade : 'F'
          }))
        };
      });

      setPreviewData(mappedSemesters);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not extract data clearly. Please review or enter manually.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirm = () => {
    if (previewData) {
      onDataExtracted(previewData);
      setIsOpen(false);
      setPreviewData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCourseChange = (semId: string, courseId: string, field: keyof Course, value: any) => {
    if (!previewData) return;
    setPreviewData(previewData.map(sem => {
      if (sem.id !== semId) return sem;
      return {
        ...sem,
        courses: sem.courses.map(c => {
          if (c.id !== courseId) return c;
          return { ...c, [field]: value };
        })
      };
    }));
  };

  const handleRemoveCourse = (semId: string, courseId: string) => {
    if (!previewData) return;
    setPreviewData(previewData.map(sem => {
      if (sem.id !== semId) return sem;
      return {
        ...sem,
        courses: sem.courses.filter(c => c.id !== courseId)
      };
    }));
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
      >
        <Sparkles size={16} className="text-indigo-500" />
        <span className="hidden sm:inline">Scan Result PDF</span>
        <span className="sm:hidden">Scan PDF</span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => !isProcessing && setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Smart PDF Scanner</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Extract courses automatically</p>
                  </div>
                </div>
                {!isProcessing && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="relative w-16 h-16 mb-6">
                      <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full" />
                      <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Processing Document</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{progressMessage}</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                      <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Extraction Failed</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{error}</p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : previewData ? (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-300">Extraction Successful</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400/80 mt-1">
                          We found {previewData.length} semesters and {previewData.reduce((acc, sem) => acc + sem.courses.length, 0)} courses. Please review and edit if necessary before saving.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {previewData.map((semester) => (
                        <div key={semester.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white">{semester.name}</h3>
                            <span className="text-xs font-medium px-2.5 py-1 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                              {semester.courses.length} courses
                            </span>
                          </div>
                          <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {semester.courses.map((course) => (
                              <div key={course.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="flex-1 w-full">
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Course Code</label>
                                  <input
                                    type="text"
                                    value={course.title}
                                    onChange={(e) => handleCourseChange(semester.id, course.id, 'title', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50"
                                  />
                                </div>
                                <div className="w-full sm:w-24">
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Units</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={course.creditUnit}
                                    onChange={(e) => handleCourseChange(semester.id, course.id, 'creditUnit', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50"
                                  />
                                </div>
                                <div className="w-full sm:w-24">
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Grade</label>
                                  <select
                                    value={course.grade}
                                    onChange={(e) => handleCourseChange(semester.id, course.id, 'grade', e.target.value as Grade)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/50"
                                  >
                                    {['A', 'B', 'C', 'D', 'E', 'F'].map(g => (
                                      <option key={g} value={g}>{g}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="pt-5">
                                  <button
                                    onClick={() => handleRemoveCourse(semester.id, course.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              {previewData && !isProcessing && (
                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md shadow-indigo-500/20"
                  >
                    Save & Calculate CGPA
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
