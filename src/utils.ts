import { GRADE_POINTS } from './constants';
import { Course, Semester } from './types';

export function calculateGPA(courses: Course[]): number {
  if (courses.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    totalPoints += GRADE_POINTS[course.grade] * course.creditUnit;
    totalCredits += course.creditUnit;
  }

  if (totalCredits === 0) return 0;

  return totalPoints / totalCredits;
}

export function calculateCGPA(semesters: Semester[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const semester of semesters) {
    for (const course of semester.courses) {
      totalPoints += GRADE_POINTS[course.grade] * course.creditUnit;
      totalCredits += course.creditUnit;
    }
  }

  if (totalCredits === 0) return 0;

  return totalPoints / totalCredits;
}

export function getDegreeClass(cgpa: number) {
  if (cgpa >= 4.5) return { label: 'First Class', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', indicator: 'bg-emerald-500' };
  if (cgpa >= 3.5) return { label: 'Second Class Upper', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', indicator: 'bg-emerald-500' };
  if (cgpa >= 2.4) return { label: 'Second Class Lower', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', indicator: 'bg-yellow-500' };
  if (cgpa >= 1.5) return { label: 'Third Class', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', indicator: 'bg-red-500' };
  if (cgpa >= 1.0) return { label: 'Pass', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', indicator: 'bg-red-500' };
  return { label: 'Fail', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', indicator: 'bg-red-500' };
}
