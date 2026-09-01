import React, { useState } from 'react';
import { Plus, Check, X, AlertTriangle, Trash2 } from 'lucide-react';
import { Course, Grade } from '../types';

interface QuickAddFormProps {
  existingCourses: Course[];
  onAddMultiple: (courses: Omit<Course, 'id'>[]) => void;
  onCancel: () => void;
}

interface DraftRow {
  id: string;
  title: string;
  creditUnit: string;
  grade: Grade | '';
}

export function QuickAddForm({ existingCourses, onAddMultiple, onCancel }: QuickAddFormProps) {
  const [rows, setRows] = useState<DraftRow[]>([
    { id: crypto.randomUUID(), title: '', creditUnit: '3', grade: '' },
  ]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const existingCourseTitles = new Set(
    existingCourses.map((c) => c.title.trim().toUpperCase())
  );

  const updateRow = (id: string, field: keyof DraftRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: '', creditUnit: '3', grade: '' },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      // Reset the single remaining row
      setRows([{ id: crypto.randomUUID(), title: '', creditUnit: '3', grade: '' }]);
      setHasAttemptedSubmit(false);
    }
  };

  // Helper validation checks
  const isRowEmpty = (row: DraftRow) => {
    return !row.title.trim() && !row.grade;
  };

  const isRowValid = (row: DraftRow) => {
    const trimmed = row.title.trim();
    if (!trimmed || !/[a-zA-Z0-9]/.test(trimmed)) return false;
    const units = parseInt(row.creditUnit, 10);
    if (isNaN(units) || units < 1 || units > 12) return false;
    if (!row.grade || !['A', 'B', 'C', 'D', 'E', 'F'].includes(row.grade)) return false;
    return true;
  };

  const validRows = rows.filter(isRowValid);
  const totalUnits = validRows.reduce((sum, r) => sum + (parseInt(r.creditUnit, 10) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const nonBlankRows = rows.filter((r) => !isRowEmpty(r));

    if (nonBlankRows.length === 0) {
      return;
    }

    const invalidNonBlank = nonBlankRows.filter((r) => !isRowValid(r));
    if (invalidNonBlank.length > 0) {
      return;
    }

    // Convert valid rows into course data
    const newCourses: Omit<Course, 'id'>[] = nonBlankRows.map((r) => ({
      title: r.title.trim(),
      creditUnit: parseInt(r.creditUnit, 10),
      grade: r.grade as Grade,
    }));

    onAddMultiple(newCourses);
  };

  // Count duplicate titles within draft rows for warnings
  const titleCounts: Record<string, number> = {};
  rows.forEach((r) => {
    const t = r.title.trim().toUpperCase();
    if (t) {
      titleCounts[t] = (titleCounts[t] || 0) + 1;
    }
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200/80 dark:border-gray-700/80">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Quick Add Courses
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Add multiple courses, credit units, and grades at once.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl transition-colors"
          title="Cancel"
          aria-label="Cancel Quick Add"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {rows.map((row, index) => {
          const trimmedTitle = row.title.trim().toUpperCase();
          const isDuplicateInForm = trimmedTitle && titleCounts[trimmedTitle] > 1;
          const isAlreadyInSemester = trimmedTitle && existingCourseTitles.has(trimmedTitle);
          const hasError = hasAttemptedSubmit && !isRowEmpty(row) && !isRowValid(row);

          return (
            <div
              key={row.id}
              className={`p-3 sm:p-3.5 bg-white dark:bg-gray-900 rounded-xl border transition-all ${
                hasError
                  ? 'border-red-400 dark:border-red-500/50 ring-1 ring-red-400/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                {/* Course Title input */}
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between sm:hidden mb-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Course #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg"
                      title="Remove Row"
                      aria-label={`Remove course row ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                    placeholder="Course Code / Name (e.g. MLS 401)"
                    className="w-full h-11 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                  />
                </div>

                {/* Credit Units & Grade row on mobile, inline on desktop */}
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <div className="w-1/2 sm:w-24">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      step="1"
                      value={row.creditUnit}
                      onChange={(e) => updateRow(row.id, 'creditUnit', e.target.value)}
                      placeholder="Units"
                      title="Credit Units (1-12)"
                      className="w-full h-11 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-center font-medium"
                    />
                  </div>

                  <div className="w-1/2 sm:w-28">
                    <select
                      value={row.grade}
                      onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                      className="w-full h-11 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm appearance-none text-gray-900 dark:text-white font-medium"
                    >
                      <option value="" disabled>
                        Grade
                      </option>
                      <option value="A">A (5)</option>
                      <option value="B">B (4)</option>
                      <option value="C">C (3)</option>
                      <option value="D">D (2)</option>
                      <option value="E">E (1)</option>
                      <option value="F">F (0)</option>
                    </select>
                  </div>

                  {/* Desktop Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="hidden sm:flex w-11 h-11 min-w-[44px] min-h-[44px] items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Remove Row"
                    aria-label={`Remove course row ${index + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Warning & Error Indicators */}
              {(isDuplicateInForm || isAlreadyInSemester || hasError) && (
                <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {hasError && (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Please enter course code and select a grade.
                    </span>
                  )}
                  {isDuplicateInForm && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                      <AlertTriangle size={12} />
                      Duplicate course code in form
                    </span>
                  )}
                  {isAlreadyInSemester && (
                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                      <AlertTriangle size={12} />
                      Already exists in this semester
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Another Course button */}
        <button
          type="button"
          onClick={handleAddRow}
          className="w-full min-h-[44px] py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800/40 border-dashed"
        >
          <Plus size={16} />
          <span>＋ Add Another Course</span>
        </button>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 pt-3 mt-4 border-t border-gray-200/80 dark:border-gray-700/80">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={validRows.length === 0}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              validRows.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check size={18} />
            <span>
              {validRows.length === 0
                ? 'Save Courses'
                : `Save ${validRows.length} ${validRows.length === 1 ? 'Course' : 'Courses'} (${totalUnits} Units)`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
