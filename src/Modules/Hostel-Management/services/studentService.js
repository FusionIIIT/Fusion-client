import api from "./api";

const studentService = {
  // Get student information
  getStudentsInfo: () =>
    api.get("/hostelmanagement/students_get_students_info/"),

  // Get student's own leaves
  getMyLeaves: () => api.get("/hostelmanagement/api/leaves/me/"),

  // Download/view supporting document for a leave
  getLeaveDocument: (leaveId) =>
    api.get(`/hostelmanagement/api/leaves/${leaveId}/document/`, {
      responseType: "blob",
    }),

  // Get fines for student
  getStudentFines: () => api.get("/hostelmanagement/fine/show/"),

  // Submit leave request
  requestLeave: (data, config = {}) =>
    api.post("/hostelmanagement/api/leaves/", data, config),

  // Get complaints
  getComplaints: () => api.get("/hostelmanagement/register_complaint/"),

  // Submit complaint
  submitComplaint: (data, config = {}) =>
    api.post("/hostelmanagement/register_complaint/", data, config),

  // Submit room change request
  submitRoomChangeRequest: (data, config = {}) =>
    api.post("/hostelmanagement/room-change-request/", data, config),

  // Get room change requests for student
  getMyRoomChangeRequests: () =>
    api.get("/hostelmanagement/room-change-request/"),

  // Get available rooms for the student's hall
  getAvailableRoomsForStudent: () =>
    api.get("/hostelmanagement/api/rooms/available/"),

  // Request guest room
  requestGuestRoom: (data) =>
    api.post("/hostelmanagement/book_guest_room/", data),

  // Get guest room bookings
  getGuestRoomBookings: () =>
    api.get("/hostelmanagement/get_guest_room_request_students/"),

  // Get attendance
  viewAttendance: (year, month) =>
    api.get(`/hostelmanagement/view_attendance/?year=${year}&month=${month}`, {
      responseType: "blob",
    }),
};

export default studentService;
