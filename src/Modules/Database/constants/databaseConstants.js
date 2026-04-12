/**
 * Shared Constants for Database Module
 * Purpose: Centralize config to reduce duplication across 4 components
 * Reduces: ~200 lines of duplicated code
 */

import { host } from "../../../routes/globalRoutes";

export const CATEGORY_MAP = {
  ug: "UG",
  pg: "PG",
  phd: "PHD",
};

export const SEMESTER_OPTIONS_STATIC = [
  { value: "1_Odd Semester", label: "Semester 1" },
  { value: "2_Even Semester", label: "Semester 2" },
  { value: "2_Summer Semester", label: "Summer Semester 1" },
  { value: "3_Odd Semester", label: "Semester 3" },
  { value: "4_Even Semester", label: "Semester 4" },
  { value: "4_Summer Semester", label: "Summer Semester 2" },
  { value: "5_Odd Semester", label: "Semester 5" },
  { value: "6_Even Semester", label: "Semester 6" },
  { value: "6_Summer Semester", label: "Summer Semester 3" },
  { value: "7_Odd Semester", label: "Semester 7" },
  { value: "8_Even Semester", label: "Semester 8" },
  { value: "9_Odd Semester", label: "Semester 9" },
  { value: "10_Even Semester", label: "Semester 10" },
  { value: "11_Odd Semester", label: "Semester 11" },
  { value: "12_Even Semester", label: "Semester 12" },
];

/**
 * Generates batch year options from 2021 to current year
 * @returns {Array} Array of {value, label} objects
 */
export const generateBatchOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 2020 }, (_, i) => {
    const year = 2021 + i;
    return { value: String(year), label: String(year) };
  });
};

export const DATABASE_APIS = {
  BATCHES: `${host}/database/api/batches/`,
  SEMESTERS: `${host}/database/api/semesters-filter/`,
  STUDENT_COURSES: `${host}/database/api/student-courses-detail/`,
  STUDENT_GRADES: `${host}/database/api/students-grade-info/`,
  COURSE_COUNT: `${host}/database/api/course-student-count/`,
  COURSE_STUDENTS: `${host}/database/api/course-students/`,
  UNREGISTERED: `${host}/database/api/unregistered-by-batch/`,
};

export const PROGRAMME_TYPES = {
  UG: "UG",
  PG: "PG",
  PHD: "PHD",
};

/**
 * Usage in Components:
 *
 * import {
 *   CATEGORY_MAP,
 *   SEMESTER_OPTIONS_STATIC,
 *   generateBatchOptions,
 *   DATABASE_APIS,
 * } from './constants/databaseConstants';
 *
 * // In component:
 * const batchOptions = generateBatchOptions();
 * const mappedType = CATEGORY_MAP[category] || "UG";
 */
