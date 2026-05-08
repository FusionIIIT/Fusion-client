import { host } from "../globalRoutes";

export const calendarRoute = `${host}/aims/api/calendar/`;
export const editCalendarRoute = `${host}/aims/api/update-calendar/`;
export const addCalendarRoute = `${host}/aims/api/add-calendar/`;
export const deleteCalendarRoute = `${host}/aims/api/delete-calendar/`;
export const nextSemCoursesRoute = `${host}/academic-procedures/api/stu/next_sem_courses/`;
export const currentCourseRegistrationRoute = `${host}/academic-procedures/api/stu/current_courseregistration/`;
export const preCourseRegistrationRoute = `${host}/academic-procedures/api/stu/preregistration/`;
export const preCourseRegistrationSubmitRoute = `${host}/academic-procedures/api/stu/preregistration/submit/`;
export const swayamRegistrationRoute = `${host}/academic-procedures/api/stu/swayam_courses/`;
export const swayamRegistrationSubmitRoute = `${host}/academic-procedures/api/stu/swayam/submit/`;
export const finalRegistrationPageRoute = `${host}/academic-procedures/api/stu/finalregistrationpage/`;
export const finalRegistrationRoute = `${host}/academic-procedures/api/stu/final_registration/`;
export const studentListRoute = `${host}/academic-procedures/api/acad/student_list/`;
export const courseListRoute = `${host}/academic-procedures/api/acad/course_list/`;
export const verifyRegistrationRoute = `${host}/academic-procedures/api/acad/verify_registration/`;
export const batchesRoute = `${host}/programme_curriculum/api/admin_batches/`;
export const checkAllocationRoute = `${host}/aims/api/check-allocation`;
export const startAllocationRoute = `${host}/aims/api/start-allocation`;
export const getStudentCourseRoute = `${host}/academic-procedures/api/acad/verify_course/`;
export const dropStudentCourseRoute = `${host}/academic-procedures/api/acad/verify_course/drop/`;
export const addStudentCourseRoute = `${host}/academic-procedures/api/acad/addCourse/`;
export const generatexlsheet = `${host}/aims/api/generatexlsheet`;
export const academicProceduresFaculty = `${host}/academic-procedures/api/fac/academic_procedures_faculty`;
export const getAllCourses = `${host}/academic-procedures/api/acad/get_all_courses`;
export const generateprereport = `${host}/aims/api/generate_preregistration_report/`;
export const searchPreRegistrationRoute = `${host}/academic-procedures/api/acad/search_preregistration/`;
export const deletePreRegistrationRoute = `${host}/academic-procedures/api/acad/delete_preregistration/`;
export const allotCoursesRoute = `${host}/academic-procedures/api/acad/allot_courses/`;

// Calendar routes
export const clearCalendarRoute = `${host}/aims/api/clear-calendar/`;
export const exportCalendarRoute = `${host}/aims/api/export-calendar/`;
export const importCalendarRoute = `${host}/aims/api/import-calendar/`;

// Admin Add/Drop routes
export const adminListAddRequestsRoute = `${host}/academic-procedures/api/acad/list_add_requests/`;
export const approveAddRequestsRoute = `${host}/academic-procedures/api/acad/approve_add_requests/`;
export const deleteAddRequestsRoute = `${host}/academic-procedures/api/acad/delete_add_requests/`;
export const adminListDropRequestsRoute = `${host}/academic-procedures/api/acad/list_drop_requests/`;
export const approveDropRequestsRoute = `${host}/academic-procedures/api/acad/approve_drop_requests/`;
export const deleteDropRequestsRoute = `${host}/academic-procedures/api/acad/delete_drop_requests/`;

// Batch routes
export const listBatchesRoute = `${host}/academic-procedures/api/acad/list_batches/`;
export const listStudentsRoute = `${host}/academic-procedures/api/acad/list_students/`;
export const applyBatchRoute = `${host}/academic-procedures/api/acad/apply_batch/`;
export const listStudentsPromoteRoute = `${host}/academic-procedures/api/acad/list_students_promote/`;
export const applyPromoteRoute = `${host}/academic-procedures/api/acad/apply_promote/`;

// Replacement routes
export const adminListRequestsRoute = `${host}/academic-procedures/api/acad/list_requests/`;
export const allotReplacementCoursesRoute = `${host}/academic-procedures/api/acad/allot_replacement_courses/`;
export const revertReplacementRequestsRoute = `${host}/academic-procedures/api/acad/revert_replacement_requests/`;
export const deleteReplacementRequestsRoute = `${host}/academic-procedures/api/acad/delete_replacement_requests/`;

// Student search route
export const StudentSearchRoute = `${host}/academic-procedures/api/acad/student_search/`;

// Faculty PG TA stipend routes
export const FAC_ASSIGNMENTS_URL = `${host}/academic-procedures/api/faculty/assignments/`;
export const FAC_PENDING_URL = `${host}/academic-procedures/api/faculty/pending/`;
export const FAC_APPROVED_URL = `${host}/academic-procedures/api/faculty/approved/`;
export const FAC_APPROVE_URL = (stipendRequestId) =>
  `${host}/academic-procedures/api/faculty/approve/${stipendRequestId}/`;

// Feedback routes
export const adminCoursesRoute = `${host}/academic-procedures/api/feedback/admin_courses/`;
export const adminAllStatsRoute = `${host}/academic-procedures/api/feedback/admin_all_stats/`;
export const instCoursesRoute = `${host}/academic-procedures/api/feedback/inst_courses/`;
export const instAllStatsRoute = `${host}/academic-procedures/api/feedback/inst_all_stats/`;
export const studentQuestionsRoute = `${host}/academic-procedures/api/feedback/student_questions/`;
export const studentSubmitRoute = `${host}/academic-procedures/api/feedback/student_submit/`;

// Course routes
export const availableCoursesRoute = `${host}/aims/api/available_courses/`;
export const semesterOptionsRoute = `${host}/academic-procedures/api/stu/semester_options/`;
export const courseRegistrationReceiptRoute = `${host}/academic-procedures/api/stu/course_registration_receipt/`;
export const getCourseSlotsRoute = `${host}/academic-procedures/api/acad/get_course_slots/`;
export const getCoursesRoute = `${host}/academic-procedures/api/acad/get_courses/`;

// Student request routes
export const studentListRequestsRoute = `${host}/academic-procedures/api/stu/list_requests/`;
export const studentDropRequestsRoute = `${host}/academic-procedures/api/stu/drop_requests/`;
export const studentAddRequestsRoute = `${host}/academic-procedures/api/stu/add_requests/`;

// Student Add/Drop course routes
export const studentAvailableAddCourseSlotsRoute = `${host}/academic-procedures/api/stu/available_add_course_slots/`;
export const studentAvailableAddCoursesRoute = `${host}/academic-procedures/api/stu/available_add_courses/`;
export const studentAddCourseRoute = `${host}/academic-procedures/api/stu/add_course/`;
export const studentDropRegistrationsRoute = `${host}/academic-procedures/api/stu/drop_registrations/`;
export const studentDropCourseRoute = `${host}/academic-procedures/api/stu/drop_course/`;

// Student calendar route
export const studentCalenderRoute = `${host}/aims/api/student_calendar/`;

// Student replacement routes
export const studentRegisteredSlotsRoute = `${host}/academic-procedures/api/stu/registered_slots/`;
export const studentBatchCreateRoute = `${host}/academic-procedures/api/stu/batch_create/`;
