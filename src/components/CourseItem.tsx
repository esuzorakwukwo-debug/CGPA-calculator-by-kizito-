import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Course } from '../types';
import { CourseForm } from './CourseForm';
import { GRADE_POINTS } from '../constants';

interface CourseItemProps {
  course: Course;
  onUpdate: (id: string, updatedCourse: Omit<Course, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function CourseItem({ course, onUpdate, onDelete }: CourseItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="mb-2">
        <CourseForm
          isEdit
          initialData={course}
          onAdd={(updated) => {
            onUpdate(course.id, updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  const gradePoint = GRADE_POINTS[course.grade];
  const totalPoints = gradePoint * course.creditUnit;

  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-xl hover:border-gray-200 dark:hover:border-gray-600 transition-all group shadow-sm hover:shadow-md">
      <div className="flex-1 min-w-0 pr-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            {course.creditUnit} {course.creditUnit === 1 ? 'Unit' : 'Units'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            Grade: {course.grade} ({gradePoint} pts)
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{totalPoints}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Pts</div>
        </div>
        
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
            title="Edit Course"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
            title="Delete Course"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
