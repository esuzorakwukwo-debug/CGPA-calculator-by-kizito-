import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronUp, PlusCircle, BookOpen, ListPlus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Semester, Course } from '../types';
import { CourseItem } from './CourseItem';
import { CourseForm } from './CourseForm';
import { calculateGPA } from '../utils';
import { ConfirmModal } from './ConfirmModal';

interface SemesterCardProps {
  key?: React.Key;
  semester: Semester;
  isFirst?: boolean;
  forceExpand?: boolean;
  onUpdate: (id: string, updatedSemester: Semester) => void;
  onDelete: (id: string) => void;
}

export function SemesterCard({ semester, isFirst, forceExpand, onUpdate, onDelete }: SemesterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (forceExpand) {
      setIsExpanded(true);
      setIsAddingCourse(false);
      setIsBulkAdding(false);
    }
  }, [forceExpand]);

  const gpa = calculateGPA(semester.courses);
  const totalCredits = semester.courses.reduce((sum, c) => sum + c.creditUnit, 0);

  const handleAddCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: crypto.randomUUID(),
    };
    onUpdate(semester.id, {
      ...semester,
      courses: [...semester.courses, newCourse],
    });
    setIsAddingCourse(false);
  };

  const handleUpdateCourse = (courseId: string, updatedData: Omit<Course, 'id'>) => {
    const updatedCourses = semester.courses.map((c) =>
      c.id === courseId ? { ...c, ...updatedData } : c
    );
    onUpdate(semester.id, { ...semester, courses: updatedCourses });
  };

  const handleDeleteCourse = () => {
    if (courseToDelete) {
      const updatedCourses = semester.courses.filter((c) => c.id !== courseToDelete);
      onUpdate(semester.id, { ...semester, courses: updatedCourses });
      setCourseToDelete(null);
    }
  };

  const courseBeingDeleted = semester.courses.find((c) => c.id === courseToDelete);

  // Helper to parse live bulk text for live preview
  const parseBulkContent = (text: string) => {
    const lines = text.split('\n');
    const valid: Course[] = [];
    let invalidCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length !== 3) {
        invalidCount++;
        continue;
      }
      const [title, unitsStr, gradeStr] = parts;
      const creditUnit = parseInt(unitsStr, 10);
      const grade = gradeStr.toUpperCase();

      if (
        !title ||
        isNaN(creditUnit) ||
        creditUnit <= 0 ||
        !['A', 'B', 'C', 'D', 'E', 'F'].includes(grade)
      ) {
        invalidCount++;
        continue;
      }

      valid.push({
        id: crypto.randomUUID(),
        title,
        creditUnit,
        grade: grade as any,
      });
    }

    return { valid, invalidCount };
  };

  const { valid: previewBulkCourses, invalidCount: previewBulkInvalid } = parseBulkContent(bulkText);
  const previewBulkUnits = previewBulkCourses.reduce((sum, c) => sum + c.creditUnit, 0);

  const handleBulkAdd = () => {
    if (!bulkText.trim()) {
      setIsBulkAdding(false);
      return;
    }

    const { valid: newCourses, invalidCount: errorCount } = parseBulkContent(bulkText);

    if (newCourses.length > 0) {
      onUpdate(semester.id, {
        ...semester,
        courses: [...semester.courses, ...newCourses],
      });
    }

    if (errorCount > 0) {
      setBulkError(`Imported ${newCourses.length} courses. Ignored ${errorCount} invalid lines.`);
      if (newCourses.length > 0) {
        setBulkText(''); // Clear text if we imported some, but leave error visible
        setTimeout(() => {
          setIsBulkAdding(false);
          setBulkError(null);
        }, 4000);
      }
    } else {
      setIsBulkAdding(false);
      setBulkText('');
      setBulkError(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 transition-all duration-300"
      >
        <div
          className="flex items-center justify-between p-5 cursor-pointer bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              {gpa.toFixed(2)}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {semester.name || `${semester.level} — ${semester.term}`}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {semester.courses.length} {semester.courses.length === 1 ? 'Course' : 'Courses'} • {totalCredits} Units
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(semester.id);
              }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] p-2.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center"
              title="Delete Semester"
            >
              <Trash2 size={18} />
            </button>
            <div className="w-11 h-11 min-w-[44px] min-h-[44px] p-2.5 text-gray-400 dark:text-gray-500 flex items-center justify-center">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 dark:border-gray-800"
            >
              <div className="p-5">
                {semester.courses.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-700/50 border-dashed mb-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen size={20} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No courses added yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Add your first course to see your GPA</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <AnimatePresence>
                      {semester.courses.map((course) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                        >
                          <CourseItem
                            course={course}
                            onUpdate={handleUpdateCourse}
                            onDelete={(id) => setCourseToDelete(id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {isAddingCourse && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CourseForm
                      onAdd={handleAddCourse}
                      onCancel={() => setIsAddingCourse(false)}
                    />
                  </motion.div>
                )}

                {isBulkAdding && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bulk Import Courses
                      </label>
                      <button 
                        onClick={() => { setIsBulkAdding(false); setBulkError(null); }}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Format: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">Course Name, Units, Grade</span> (e.g., MLS 411, 3, A). One per line.
                    </p>
                    <textarea
                      value={bulkText}
                      onChange={(e) => {
                        setBulkText(e.target.value);
                        if (bulkError) setBulkError(null);
                      }}
                      placeholder="MLS 411, 3, A&#10;MTH 101, 4, B"
                      className="w-full h-32 px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none mb-3"
                    />
                    {/* Live Preview / Status of Parsed Courses */}
                    {bulkText.trim() && (
                      <div className="mb-3 p-3 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 space-y-1">
                        <div className="flex items-center justify-between font-medium">
                          <span className={previewBulkCourses.length > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-gray-500"}>
                            {previewBulkCourses.length > 0 
                              ? `✓ ${previewBulkCourses.length} ${previewBulkCourses.length === 1 ? 'course' : 'courses'} ready to add (${previewBulkUnits} total units)` 
                              : 'No valid courses detected yet'}
                          </span>
                          {previewBulkInvalid > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 text-xs">
                              {previewBulkInvalid} invalid {previewBulkInvalid === 1 ? 'line' : 'lines'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {bulkError && (
                      <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs rounded-xl border border-amber-200 dark:border-amber-800/30">
                        {bulkError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkAdd}
                        disabled={previewBulkCourses.length === 0}
                        className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm ${
                          previewBulkCourses.length > 0
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Check size={18} />
                        {previewBulkCourses.length > 0
                          ? `Import ${previewBulkCourses.length} ${previewBulkCourses.length === 1 ? 'Course' : 'Courses'} (${previewBulkUnits} Units)`
                          : 'Import Courses'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {!isAddingCourse && !isBulkAdding && (
                  <div className="flex gap-2" id={isFirst ? "tour-add-method" : undefined}>
                    <button
                      id={isFirst ? "tour-single-add" : undefined}
                      onClick={() => setIsAddingCourse(true)}
                      className="flex-1 min-h-[44px] py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-500/20 border-dashed"
                    >
                      <PlusCircle size={18} />
                      Add Course
                    </button>
                    <button
                      id={isFirst ? "tour-bulk-add" : undefined}
                      onClick={() => setIsBulkAdding(true)}
                      className="flex-1 min-h-[44px] py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-colors border border-emerald-100 dark:border-emerald-500/20 border-dashed"
                    >
                      <ListPlus size={18} />
                      Bulk Add
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmModal
        isOpen={courseToDelete !== null}
        title="Delete Course"
        message="Are you sure you want to delete this course? Your semester GPA and overall CGPA will be recalculated."
        confirmText="Delete Course"
        details={
          courseBeingDeleted
            ? [
                { label: 'Course Code / Title', value: courseBeingDeleted.title },
                { label: 'Credit Units', value: `${courseBeingDeleted.creditUnit} ${courseBeingDeleted.creditUnit === 1 ? 'Unit' : 'Units'}` },
                { label: 'Recorded Grade', value: `Grade ${courseBeingDeleted.grade}` },
              ]
            : undefined
        }
        onConfirm={handleDeleteCourse}
        onCancel={() => setCourseToDelete(null)}
      />
    </>
  );
}
