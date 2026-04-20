/**
 * Health Center API Client
 * =======================
 * Axios instance for PHC module API calls
 * 
 * Pattern: All API methods return promises with response data
 */

import axios from 'axios';

// Use environment variable in dev, relative URL in prod
const API_BASE = import.meta.env.VITE_API_BASE || '/healthcenter/api/phc';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication and CSRF token headers
api.interceptors.request.use((config) => {
  // Add authorization token from localStorage
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }

  // Add CSRF token for POST/PATCH/PUT requests
  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }

  return config;
});

export default api;

// =========================================================================
// ── DOCTOR AVAILABILITY ──────────────────────────────────────────────
// =========================================================================

export const getDoctorAvailability = (doctorId = null) => {
  if (doctorId) {
    return api.get(`/patient/doctor-availability/${doctorId}/`);
  }
  return api.get('/patient/doctor-availability/');
};

// =========================================================================
// ── APPOINTMENTS ─────────────────────────────────────────────────────
// =========================================================================

export const getAppointments = (status = null) => {
  const params = status ? { status } : {};
  return api.get('/patient/appointments/', { params });
};

export const getAppointment = (appointmentId) => {
  return api.get(`/patient/appointments/${appointmentId}/`);
};

export const createAppointment = (appointmentData) => {
  return api.post('/patient/appointments/', appointmentData);
};

export const cancelAppointment = (appointmentId, reason) => {
  return api.patch(`/patient/appointments/${appointmentId}/`, {
    decision: 'Reject',
    remarks: reason,
  });
};

// =========================================================================
// ── MEDICAL HISTORY ──────────────────────────────────────────────────
// =========================================================================

export const getMedicalHistory = () => {
  return api.get('/patient/medical-history/').then(res => {
    if (res.data && res.data.results && res.data.count !== undefined) {
      res.data = res.data.results;
    }
    return res;
  });
};

// =========================================================================
// ── HEALTH PROFILE ───────────────────────────────────────────────────
// =========================================================================

export const getHealthProfile = () => {
  return api.get('/patient/health-profile/');
};

export const updateHealthProfile = (profileData) => {
  return api.put('/patient/health-profile/', profileData);
};

// =========================================================================
// ── REIMBURSEMENT CLAIMS ─────────────────────────────────────────────
// =========================================================================

export const getReimbursementClaims = () => {
  return api.get('/patient/reimbursement-claims/');
};

export const getReimbursementClaim = (claimId) => {
  return api.get(`/patient/reimbursement-claims/${claimId}/`);
};

export const submitReimbursementClaim = (claimData) => {
  return api.post('/patient/reimbursement-claims/', claimData);
};

