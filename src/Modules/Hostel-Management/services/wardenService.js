import api from "./api";

const wardenService = {
  // Download hostel allotment
  downloadHostelAllotment: () =>
    api.get("/hostelmanagement/download_hostel_allotment/"),

  // Assign rooms by warden
  assignRoomsByWarden: (formData) =>
    api.post("/hostelmanagement/assign-roomsbywarden/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Update student allotment
  updateStudentAllotment: () =>
    api.get("/hostelmanagement/update-student-allotment/"),

  // Create notice
  createNotice: (data) => api.post("/hostelmanagement/create_notice/", data),

  // Delete notice
  deleteNotice: (data) => api.post("/hostelmanagement/delete_notice/", data),

  // Get notices
  getNotices: () => api.get("/hostelmanagement/hostel_notices/"),

  // Room change requests
  getRoomChangeRequests: () =>
    api.get("/hostelmanagement/api/room-change-requests/"),
  updateRoomChangeStatus: (requestId, status) =>
    api.patch(
      `/hostelmanagement/api/room-change-requests/${requestId}/status/`,
      { status },
    ),
};

export default wardenService;
