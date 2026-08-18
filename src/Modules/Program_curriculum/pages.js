export const CURRICULUM_BASE = "/programme_curriculum";

const PC_ADMIN = ["acadadmin", "studentacadadmin"];
const PC_FACULTY = [
  "Professor",
  "Assistant Professor",
  "Associate Professor",
  "Dean Academic",
  "HOD*",
];
const PC_STUDENT = ["student", "Guest-User"];

export const CURRICULUM_PAGES = [
  {
    key: "adminProgrammes",
    slug: "acad_view_all_programme",
    title: "Programmes",
    icon: "Bank",
    group: null,
    roles: PC_ADMIN,
  },
  {
    key: "adminCurriculums",
    slug: "acad_view_all_working_curriculums",
    title: "Curriculums",
    icon: "Stack",
    group: null,
    roles: PC_ADMIN,
  },
  {
    key: "adminDisciplines",
    slug: "acad_discipline_view",
    title: "Disciplines",
    icon: "TreeStructure",
    group: null,
    roles: PC_ADMIN,
  },
  {
    key: "adminCourses",
    slug: "admin_courses",
    title: "Courses",
    icon: "Book",
    group: "Assignments",
    roles: PC_ADMIN,
  },
  {
    key: "adminBatches",
    slug: "admin_batches",
    title: "Batches",
    icon: "Users",
    group: "Batches",
    roles: PC_ADMIN,
  },
  {
    key: "adminUpcomingBatches",
    slug: "admin_upcoming_batches",
    title: "Upcoming Batches",
    icon: "CalendarBlank",
    group: "Batches",
    roles: PC_ADMIN,
  },
  {
    key: "adminCourseInstructors",
    slug: "admin_course_instructor",
    title: "Course Instructors",
    icon: "ChalkboardTeacher",
    group: "Assignments",
    roles: PC_ADMIN,
  },
  {
    key: "adminTheses",
    slug: "admin_theses",
    title: "Theses",
    icon: "BookOpen",
    group: "Assignments",
    roles: PC_ADMIN,
  },

  {
    key: "facultyProgrammes",
    slug: "faculty_view_all_programmes",
    title: "Programmes",
    icon: "Bank",
    group: null,
    roles: PC_FACULTY,
  },
  {
    key: "facultyCourses",
    slug: "faculty_courses",
    title: "Courses",
    icon: "Book",
    group: null,
    roles: PC_FACULTY,
  },
  {
    key: "facultyCurriculums",
    slug: "faculty_view_all_working_curriculums",
    title: "Curriculums",
    icon: "Stack",
    group: null,
    roles: PC_FACULTY,
  },
  {
    key: "facultyDisciplines",
    slug: "faculty_discipline",
    title: "Disciplines",
    icon: "TreeStructure",
    group: null,
    roles: PC_FACULTY,
  },
  {
    key: "facultyBatches",
    slug: "faculty_batches",
    title: "Batches",
    icon: "Users",
    group: null,
    roles: PC_FACULTY,
  },
  {
    key: "facultyCourseInstructors",
    slug: "faculty_course_instructor",
    title: "Course Instructors",
    icon: "ChalkboardTeacher",
    group: null,
    roles: PC_FACULTY,
  },
  {
    key: "facultyProposals",
    slug: "faculty_view_course_proposal",
    title: "Course Proposals",
    icon: "Signature",
    group: "Proposals",
    roles: PC_FACULTY,
  },
  {
    key: "facultyNewProposal",
    slug: "new_course_proposal_form",
    title: "New Proposal",
    icon: "PlusCircle",
    group: "Proposals",
    roles: PC_FACULTY,
  },
  {
    key: "facultyForwardProposals",
    slug: "forward_course_forms",
    title: "Forward Proposals",
    icon: "Export",
    group: "Proposals",
    roles: PC_FACULTY,
  },
  {
    key: "facultyInwardFiles",
    slug: "faculty_inward_files",
    title: "Inward Files",
    icon: "FolderOpen",
    group: "File Tracking",
    roles: PC_FACULTY,
  },
  {
    key: "facultyOutwardFiles",
    slug: "faculty_outward_files",
    title: "Outward Files",
    icon: "Export",
    group: "File Tracking",
    roles: PC_FACULTY,
  },

  {
    key: "studentProgrammes",
    slug: "view_all_programmes",
    title: "Programmes",
    icon: "Bank",
    group: null,
    roles: PC_STUDENT,
  },
  {
    key: "studentCourses",
    slug: "student_courses",
    title: "Courses",
    icon: "Book",
    group: null,
    roles: PC_STUDENT,
  },
  {
    key: "studentCurriculums",
    slug: "view_all_working_curriculums",
    title: "Curriculums",
    icon: "Stack",
    group: null,
    roles: PC_STUDENT,
  },
  {
    key: "studentDisciplines",
    slug: "stud_discipline_view",
    title: "Disciplines",
    icon: "TreeStructure",
    group: null,
    roles: PC_STUDENT,
  },
];

