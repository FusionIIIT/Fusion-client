import complaintApi from "./api";

const normalizeComplaintPayload = (payload) => ({
  complaint_type: payload.complaint_type,
  location: payload.location,
  specific_location: payload.specific_location || "",
  details: payload.details,
  status: payload.status,
  remarks: payload.remarks,
  reason: payload.reason,
  comment: payload.comment,
});

export const createComplaint = async (payload) => {
  const response = await complaintApi.post(
    "/newcomplain",
    normalizeComplaintPayload(payload),
  );
  return response.data;
};

export const updateComplaint = async (id, payload) => {
  const response = await complaintApi.put(
    `/updatecomplain/${id}`,
    normalizeComplaintPayload(payload),
  );
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await complaintApi.delete(`/removecomplain/${id}`);
  return response.data;
};

export const escalateComplaint = async (id, reason) => {
  const response = await complaintApi.post(`/escalate/${id}`, {
    escalation_reason: reason,
  });
  return response.data;
};
