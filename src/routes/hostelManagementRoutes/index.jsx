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
