import CourseRegistrationsReport from "./reports/CourseRegistrationsReport";
import BacklogRegistrationsReport from "./reports/BacklogRegistrationsReport";
import StudentCreditTotalsReport from "./reports/StudentCreditTotalsReport";
import CourseRegistrationCountsReport from "./reports/CourseRegistrationCountsReport";
import SwayamRegistrationsReport from "./reports/SwayamRegistrationsReport";
import SemesterRegistrationsReport from "./reports/SemesterRegistrationsReport";
import CreditsEarnedReport from "./reports/CreditsEarnedReport";
import ActiveBacklogsReport from "./reports/ActiveBacklogsReport";
import CoreCourseGradesReport from "./reports/CoreCourseGradesReport";
import RemainingCoreGradesReport from "./reports/RemainingCoreGradesReport";
import BatchWiseStudentCountReport from "./reports/BatchWiseStudentCountReport";
import BranchWiseStudentCountReport from "./reports/BranchWiseStudentCountReport";

// One entry per report. Adding a report means adding an entry here; the list
// page and the report page both read from this.
export const DATABASE_REPORTS = [
  {
    id: "course-registrations",
    title: "Student course registrations",
    summary: "Roll number, name, batch, programme, slot, course and credit",
    filters: "Session, semester type, batch",
    Component: CourseRegistrationsReport,
  },
  {
    id: "backlog-registrations",
    title: "Backlog slot registrations",
    summary:
      "Students registered in a backlog slot, with the semester, slot and course",
    filters: "Session, semester type",
    Component: BacklogRegistrationsReport,
  },
  {
    id: "student-credit-totals",
    title: "Total credits registered",
    summary: "Credits each student of a batch registered in the term",
    filters: "Session, semester type, batch",
    Component: StudentCreditTotalsReport,
  },
  {
    id: "course-registration-counts",
    title: "Course-wise registration count",
    summary: "How many students registered in each course, busiest first",
    filters: "Session, semester type, programme (optional)",
    Component: CourseRegistrationCountsReport,
  },
  {
    id: "swayam-registrations",
    title: "Swayam course registrations",
    summary: "Students registered in a Swayam course, with the slot semester",
    filters: "Session, semester type, batch (optional)",
    Component: SwayamRegistrationsReport,
  },
  {
    id: "semester-registrations",
    title: "Semester-wise registrations of a batch",
    summary: "Every course a batch registered in one semester, with credits",
    filters: "Batch, semester",
    Component: SemesterRegistrationsReport,
  },
  {
    id: "credits-earned",
    title: "Total credits earned",
    summary:
      "Regular, backlog/improvement and swayam credits each student of a batch has earned so far",
    filters: "Batch",
    Component: CreditsEarnedReport,
  },
  {
    id: "active-backlogs",
    title: "Active Backlogs Batch Wise",
    summary:
      "Courses each student failed and has not cleared yet, with the semester, grade and instructor",
    filters: "Batch (optional)",
    Component: ActiveBacklogsReport,
  },
  {
    id: "core-course-grades",
    title: "Common Courses Grades Inter-disciplinary",
    summary:
      "Credits each student of a batch has earned, with their grade in each common course you add",
    filters: "Batch, discipline (optional), courses",
    Component: CoreCourseGradesReport,
  },
  {
    id: "remaining-core-grades",
    title: "Remaining Core Courses Grades",
    summary:
      "Credits each student of a batch has earned, with their grade in each remaining core course you add",
    filters: "Batch, discipline (optional), courses",
    Component: RemainingCoreGradesReport,
  },
  {
    id: "batch-wise-student-count",
    title: "Batch Wise Student Count",
    summary:
      "Students in each batch from 2020, with male and female counts from the 2025 batch",
    filters: "None",
    Component: BatchWiseStudentCountReport,
  },
  {
    id: "branch-wise-student-count",
    title: "Branch Wise Student Count",
    summary:
      "Students in each programme and discipline of every batch from 2020, with male and female counts from the 2025 batch",
    filters: "None",
    Component: BranchWiseStudentCountReport,
  },
];

export const findReport = (id) =>
  DATABASE_REPORTS.find((report) => report.id === id);
