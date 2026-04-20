import complaintApi from "./api";

export const fetchWorkers = async () => {
  const response = await complaintApi.get("/workers");
  return response.data?.workers || [];
};

export const createWorker = async (payload) => {
  const response = await complaintApi.post("/addworker", payload);
  return response.data;
};

export const updateWorker = async (id, payload) => {
  const response = await complaintApi.put(`/updateworker/${id}`, payload);
  return response.data;
};

export const deleteWorker = async (id) => {
  const response = await complaintApi.delete(`/removeworker/${id}`);
  return response.data;
};

export const fetchCaretakers = async () => {
  const response = await complaintApi.get("/caretakers");
  return response.data?.caretakers || [];
};

export const createCaretaker = async (payload) => {
  const response = await complaintApi.post("/addcaretaker", payload);
  return response.data;
};

export const updateCaretaker = async (id, payload) => {
  const response = await complaintApi.put(`/updatecaretaker/${id}`, payload);
  return response.data;
};

export const deleteCaretaker = async (id) => {
  const response = await complaintApi.delete(`/removecaretaker/${id}`);
  return response.data;
};

export const fetchSupervisors = async () => {
  const response = await complaintApi.get("/supervisors");
  return response.data?.supervisors || [];
};

export const createSupervisor = async (payload) => {
  const response = await complaintApi.post("/addsupervisor", payload);
  return response.data;
};

export const updateSupervisor = async (id, payload) => {
  const response = await complaintApi.put(`/updatesupervisor/${id}`, payload);
  return response.data;
};

export const deleteSupervisor = async (id) => {
  const response = await complaintApi.delete(`/removesupervisor/${id}`);
  return response.data;
};

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
    "is_draft",
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

export const submitDraftComplaint = async (id, payload = {}) => {
  const response = await complaintApi.post(
    `/submitdraft/${id}`,
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

export const submitComplaintFeedback = async (id, payload) => {
  const response = await complaintApi.post(`/feedback/${id}`, payload);
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

export const bulkComplaintAction = async (payload) => {
  const response = await complaintApi.post("/bulk-action", payload);
  return response.data;
};

export const fetchComplaintAnalyticsReport = async (filters = {}) => {
  const response = await complaintApi.get("/report-analytics", {
    params: {
      date_from: filters.date_from || "",
      date_to: filters.date_to || "",
      category: filters.category || "",
      location: filters.location || "",
    },
  });
  return response.data;
};
