import { host } from "../globalRoutes";

export const getNotices = `${host}/hostelmanagement/hostel_notices/`;
export const getCaretakers = `${host}/hostelmanagement/get_caretakers/`;
export const getWardens = `${host}/hostelmanagement/get_wardens/`;
export const getBatches = `${host}/hostelmanagement/get_batches/`;
export const createNotice = `${host}/hostelmanagement/create_notice/`;
export const deleteNotice = `${host}/hostelmanagement/delete_notice/`;
export const viewHostel = `${host}/hostelmanagement/admin-hostel-list`;
export const requestRoom = `${host}/hostelmanagement/book_guest_room/`;
export const requestLeave = `${host}/hostelmanagement/create_hostel_leave/`;
export const addHostelRoute = `${host}/hostelmanagement/add-hostel/`;
export const assignCaretakers = `${host}/hostelmanagement/assign_caretakers/`;
export const assignWarden = `${host}/hostelmanagement/assign_warden/`;
export const assignBatch = `${host}/hostelmanagement/assign_batch/`;
export const getStudentsInfo = `${host}/hostelmanagement/students_get_students_info/`;
export const request_guest_room = `${host}/hostelmanagement/book_guest_room/`;
export const getStudentsInfo2 = `${host}/hostelmanagement/caretaker_get_students_info/`;
export const imposeFineRoute = `${host}/hostelmanagement/impose-fine/`;
export const show_leave_request = `${host}/hostelmanagement/all_leave_data/`;
export const update_leave_status = `${host}/hostelmanagement/update_leave_status/`;
export const fetch_fines_url = `${host}/hostelmanagement/fetch-fine/`;
export const update_fine_status_url = (fine_id) =>
  `${host}/hostelmanagement/update-fine-status/${fine_id}/`;
export const fetch_complaint = `${host}/hostelmanagement/hostel_complaints/`;
export const fine_show = `${host}/hostelmanagement/fine-show/`;
export const my_leaves = `${host}/hostelmanagement/my_leaves/`;
export const show_guestroom_booking_request = `${host}/hostelmanagement/fetching_guest_room_request/`;
export const update_guest_room = `${host}/hostelmanagement/update_guest_room/`;
export const get_intender_id = `${host}/hostelmanagement/get_intender_id/`;
export const get_guestroom_bookings_for_students = `${host}/hostelmanagement/get_guest_room_request_students/`;
export const upload_attendance = `${host}/hostelmanagement/upload_attendance/`;
export const view_attendance = `${host}/hostelmanagement/view_attendance/`;
export const assign_batch = `${host}/hostelmanagement/batch-assign/`;
export const download_hostel_allotment = `${host}/hostelmanagement/download_hostel_allotment/`;
