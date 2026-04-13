import complaintApi from "./api";

const buildComplaintFormData = (payload) => {
  const formData = new FormData();
  const fields = [
    "complaint_type",
    "location",
    "specific_location",
    "details",
    "status",
    "remarks",
    "reason",
    "comment",
    "priority",
    "verification_source",
    "reopen_reason",
    "reopen_requested",
    "progress_notes",
    "estimated_resolution_time",
  ];

  fields.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== null) {
      formData.append(field, payload[field]);
    }
  });

  if (payload.assigned_to !== undefined && payload.assigned_to !== null) {
    formData.append("assigned_to", payload.assigned_to);
  }

  if (payload.upload_complaint instanceof File) {
    formData.append("upload_complaint", payload.upload_complaint);
  }

  if (payload.progress_attachment instanceof File) {
    formData.append("progress_attachment", payload.progress_attachment);
  }

  return formData;
};

export const createComplaint = async (payload) => {
  const response = await complaintApi.post(
    "/newcomplain",
    buildComplaintFormData(payload),
  );
  return response.data;
};

export const updateComplaint = async (id, payload) => {
  const response = await complaintApi.put(
    `/updatecomplain/${id}`,
    buildComplaintFormData(payload),
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

export const verifyComplaint = async (id, payload) => {
  const response = await complaintApi.post(`/verify/${id}`, payload);
  return response.data;
};

export const reopenComplaint = async (id, payload) => {
  const response = await complaintApi.post(`/reopen/${id}`, payload);
  return response.data;
};

export const caretakerAction = async (id, payload) => {
  const response = await complaintApi.post(
    `/caretaker-action/${id}`,
    buildComplaintFormData(payload),
  );
  return response.data;
};
