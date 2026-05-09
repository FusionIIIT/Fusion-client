import api from "./api";

const caretakerService = {
  // Get caretaker's student information
  getStudentsInfo: () =>
    api.get("/hostelmanagement/caretaker_get_students_info/"),

  // Get fines for management
  getFines: () => api.get("/hostelmanagement/fetch-fine/"),

  // Update fine status
  updateFineStatus: (fineId, status) =>
    api.post(`/hostelmanagement/update-fine-status/${fineId}/`, { status }),

  // Delete fine
  deleteFine: (fineId) =>
    api.delete(`/hostelmanagement/fine/delete/${fineId}/`),

  // Impose fine on student
  imposeFine: (data) => api.post("/hostelmanagement/impose-fine/", data),

  // Get leave requests
  getLeaveRequests: () => api.get("/hostelmanagement/api/leaves/"),

  // Update leave status
  updateLeaveStatus: (data) =>
    api.patch(`/hostelmanagement/api/leaves/${data.leave_id}/status/`, data),

  // Download/view supporting document for a leave
  getLeaveDocument: (leaveId) =>
    api.get(`/hostelmanagement/api/leaves/${leaveId}/document/`, {
      responseType: "blob",
    }),

  // Upload attendance
  uploadAttendance: (formData) =>
    api.post("/hostelmanagement/upload_attendance/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Room change requests
  getRoomChangeRequests: () =>
    api.get("/hostelmanagement/api/room-change-requests/"),
  updateRoomChangeStatus: (requestId, status) =>
    api.patch(
      `/hostelmanagement/api/room-change-requests/${requestId}/status/`,
      { status },
    ),

  // Create notice
  createNotice: (data) => api.post("/hostelmanagement/create_notice/", data),

  // Delete notice
  deleteNotice: (data) => api.post("/hostelmanagement/delete_notice/", data),
};

export default caretakerService;
