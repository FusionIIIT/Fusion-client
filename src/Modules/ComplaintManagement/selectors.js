import complaintApi from "./api";

export const fetchComplaints = async () => {
  const response = await complaintApi.get("/studentcomplain");
  return response.data?.student_complain || [];
};

export const fetchComplaintDetail = async (id) => {
  const response = await complaintApi.get(`/user/detail/${id}/`);
  return response.data;
};
