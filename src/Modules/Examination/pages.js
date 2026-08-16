import { FACULTY_ROLES, STUDENT_ROLES, DEAN_ROLES } from "../../ui/nav/roles";

export const EXAMINATION_BASE = "/examination";

const ACAD = ["acadadmin"];
const ACAD_AND_DEAN = [...ACAD, ...DEAN_ROLES];
const TEACHING = FACULTY_ROLES.filter((r) => r !== "faculty");

export const EXAMINATION_PAGES = [
  {
    key: "submitGradesProf",
    slug: "submit-grades-prof",
    title: "Submit Grades",
    icon: "Stamp",
    group: "Grades",
    roles: [...ACAD, ...TEACHING],
  },
  {
    key: "verifyGrades",
    slug: "verify-grades",
    title: "Verify Grades",
    icon: "Checks",
    group: "Grades",
    roles: ACAD,
  },
  {
    key: "gradeValidation",
    slug: "grade-validation",
    title: "Grade Validation",
    icon: "CheckCircle",
    group: "Grades",
    roles: ACAD,
  },
  {
    key: "gradeStatus",
    slug: "grade-status",
    title: "Grade Status",
    icon: "Kanban",
    group: "Grades",
    roles: ACAD_AND_DEAN,
  },
  {
    key: "gradeSummary",
    slug: "grade-summary",
    title: "Grade Summary",
    icon: "ChartBar",
    group: "Grades",
    roles: ACAD_AND_DEAN,
  },
  {
    key: "downloadGradesProf",
    slug: "download-grades-prof",
    title: "Download Grades",
    icon: "DownloadSimple",
    group: "Grades",
    roles: TEACHING,
  },
  {
    key: "verifyDean",
    slug: "update",
    title: "Update Grades",
    icon: "Gavel",
    group: "Grades",
    roles: DEAN_ROLES,
  },
  {
    key: "validateDean",
    slug: "validate",
    title: "Validate Grades",
    icon: "CheckCircle",
    group: "Grades",
    roles: DEAN_ROLES,
  },

  {
    key: "checkResult",
    slug: "result",
    title: "My Result",
    icon: "Scroll",
    group: "Results",
    roles: STUDENT_ROLES,
  },
  {
    key: "announceResult",
    slug: "result-announcement",
    title: "Announce Result",
    icon: "Megaphone",
    group: "Results",
    roles: ACAD_AND_DEAN,
  },

  {
    key: "generateTranscript",
    slug: "generate-transcript",
    title: "Transcript",
    icon: "Scroll",
    group: "Documents",
    roles: ACAD,
  },
  {
    key: "generateGradeSheet",
    slug: "generate-gradesheet",
    title: "Grade Sheet",
    icon: "Table",
    group: "Documents",
    roles: ACAD,
  },
];
