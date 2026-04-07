/**
 * Health Center API Service Layer
 * Centralized location for all API calls
 *
 * This file exports functions for all health center API endpoints.
 * All components should import and use these functions instead of
 * making direct axios calls.
 */

import axios from "axios";

// Get API host from environment variable
const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8000";
const BASE_URL = `${API_HOST}/healthcenter/api/v1`;

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("authToken");

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_HOST,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

/**
 * PATIENT/STUDENT API ENDPOINTS
 */

// Get student dashboard data
export const fetchStudentDashboard = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { dashboard: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get doctors list
export const fetchDoctors = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { get_doctors: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get pathologists list
export const fetchPathologists = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { get_pathologists: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get doctor schedule
export const fetchDoctorSchedule = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { get_doctor_schedule: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get pathologist schedule
export const fetchPathologistSchedule = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { get_pathologist_schedule: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get prescriptions
export const fetchPrescriptions = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { get_prescriptions: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get prescribed medicines
export const fetchPrescribedMedicines = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { get_prescribed_medicines: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get announcements
export const fetchAnnouncements = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { get_annoucements: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Submit feedback
export const submitFeedback = async (feedbackText) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/student/`,
    { feedback: feedbackText, feed_submit: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

/**
 * COMPOUNDER API ENDPOINTS
 */

// Get compounder dashboard data
export const fetchCompounderDashboard = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { dashboard: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get stock listing
export const fetchStock = async (page = 1, search = "") => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    {
      page_stock_view: page,
      search_view_stock: search,
      datatype: "manage_stock_view",
    },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get required medicines
export const fetchRequiredMedicines = async (page = 1, search = "") => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    {
      page_required_view: page,
      search_view_required: search,
      datatype: "manage_required_view",
    },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get expired medicines
export const fetchExpiredMedicines = async (page = 1, search = "") => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    {
      page_expired: page,
      search_view_expired: search,
      datatype: "manage_expired_view",
    },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get all doctors
export const fetchAllDoctors = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { get_doctors: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Add doctor
export const addDoctor = async (doctorData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_doctor: 1, ...doctorData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Remove doctor
export const removeDoctor = async (doctorId) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { remove_doctor: 1, doctor_id: doctorId },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get all pathologists
export const fetchAllPathologists = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { get_pathologists: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Add pathologist
export const addPathologist = async (pathologistData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_pathologist: 1, ...pathologistData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Remove pathologist
export const removePathologist = async (pathologistId) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { remove_pathologist: 1, pathologist_id: pathologistId },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get doctor schedule
export const fetchCompounderDoctorSchedule = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { get_doctor_schedule: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Add/update doctor schedule
export const upsertDoctorSchedule = async (scheduleData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_doctor_schedule: 1, ...scheduleData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Remove doctor schedule
export const removeDoctorSchedule = async (doctorId, day) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { remove_doctor_schedule: 1, doctor_id: doctorId, day },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get pathologist schedule
export const fetchCompounderPathologistSchedule = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { get_pathologist_schedule: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Add/update pathologist schedule
export const upsertPathologistSchedule = async (scheduleData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_pathologist_schedule: 1, ...scheduleData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Remove pathologist schedule
export const removePathologistSchedule = async (pathologistId, day) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { remove_pathologist_schedule: 1, pathologist_id: pathologistId, day },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get all medicines
export const fetchAllMedicines = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { get_medicines: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Add medicine
export const addMedicine = async (medicineData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_medicine: 1, ...medicineData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Edit medicine threshold
export const updateMedicineThreshold = async (medicineId, threshold) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { edit_threshold: 1, medicine_id: medicineId, threshold },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Add stock entry
export const addStockEntry = async (stockData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_stock: 1, ...stockData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get prescriptions (compounder view)
export const fetchCompounderPrescriptions = async (page = 1, search = "") => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    {
      page_prescriptions: page,
      search_prescriptions: search,
      datatype: "manage_prescriptions_view",
    },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Create prescription
export const createPrescription = async (prescriptionData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { create_prescription: 1, ...prescriptionData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Add prescribed medicine
export const addPrescribedMedicine = async (medicineData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_prescribed_medicine: 1, ...medicineData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get announcements (compounder view)
export const fetchCompounderAnnouncements = async () => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { get_annoucements: 1 },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Create announcement
export const createAnnouncement = async (announcementData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { add_announcement: 1, ...announcementData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Get patient history
export const fetchPatientHistory = async (userId, page = 1, search = "") => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    {
      user_id: userId,
      page_patient: page,
      search_patient: search,
      datatype: "manage_patient_view",
    },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Update patient information
export const updatePatient = async (userId, patientData) => {
  const token = getAuthToken();
  return axios.post(
    `${BASE_URL}/compounder/`,
    { update_patient: 1, user_id: userId, ...patientData },
    { headers: { Authorization: `Token ${token}` } },
  );
};

// Assignment 7 REST endpoints
export const createPrescriptionApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/prescriptions/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const getPrescriptionsApi = async () => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/prescriptions/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const respondToComplaint = async (complaintId, feedback) => {
  const token = getAuthToken();
  return axios.patch(
    `${BASE_URL}/complaints/${complaintId}/respond/`,
    { feedback },
    { headers: { Authorization: `Token ${token}` } },
  );
};

export const getDoctorScheduleApi = async (doctorId) => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/doctors/${doctorId}/schedule/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const fetchRequiredMedicinesApi = async () => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/medicines/required/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const createFollowupPrescriptionApi = async (prescriptionId, data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/prescriptions/${prescriptionId}/followup/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const getAnnouncementsApi = async () => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/announcements/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const createAnnouncementApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/announcements/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const createMedicalReliefApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/medical-relief/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const reviewMedicalReliefApi = async (reliefId, statusValue) => {
  const token = getAuthToken();
  return axios.patch(
    `${BASE_URL}/medical-relief/${reliefId}/review/`,
    { status: statusValue },
    { headers: { Authorization: `Token ${token}` } },
  );
};

export const createMedicalProfileApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/medical-profile/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const updateMedicalProfileApi = async (data) => {
  const token = getAuthToken();
  return axios.put(`${BASE_URL}/medical-profile/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const getMedicalProfileApi = async () => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/medical-profile/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const getPathologistsApi = async () => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/pathologists/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const addPathologistApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/pathologists/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const addPathologistScheduleApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/pathologist-schedules/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const getPathologistSchedulesApi = async () => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/pathologist-schedules/list/`, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const createMedicineApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/medicines/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const createStockEntryApi = async (data) => {
  const token = getAuthToken();
  return axios.post(`${BASE_URL}/stock-entries/`, data, {
    headers: { Authorization: `Token ${token}` },
  });
};

export const searchPatientsApi = async (query = "") => {
  const token = getAuthToken();
  return axios.get(`${BASE_URL}/patients/?search=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Token ${token}` },
  });
};

/**
 * Export API client for advanced usage if needed
 */
export { apiClient };
