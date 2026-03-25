import { notifications } from "@mantine/notifications";
import api from "../../helper/api";

const err = (msg) =>
  notifications.show({ title: "Error", message: msg, color: "red" });

export const getCourses = async () => {
  try {
    return (await api.get("/ocms/api/courses/")).data;
  } catch {
    err("Failed to load courses");
    return [];
  }
};
export const getCourseDashboard = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/dashboard/`)).data;
  } catch {
    err("Failed to load dashboard");
    return null;
  }
};
export const getAssignments = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/assignments/`)).data;
  } catch {
    err("Failed to load assignments");
    return [];
  }
};
export const addAssignment = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/assignments/add/`, data)).data;
  } catch {
    err("Failed to add assignment");
  }
};
export const uploadAssignment = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/assignments/upload/`, data)).data;
  } catch (e) {
    err(e?.response?.data?.detail || "Failed to upload assignment");
  }
};
export const gradeAssignment = async (code, pk, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/assignments/${pk}/grade/`, data))
      .data;
  } catch {
    err("Failed to grade assignment");
  }
};
export const deleteAssignment = async (code, pk) => {
  try {
    return (await api.delete(`/ocms/api/${code}/assignments/${pk}/delete/`))
      .data;
  } catch {
    err("Failed to delete assignment");
  }
};
export const getDocuments = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/documents/`)).data;
  } catch {
    err("Failed to load documents");
    return [];
  }
};
export const uploadDocument = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/documents/add/`, data)).data;
  } catch (e) {
    err(e?.response?.data?.detail || "Failed to upload material");
  }
};
export const deleteDocument = async (code, pk) => {
  try {
    return (await api.delete(`/ocms/api/${code}/documents/${pk}/delete/`)).data;
  } catch {
    err("Failed to delete document");
  }
};
export const getForum = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/forum/`)).data;
  } catch {
    err("Failed to load forum");
    return [];
  }
};
export const postForumQuestion = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/forum/new/`, data)).data;
  } catch {
    err("Failed to post question");
  }
};
export const postForumReply = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/forum/reply/`, data)).data;
  } catch {
    err("Failed to post reply");
  }
};
export const removeForumEntry = async (code, pk) => {
  try {
    return (await api.delete(`/ocms/api/${code}/forum/${pk}/remove/`)).data;
  } catch {
    err("Failed to remove post");
  }
};
export const getQuizzes = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/quizzes/`)).data;
  } catch {
    err("Failed to load quizzes");
    return [];
  }
};
export const createQuiz = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/quizzes/create/`, data)).data;
  } catch {
    err("Failed to create quiz");
  }
};
export const removeQuiz = async (code, quizId) => {
  try {
    return (await api.delete(`/ocms/api/${code}/quizzes/${quizId}/remove/`))
      .data;
  } catch {
    err("Failed to remove quiz");
  }
};
export const takeQuiz = async (code, quizId) => {
  try {
    return (await api.get(`/ocms/api/${code}/quizzes/${quizId}/`)).data;
  } catch (e) {
    err(e?.response?.data?.detail || "Cannot start quiz");
    return null;
  }
};
export const submitQuiz = async (code, quizId, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/quizzes/${quizId}/submit/`, data))
      .data;
  } catch (e) {
    err(e?.response?.data?.detail || "Failed to submit quiz");
    return null;
  }
};
export const getAttendanceRecords = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/attendance/`)).data;
  } catch {
    err("Failed to load attendance");
    return [];
  }
};
export const getAttendanceRoster = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/attendance/roster/`)).data;
  } catch {
    err("Failed to load course roster");
    return [];
  }
};
export const submitAttendance = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/attendance/`, data)).data;
  } catch {
    err("Failed to submit attendance");
  }
};
export const getQuestionBank = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/questionbank/`)).data;
  } catch {
    err("Failed to load question bank");
    return [];
  }
};
export const createBank = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/questionbank/create/`, data))
      .data;
  } catch {
    err("Failed to create bank");
  }
};
export const addTopic = async (code, bankId, data) => {
  try {
    return (
      await api.post(
        `/ocms/api/${code}/questionbank/${bankId}/topic/add/`,
        data,
      )
    ).data;
  } catch {
    err("Failed to add topic");
  }
};
export const addQuestion = async (code, bankId, topicId, data) => {
  try {
    return (
      await api.post(
        `/ocms/api/${code}/questionbank/${bankId}/topic/${topicId}/question/add/`,
        data,
      )
    ).data;
  } catch {
    err("Failed to add question");
  }
};
export const getGradingScheme = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/grading/`)).data;
  } catch {
    err("Failed to load grading");
    return [];
  }
};
export const createGradingScheme = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/grading/create/`, data)).data;
  } catch (e) {
    err(e?.response?.data?.detail || "Failed to create grading scheme");
  }
};
export const saveEvaluation = async (code, data) => {
  try {
    return (await api.post(`/ocms/api/${code}/grading/evaluate/`, data)).data;
  } catch {
    err("Failed to save evaluation");
  }
};
export const getStudentGrades = async (code) => {
  try {
    return (await api.get(`/ocms/api/${code}/grading/student-grades/`)).data;
  } catch {
    err("Failed to load grades");
    return [];
  }
};
