import axios from "axios";
import { host } from "../../../routes/globalRoutes/index.jsx";

const API_BASE = `${host}/ocms/api`;

const curlLikeRequest = async ({
  method,
  url,
  token,
  data,
}) => {
  const response = await axios({
    method,
    url,
    data,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    validateStatus: () => true,
  });

  return {
    status: response.status,
    data: response.data,
  };
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Mirrors the CLI smoke flow (course create -> enroll -> assignment create ->
// list assignments -> submit -> list submissions -> grade -> list student submissions)
// using explicit tokens like curl does.
export const runOcmsSmokeFlow = async ({
  facultyToken,
  studentToken,
  apiBase = API_BASE,
  dueDateIso = "2026-12-01T23:59:00Z",
} = {}) => {
  if (!facultyToken || !studentToken) {
    throw new Error(
      "runOcmsSmokeFlow requires { facultyToken, studentToken }",
    );
  }

  const result = {
    course_id: null,
    assignment_id: null,
    submission_id: null,
    enroll_http: null,
    list_assignments_http: null,
    list_submissions_http: null,
    grade_http: null,
    student_submissions_http: null,
  };

  const courseResp = await curlLikeRequest({
    method: "post",
    url: `${apiBase}/courses/create/`,
    token: facultyToken,
    data: { title: "Smoke Course", description: "E2E" },
  });
  if (courseResp.status < 200 || courseResp.status >= 300) {
    return { ok: false, step: "courses/create", ...courseResp };
  }
  result.course_id = courseResp.data?.id ?? null;

  const enrollResp = await curlLikeRequest({
    method: "post",
    url: `${apiBase}/enroll/`,
    token: studentToken,
    data: { course_id: result.course_id },
  });
  result.enroll_http = enrollResp.status;

  const assignmentResp = await curlLikeRequest({
    method: "post",
    url: `${apiBase}/assignments/create/`,
    token: facultyToken,
    data: {
      course_id: result.course_id,
      title: "HW",
      description: "Do",
      due_date: dueDateIso,
    },
  });
  if (assignmentResp.status < 200 || assignmentResp.status >= 300) {
    return { ok: false, step: "assignments/create", ...assignmentResp };
  }
  result.assignment_id = assignmentResp.data?.id ?? null;

  const listAssignmentsResp = await curlLikeRequest({
    method: "get",
    url: `${apiBase}/courses/${result.course_id}/assignments/`,
    token: studentToken,
  });
  result.list_assignments_http = listAssignmentsResp.status;

  const submitResp = await curlLikeRequest({
    method: "post",
    url: `${apiBase}/assignments/submit/`,
    token: studentToken,
    data: {
      assignment_id: result.assignment_id,
      file_url: "https://example.com/sub.pdf",
    },
  });
  if (submitResp.status < 200 || submitResp.status >= 300) {
    return { ok: false, step: "assignments/submit", ...submitResp };
  }
  result.submission_id = submitResp.data?.id ?? null;

  const listSubmissionsResp = await curlLikeRequest({
    method: "get",
    url: `${apiBase}/assignments/${result.assignment_id}/submissions/`,
    token: facultyToken,
  });
  result.list_submissions_http = listSubmissionsResp.status;

  const gradeResp = await curlLikeRequest({
    method: "post",
    url: `${apiBase}/submissions/grade/`,
    token: facultyToken,
    data: { submission_id: result.submission_id, grade: "A+" },
  });
  result.grade_http = gradeResp.status;

  const studentSubmissionsResp = await curlLikeRequest({
    method: "get",
    url: `${apiBase}/student/submissions/`,
    token: studentToken,
  });
  result.student_submissions_http = studentSubmissionsResp.status;

  return { ok: true, ...result };
};

// ── Course endpoints ─────────────────────────────────────────────────────────

export const fetchAllCourses = async () => {
  const response = await axios.get(`${API_BASE}/courses/`, getAuthHeaders());
  return response.data;
};

export const fetchCourseDetail = async (courseId) => {
  const response = await axios.get(
    `${API_BASE}/courses/${courseId}/`,
    getAuthHeaders(),
  );
  return response.data;
};

export const fetchCourseMaterials = async (courseId) => {
  const response = await axios.get(
    `${API_BASE}/courses/${courseId}/materials/`,
    getAuthHeaders(),
  );
  return response.data;
};

export const fetchCourseAssignments = async (courseId) => {
  const response = await axios.get(
    `${API_BASE}/courses/${courseId}/assignments/`,
    getAuthHeaders(),
  );
  return response.data;
};

export const createCourse = async ({ title, description }) => {
  const response = await axios.post(
    `${API_BASE}/courses/create/`,
    { title, description },
    getAuthHeaders(),
  );
  return response.data;
};

// ── Enrollment endpoints ─────────────────────────────────────────────────────

export const enrollInCourse = async (courseId) => {
  const response = await axios.post(
    `${API_BASE}/enroll/`,
    { course_id: Number(courseId) },
    getAuthHeaders(),
  );
  return response.data;
};

export const fetchStudentCourses = async () => {
  const response = await axios.get(
    `${API_BASE}/student/courses/`,
    getAuthHeaders(),
  );
  return response.data;
};

export const fetchStudentSubmissions = async () => {
  const response = await axios.get(
    `${API_BASE}/student/submissions/`,
    getAuthHeaders(),
  );
  return response.data;
};

// ── Material endpoints ────────────────────────────────────────────────────────

export const uploadMaterial = async ({ course_id, title, file_url }) => {
  const response = await axios.post(
    `${API_BASE}/materials/upload/`,
    { course_id: Number(course_id), title, file_url },
    getAuthHeaders(),
  );
  return response.data;
};

// ── Assignment endpoints ──────────────────────────────────────────────────────

export const createAssignment = async ({
  course_id,
  title,
  description,
  due_date,
}) => {
  const response = await axios.post(
    `${API_BASE}/assignments/create/`,
    { course_id: Number(course_id), title, description, due_date },
    getAuthHeaders(),
  );
  return response.data;
};

export const submitAssignment = async ({ assignment_id, file_url }) => {
  const response = await axios.post(
    `${API_BASE}/assignments/submit/`,
    { assignment_id: Number(assignment_id), file_url },
    getAuthHeaders(),
  );
  return response.data;
};

export const fetchAssignmentSubmissions = async (assignmentId) => {
  const response = await axios.get(
    `${API_BASE}/assignments/${assignmentId}/submissions/`,
    getAuthHeaders(),
  );
  return response.data;
};

// ── Submission endpoints ──────────────────────────────────────────────────────

export const gradeSubmission = async ({ submission_id, grade }) => {
  const response = await axios.post(
    `${API_BASE}/submissions/grade/`,
    { submission_id: Number(submission_id), grade },
    getAuthHeaders(),
  );
  return response.data;
};