export const CURRICULUM_TRAILS = {
  "/acad_view": { title: "Programme", parent: "Programmes" },
  "/faculty_view": { title: "Programme", parent: "Programmes" },
  "/curriculums/:id": { title: "Programme", parent: "Programmes" },
  "/acad_admin_add_programme_form": {
    title: "Add Programme",
    parent: "Programmes",
  },
  "/admin_edit_programme_form/:id": {
    title: "Edit Programme",
    parent: "Programmes",
  },

  "/admin_course/:id": { title: "Course", parent: "Courses" },
  "/faculty_course_view/:id": { title: "Course", parent: "Courses" },
  "/student_course/:id": { title: "Course", parent: "Courses" },
  "/acad_admin_edit_course_form/:id": {
    title: "Edit Course",
    parent: "Courses",
  },
  "/acad_admin_add_course_proposal_form": {
    title: "Add Course Proposal",
    parent: "Courses",
  },

  "/view_curriculum": { title: "Curriculum", parent: "Curriculums" },
  "/stud_curriculum_view/:id": { title: "Curriculum", parent: "Curriculums" },
  "/acad_admin_add_curriculum_form": {
    title: "Add Curriculum",
    parent: "Curriculums",
  },
  "/admin_edit_curriculum_form": {
    title: "Edit Curriculum",
    parent: "Curriculums",
  },
  "/acad_admin_replicate_curriculum_form": {
    title: "Replicate Curriculum",
    parent: "Curriculums",
  },
  "/semester_info": { title: "Semester", parent: "Curriculums" },
  "/stud_semester_info/:id": { title: "Semester", parent: "Curriculums" },
  "/course_slot_details": { title: "Course Slot", parent: "Curriculums" },
  "/stud_course_slot_details/:id": {
    title: "Course Slot",
    parent: "Curriculums",
  },
  "/acad_admin_add_courseslot_form": {
    title: "Add Course Slot",
    parent: "Curriculums",
  },
  "/admin_edit_course_slot_form/:courseslotid": {
    title: "Edit Course Slot",
    parent: "Curriculums",
  },
  "/thesis_slot_details": { title: "Thesis Slot", parent: "Curriculums" },
  "/acad_admin_add_thesis_slot_form": {
    title: "Add Thesis Slot",
    parent: "Curriculums",
  },
  "/admin_edit_thesis_slot_form/:thesisslotid": {
    title: "Edit Thesis Slot",
    parent: "Curriculums",
  },
  "/seminar_slot_details": { title: "Seminar Slot", parent: "Curriculums" },
  "/acad_admin_add_seminar_slot_form": {
    title: "Add Seminar Slot",
    parent: "Curriculums",
  },
  "/admin_edit_seminar_slot_form/:seminarslotid": {
    title: "Edit Seminar Slot",
    parent: "Curriculums",
  },
  "/teaching_credit_slot_details": {
    title: "Teaching Credit Slot",
    parent: "Curriculums",
  },
  "/acad_admin_add_teaching_credit_slot_form": {
    title: "Add Teaching Credit Slot",
    parent: "Curriculums",
  },
  "/admin_edit_teaching_credit_slot_form/:tcslotid": {
    title: "Edit Teaching Credit Slot",
    parent: "Curriculums",
  },

  "/acad_admin_add_discipline_form": {
    title: "Add Discipline",
    parent: "Disciplines",
  },
  "/admin_edit_discipline_form": {
    title: "Edit Discipline",
    parent: "Disciplines",
  },
  "/acad_admin_edit_discipline_form/:id": {
    title: "Edit Discipline",
    parent: "Disciplines",
  },

  "/acad_admin_add_batch_form": { title: "Add Batch", parent: "Batches" },
  "/admin_edit_batch_form": { title: "Edit Batch", parent: "Batches" },
  "/acad_admin_instigate_form": {
    title: "Instigate Batch",
    parent: "Upcoming Batches",
  },

  "/admin_add_thesis": { title: "Add Thesis", parent: "Theses" },
  "/admin_edit_thesis_form/:id": { title: "Edit Thesis", parent: "Theses" },
  "/admin_add_seminar": { title: "Add Seminar", parent: "Theses" },
  "/admin_edit_seminar_form/:id": { title: "Edit Seminar", parent: "Theses" },
  "/admin_add_teaching_credit": {
    title: "Add Teaching Credit",
    parent: "Theses",
  },
  "/admin_edit_teaching_credit_form/:id": {
    title: "Edit Teaching Credit",
    parent: "Theses",
  },

  "/acad_admin_add_course_instructor": {
    title: "Add Course Instructor",
    parent: "Course Instructors",
  },
  "/admin_edit_course_instructor/:id": {
    title: "Edit Course Instructor",
    parent: "Course Instructors",
  },

  "/view_a_course_proposal_form": {
    title: "Course Proposal",
    parent: "Course Proposals",
  },
  "/edit_course_proposal_form/:id": {
    title: "Edit Course Proposal",
    parent: "Course Proposals",
  },
  "/filetracking": { title: "Proposal File", parent: "Course Proposals" },
  "/forward_course_forms_II": {
    title: "Forward Proposal",
    parent: "Forward Proposals",
  },
  "/view_inward_file": { title: "Inward File", parent: "Inward Files" },
};