export const uploadClaimDocument = (claimId, file, documentType) => {
  const formData = new FormData();
  formData.append('document_file', file);
  formData.append('document_type', documentType);
  formData.append('document_name', file.name);
  
  return api.post(`/patient/reimbursement-claims/${claimId}/documents/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// =========================================================================
// ── DASHBOARD ────────────────────────────────────────────────────────
// =========================================================================

export const getDashboard = () => {
  return api.get('/dashboard/');
};

// =========================================================================
// ── STAFF: CLAIMS PROCESSING ─────────────────────────────────────────
// =========================================================================

export const getStaffClaims = () => {
  return api.get('/staff/claims/');
};

export const processStaffClaim = (claimId, decision, remarks) => {
  return api.patch(`/staff/claims/${claimId}/process/`, {
    decision,
    remarks,
  });
};

// =========================================================================
// ── STAFF: INVENTORY ─────────────────────────────────────────────────
// =========================================================================

export const getInventory = () => {
  return api.get('/staff/inventory/').then(res => {
    if (res.data && res.data.results && res.data.count !== undefined) {
      res.data = { stock: res.data.results };
    }
    return res;
  });
};

export const updateInventoryStock = (medicineId, quantityChange, reason) => {
  return api.post('/staff/inventory/update/', {
    medicine_id: medicineId,
    quantity_change: quantityChange,
    reason,
  });
};

export const getLowStockAlerts = () => {
  return api.get('/staff/low-stock-alerts/');
};

// =========================================================================
// ── COMPOUNDER: DOCTOR MANAGEMENT ────────────────────────────────────
// =========================================================================

// Register/Create Doctor
export const createDoctor = (doctorData) => {
  return api.post('/compounder/doctors/', {
    doctor_name: doctorData.doctor_name,
    specialization: doctorData.specialization,
    doctor_phone: doctorData.doctor_phone || '',
    email: doctorData.email || '',
  });
};

// Get all doctors
export const getDoctors = (activeOnly = true) => {
  const params = {};
  if (activeOnly !== null && activeOnly !== undefined) {
    params.active_only = activeOnly ? 'true' : 'false';
  }
  return api.get('/compounder/doctors/', { params });
};

// Get single doctor
export const getDoctor = (doctorId) => {
  return api.get(`/compounder/doctors/${doctorId}/`);
};

// Update doctor
export const updateDoctor = (doctorId, doctorData) => {
  return api.patch(`/compounder/doctors/${doctorId}/`, {
    doctor_name: doctorData.doctor_name,
    specialization: doctorData.specialization,
    doctor_phone: doctorData.doctor_phone || '',
    email: doctorData.email || '',
    is_active: doctorData.is_active !== undefined ? doctorData.is_active : true,
  });
};

// =========================================================================
// ── COMPOUNDER: DOCTOR SCHEDULE ──────────────────────────────────────
// =========================================================================

// Get doctor schedules
export const getDoctorSchedules = (doctorId = null) => {
  if (doctorId) {
    return api.get(`/compounder/schedule/?doctor=${doctorId}`);
  }
  return api.get('/compounder/schedule/');
};

// Create doctor schedule
export const createDoctorSchedule = (scheduleData) => {
  return api.post('/compounder/schedule/', {
    doctor: scheduleData.doctor_id,
    day_of_week: scheduleData.day_of_week,
    start_time: scheduleData.start_time || '09:00',
    end_time: scheduleData.end_time || '17:00',
    room_number: scheduleData.room_number || '',
  });
};

// =========================================================================
// ── COMPOUNDER: DOCTOR ATTENDANCE ───────────────────────────────────
// =========================================================================

// Get today's attendance records
export const getTodaysAttendance = () => {
  return api.get('/compounder/attendance/today/');
};

// Create/Update attendance for today
export const updateDoctorAttendance = (doctorId, status) => {
  return api.post('/compounder/attendance/', {
    doctor: doctorId,
    attendance_date: new Date().toISOString().split('T')[0],
    status: status,
  });
};

// =========================================================================
// ── COMPOUNDER: INVENTORY REQUISITIONS ─────────────────────────────────
// =========================================================================

export const getCompounderRequisitions = () => {
  return api.get('/compounder/requisition/');
};

export const createCompounderRequisition = (medicineId, quantity) => {
  return api.post('/compounder/requisition/', {
    medicine: medicineId,
    quantity_requested: quantity
  });
};

export const fulfillCompounderRequisition = (requisitionId, quantityFulfilled) => {
  return api.patch(`/compounder/requisition/${requisitionId}/fulfill/`, {
    quantity_fulfilled: quantityFulfilled
  });
};

// =========================================================================
// ── PATIENT: PRESCRIPTIONS ──────────────────────────────────────────
// =========================================================================

export const getPrescriptions = () => {
  return api.get('/patient/prescriptions/');
};

export const getPrescription = (prescriptionId) => {
  return api.get(`/patient/prescriptions/${prescriptionId}/`);
};

// =========================================================================
// ── PATIENT: COMPLAINTS (Patient-facing) ────────────────────────────
// =========================================================================

export const getPatientComplaints = () => {
  return api.get('/complaint/');
};

export const getPatientComplaint = (complaintId) => {
  return api.get(`/complaint/${complaintId}/`);
};

export const createPatientComplaint = (complaintData) => {
  return api.post('/complaint/', complaintData);
};

export const updatePatientComplaint = (complaintId, complaintData) => {
  return api.patch(`/complaint/${complaintId}/`, complaintData);
};

// =========================================================================
// ── COMPOUNDER: COMPLAINTS (Compounder response/management) ──────────
// =========================================================================

export const getComplaints = () => {
  // Compounder gets complaints to respond to
  return api.get('/compounder/complaint/');
};

export const getComplaint = (complaintId) => {
  return api.get(`/compounder/complaint/${complaintId}/`);
};

export const respondToCompounderComplaint = (complaintId, responseData) => {
  return api.patch(`/compounder/complaint/${complaintId}/respond/`, responseData);
};

// =========================================================================
// ── COMPOUNDER: STOCK MANAGEMENT ────────────────────────────────────
// =========================================================================

export const getMedicines = () => {
  return api.get('/compounder/medicine/');
};

export const addMedicine = (medicineData) => {
  return api.post('/compounder/medicine/', medicineData);
};

export const getStock = () => {
  return api.get('/compounder/stock/');
};

export const addStock = (stockData) => {
  return api.post('/compounder/stock/', {
    medicine_id: stockData.medicine_id || stockData.medication_id,
    qty: stockData.total_qty,
    expiry_date: stockData.expiry_date || new Date().toISOString().split('T')[0],
    batch_no: stockData.batch_no || '',
  });
};

export const updateStock = (stockId, stockData) => {
  return api.patch(`/compounder/stock/${stockId}/`, {
    medicine_id: stockData.medicine_id || stockData.medication_id,
    qty: stockData.total_qty,
    expiry_date: stockData.expiry_date || new Date().toISOString().split('T')[0],
    batch_no: stockData.batch_no || '',
  });
};

export const deleteStock = (stockId) => {
  return api.delete(`/compounder/stock/${stockId}/`);
};

// =========================================================================
// ── COMPOUNDER: EXPIRY & BATCH RETURNS ──────────────────────────────
// =========================================================================

export const getExpiryBatches = () => {
  return api.get('/compounder/expiry/');
};

export const markBatchAsReturned = (batchId, returnData) => {
  return api.patch(`/compounder/expiry/${batchId}/return/`, returnData);
};

export const deleteBatch = (batchId) => {
  return api.delete(`/compounder/expiry/${batchId}/`);
};

// =========================================================================
// ── COMPOUNDER: AMBULANCES ──────────────────────────────────────────
// =========================================================================

export const getAmbulances = () => {
  return api.get('/compounder/ambulance/');
};

export const createAmbulance = (ambulanceData) => {
  return api.post('/compounder/ambulance/', ambulanceData);
};

export const updateAmbulance = (ambulanceId, ambulanceData) => {
  return api.patch(`/compounder/ambulance/${ambulanceId}/`, ambulanceData);
};

export const deleteAmbulance = (ambulanceId) => {
  return api.delete(`/compounder/ambulance/${ambulanceId}/`);
};

// =========================================================================
// ── COMPOUNDER: AMBULANCE USAGE LOG (PHC-UC-11) ──────────────────────
// ─────────────────────────────────────────────────────────────────────────
// Separate from fleet management — records every individual dispatch event.
// Each entry captures patient_name, destination, call_date, call_time.
// PHC-BR-09 audit trail is written server-side via create_ambulance_log().
// =========================================================================

/**
 * Get all ambulance dispatch log entries.
 * @param {Object} filters - Optional: { date_from, date_to, search }
 */
export const getAmbulanceLogs = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to)   params.append('date_to',   filters.date_to);
  if (filters.search)    params.append('search',     filters.search);
  const qs = params.toString();
  return api.get(`/compounder/ambulance-log/${qs ? '?' + qs : ''}`);
};

/**
 * Create a new ambulance dispatch log entry (PHC-UC-11 M2).
 * @param {Object} logData - { patient_name, destination, call_date, call_time,
 *                             ambulance (optional id), purpose, contact_number }
 */
export const createAmbulanceLog = (logData) => {
  return api.post('/compounder/ambulance-log/', logData);
};

/**
 * Delete an ambulance log entry (correction use-case).
 * @param {number} logId
 */
export const deleteAmbulanceLog = (logId) => {
  return api.delete(`/compounder/ambulance-log/${logId}/`);
};

// =========================================================================
// ── COMPOUNDER: HOSPITAL ADMISSIONS - COMMENTED OUT ─────────────────────
// =========================================================================

// export const getAdmissions = () => {
//   return api.get('/compounder/hospital-admit/');
// };
//
// export const createAdmission = (admissionData) => {
//   return api.post('/compounder/hospital-admit/', admissionData);
// };
//
// export const updateAdmission = (admissionId, admissionData) => {
//   return api.patch(`/compounder/hospital-admit/${admissionId}/`, admissionData);
// };

// =========================================================================
// ── COMPOUNDER: PRESCRIPTION CREATION ───────────────────────────────
// =========================================================================

export const getConsultations = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.days) queryParams.append('days', params.days);
  if (params.doctor_id) queryParams.append('doctor_id', params.doctor_id);
  const query = queryParams.toString();
  return api.get(`/compounder/consultations/${query ? '?' + query : ''}`);
};

export const getDoctorsFiltered = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.active_only !== undefined) queryParams.append('active_only', params.active_only);
  if (params.specialization) queryParams.append('specialization', params.specialization);
  const query = queryParams.toString();
  return api.get(`/compounder/doctors/${query ? '?' + query : ''}`);
};

export const getUsers = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  const query = queryParams.toString();
  return api.get(`/compounder/users/${query ? '?' + query : ''}`);
};

export const createPrescription = (prescriptionData) => {
  return api.post('/compounder/prescription/', prescriptionData);
};

export const getCompounderPrescriptions = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.doctor_id) queryParams.append('doctor_id', params.doctor_id);
  if (params.status) queryParams.append('status', params.status);
  const query = queryParams.toString();
  return api.get(`/compounder/prescription/${query ? '?' + query : ''}`).then(res => {
    if (res.data && res.data.results && res.data.count !== undefined) {
      res.data = res.data.results;
    }
    return res;
  });
};

// =========================================================================
// ── COMPOUNDER: COMPLAINT RESPONSE ──────────────────────────────────
// =========================================================================

export const respondToComplaint = (complaintId, responseData) => {
  return api.patch(`/compounder/complaint/${complaintId}/respond/`, responseData);
};

// =========================================================================
// ── COMPOUNDER: REIMBURSEMENT REVIEW ────────────────────────────────
// =========================================================================

export const reviewReimbursementClaim = (claimId, reviewData) => {
  return api.patch(`/compounder/reimbursement-claims/${claimId}/review/`, reviewData);
};

// =========================================================================
// ── COMMON: DOCTORS & PATIENTS ──────────────────────────────────────
// =========================================================================

// NOTE: getPatients() and getMedicines() endpoints don't exist in backend
// These are fetched from existing models (Stock, Inventory) instead

// =========================================================================
// ── COMPOUNDER: DOCTOR SCHEDULE EXTENDED ───────────────────────────
// =========================================================================

export const deleteDoctorSchedule = (scheduleId) => {
  return api.delete(`/compounder/schedule/${scheduleId}/`);
};

export const updateDoctorSchedule = (scheduleId, scheduleData) => {
  return api.patch(`/compounder/schedule/${scheduleId}/`, {
    doctor: scheduleData.doctor_id,
    day_of_week: scheduleData.day_of_week,
    start_time: scheduleData.start_time || '09:00',
    end_time: scheduleData.end_time || '17:00',
    room_number: scheduleData.room_number || '',
  });
};

// =========================================================================
// ── COMPOUNDER: ATTENDANCE EXTENDED ─────────────────────────────────
// =========================================================================

export const getDoctorAttendance = (date = null) => {
  if (date) {
    return api.get(`/compounder/attendance/?date=${date}`);
  }
  return api.get('/compounder/attendance/');
};

export const createDoctorAttendance = (attendanceData) => {
  return api.post('/compounder/attendance/', {
    doctor: attendanceData.doctor,
    attendance_date: attendanceData.attendance_date,
    status: attendanceData.status,
    notes: attendanceData.notes || '',
  });
};

export const updateDoctorAttendanceRecord = (attendanceId, attendanceData) => {
  return api.patch(`/compounder/attendance/${attendanceId}/`, {
    doctor: attendanceData.doctor,
    attendance_date: attendanceData.attendance_date,
    status: attendanceData.status,
    notes: attendanceData.notes || '',
  });
};

export const deleteDoctorAttendance = (attendanceId) => {
  return api.delete(`/compounder/attendance/${attendanceId}/`);
};

// =========================================================================
// ── COMPOUNDER: DOCTOR DELETE ──────────────────────────────────────
// =========================================================================

export const deleteDoctor = (doctorId) => {
  return api.delete(`/compounder/doctors/${doctorId}/`);
};

// =========================================================================
// ── COMPOUNDER: CONSULTATIONS (CREATE, READ, DELETE) ────────────────
// =========================================================================

export const getConsultationsList = (days = 7, doctorId = null) => {
  const params = new URLSearchParams();
  params.append('days', days);
  if (doctorId) {
    params.append('doctor_id', doctorId);
  }
  return api.get(`/compounder/consultations/?${params.toString()}`);
};

export const createConsultation = (consultationData) => {
  return api.post('/compounder/consultation/', consultationData);
};

export const deleteConsultation = (consultationId) => {
  return api.delete(`/compounder/consultation/${consultationId}/`);
};

// =========================================================================
// ── AUDITOR: REIMBURSEMENT CLAIMS APPROVAL ──────────────────────────
// =========================================================================

export const getAuditorClaims = () => {
  return api.get('/auditor/reimbursement-claims/');
};

export const getAuditorClaim = (claimId) => {
  return api.get(`/auditor/reimbursement-claims/${claimId}/`);
};

export const approveReimbursementClaim = (claimId, remarks) => {
  return api.patch(`/auditor/reimbursement-claims/${claimId}/approve/`, {
    remarks: remarks,
  });
};

export const rejectReimbursementClaim = (claimId, remarks) => {
  return api.patch(`/auditor/reimbursement-claims/${claimId}/reject/`, {
    remarks: remarks,
  });
};

export const downloadClaimDocument = (documentId) => {
  return api.get(`/auditor/claim-documents/${documentId}/download/`, {
    responseType: 'blob',
  });
};

// =========================================================================
// ── HEALTH ANNOUNCEMENTS (PHC-UC-12) ─────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────
// All authenticated users can read. PHC staff only can create/deactivate.
// PHC-UC-17: Portal notification broadcast is triggered server-side on POST.
// =========================================================================

/** Get all active, non-expired health announcements (all authenticated users). */
export const getAnnouncements = () => api.get('/announcements/');

/**
 * Create and broadcast a health announcement (PHC staff only).
 * @param {Object} data - { title, content, category, priority?, expires_at? }
 */
export const createAnnouncement = (data) => api.post('/announcements/', data);

/**
 * Deactivate (soft-delete) a health announcement (PHC staff only).
 * @param {number} id - Announcement ID
 */
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}/`);

// =========================================================================
// ── SYSTEM REPORTS (PHC-UC-13) ───────────────────────────────────────────
// =========================================================================

/**
 * Generate utilization reports including demographics and inventory consumption.
 * @param {string} startDate - Optional YYYY-MM-DD
 * @param {string} endDate   - Optional YYYY-MM-DD
 */
export const generateSystemReport = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return api.get(`/compounder/reports/?${params.toString()}`);
};
