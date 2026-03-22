import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Course, Grade } from '../types';

interface CourseFormProps {
  onAdd: (course: Omit<Course, 'id'>) => void;
  onCancel?: () => void;
  initialData?: Omit<Course, 'id'>;
  isEdit?: boolean;
}

export function CourseForm({ onAdd, onCancel, initialData, isEdit }: CourseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [creditUnit, setCreditUnit] = useState(initialData?.creditUnit.toString() || '');
  const [grade, setGrade] = useState<Grade | ''>(initialData?.grade || '');
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Course title cannot be empty.');
      return;
    }
    
    if (!/[a-zA-Z0-9]/.test(trimmedTitle)) {
      setTitleError('Course title must contain letters or numbers.');
      return;
    }
    
    setTitleError(null);

    if (!creditUnit || !grade) return;
    
    const credits = parseInt(creditUnit, 10);
    if (isNaN(credits) || credits <= 0) return;

    onAdd({
      title: trimmedTitle,
      creditUnit: credits,
      grade: grade as Grade,
    });

    if (!isEdit) {
      setTitle('');
      setCreditUnit('');
      setGrade('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50 transition-colors">
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Course Title</label>
        <input
          type="text"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
          }}
          placeholder="e.g. MTH 101"
          className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border ${titleError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500/50 focus:border-indigo-500'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
          required
        />
        {titleError && (
          <p className="text-xs text-red-500 mt-1.5 font-medium">{titleError}</p>
        )}
      </div>
      <div className="w-full sm:w-24">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Credits</label>
        <input
          type="number"
          min="1"
          step="1"
          value={creditUnit}
          onChange={(e) => setCreditUnit(e.target.value)}
          placeholder="Units"
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          required
        />
      </div>
      <div className="w-full sm:w-24">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Grade</label>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value as Grade)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm appearance-none text-gray-900 dark:text-white"
          required
        >
          <option value="" disabled>Select</option>
          <option value="A">A (5)</option>
          <option value="B">B (4)</option>
          <option value="C">C (3)</option>
          <option value="D">D (2)</option>
          <option value="E">E (1)</option>
          <option value="F">F (0)</option>
        </select>
      </div>
      <div className="flex flex-col w-full sm:w-auto mt-2 sm:mt-0">
        <label className="hidden sm:block text-xs mb-1">&nbsp;</label>
        <div className="flex gap-2 h-[38px]">
          <button
            type="submit"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm h-full"
          >
            {isEdit ? <Check size={16} /> : <Plus size={16} />}
            {isEdit ? 'Save' : 'Add'}
          </button>
          {isEdit && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors h-full"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
