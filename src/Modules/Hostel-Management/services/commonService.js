import api from "./api";

const commonService = {
  // Get notices
  getNotices: () => api.get("/hostelmanagement/hostel-notices/"),

  // Create notice
  createNotice: (data) =>
    api.post("/hostelmanagement/create_notice/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Update notice
  updateNotice: (data, noticeId) => {
    const payload = data instanceof FormData ? data : new FormData();
    if (data instanceof FormData === false) {
      Object.entries(data || {}).forEach(([key, value]) => {
        payload.append(key, value);
      });
    }
    payload.append("id", noticeId);
    return api.post("/hostelmanagement/update_notice/", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete notice
  deleteNotice: (data) => api.post("/hostelmanagement/delete_notice/", data),

  // Hostel complaints (warden/caretaker)
  getHostelComplaints: (params = {}) =>
    api.get("/hostelmanagement/hostel-complaints/", { params }),
  updateHostelComplaintStatus: (complaintId, status) =>
    api.post(`/hostelmanagement/hostel-complaints/${complaintId}/status/`, {
      status,
    }),

  // Get student info (used across modules)
  getStudentsInfo: () =>
    api.get("/hostelmanagement/students_get_students_info/"),

  // Get caretaker's students info
  getCaretakerStudentsInfo: () =>
    api.get("/hostelmanagement/caretaker_get_students_info/"),
};

export default commonService;
