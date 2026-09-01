import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronUp, PlusCircle, BookOpen, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Semester, Course } from '../types';
import { CourseItem } from './CourseItem';
import { CourseForm } from './CourseForm';
import { QuickAddForm } from './QuickAddForm';
import { calculateGPA } from '../utils';
import { ConfirmModal } from './ConfirmModal';

interface SemesterCardProps {
  key?: React.Key;
  semester: Semester;
  isFirst?: boolean;
  forceExpand?: boolean;
  isCollapsed?: boolean;
  isPrivacyBlurred?: boolean;
  onToggleCollapse?: () => void;
  onUpdate: (id: string, updatedSemester: Semester) => void;
  onDelete: (id: string) => void;
}

export function SemesterCard({
  semester,
  isFirst,
  forceExpand,
  isCollapsed = false,
  isPrivacyBlurred = false,
  onToggleCollapse,
  onUpdate,
  onDelete,
}: SemesterCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const isExpanded = forceExpand ? true : (onToggleCollapse ? !isCollapsed : internalExpanded);

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  useEffect(() => {
    if (forceExpand) {
      setIsAddingCourse(false);
      setIsQuickAdding(false);
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

  const handleAddMultipleCourses = (newCoursesData: Omit<Course, 'id'>[]) => {
    const newCourses: Course[] = newCoursesData.map((data) => ({
      ...data,
      id: crypto.randomUUID(),
    }));
    onUpdate(semester.id, {
      ...semester,
      courses: [...semester.courses, ...newCourses],
    });
    setIsQuickAdding(false);
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 transition-all duration-300"
      >
        <div
          id={isFirst ? "tour-semester-header-first" : undefined}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={`Toggle ${semester.name || `${semester.level} — ${semester.term}`} courses`}
          className="flex items-center justify-between p-5 cursor-pointer bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg transition-all duration-300 ${isPrivacyBlurred ? 'filter blur-sm select-none' : ''}`}>
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
                      {semester.courses.map((course, cIdx) => (
                        <motion.div
                          key={course.id}
                          id={isFirst && cIdx === 0 ? "tour-course-item-first" : undefined}
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

                {isQuickAdding && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <QuickAddForm
                      existingCourses={semester.courses}
                      onAddMultiple={handleAddMultipleCourses}
                      onCancel={() => setIsQuickAdding(false)}
                    />
                  </motion.div>
                )}

                {!isAddingCourse && !isQuickAdding && (
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
                      onClick={() => setIsQuickAdding(true)}
                      className="flex-1 min-h-[44px] py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-colors border border-emerald-100 dark:border-emerald-500/20 border-dashed"
                    >
                      <ListPlus size={18} />
                      Quick Add Courses
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
