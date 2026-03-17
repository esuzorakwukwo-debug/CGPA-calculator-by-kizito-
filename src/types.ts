export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Course {
  id: string;
  title: string;
  creditUnit: number;
  grade: Grade;
}

export interface Semester {
  id: string;
  level: string;
  term: string;
  name?: string;
  courses: Course[];
}
