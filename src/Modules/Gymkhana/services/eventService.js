import apiClient from "./apiClient";

export const getUpcomingEvents = async () => {
  const response = await apiClient.get("/gymkhana/api/events/");
  return response.data;
};

export const getPastEvents = async () => {
  const response = await apiClient.get("/gymkhana/api/events/?past=true");
  return response.data;
};

export const createEvent = async (eventData) => {
  const response = await apiClient.put("/gymkhana/api/events/new/", eventData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateEvent = async (eventData) => {
  const response = await apiClient.put("/gymkhana/api/events/new/", eventData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteEvent = async (eventId) => {
  const response = await apiClient.delete("/gymkhana/api/events/delete/", {
    data: { id: eventId },
  });
  return response.data;
};

export const approveFICEvent = async (eventId) => {
  const response = await apiClient.put("/gymkhana/api/events/approve/", {
    id: eventId,
  });
  return response.data;
};

export const approveCounsellorEvent = async (eventId) => {
  const response = await apiClient.put("/gymkhana/api/events/approve/", {
    id: eventId,
  });
  return response.data;
};

export const approveDeanEvent = async (eventId) => {
  const response = await apiClient.put("/gymkhana/api/events/approve/", {
    id: eventId,
  });
  return response.data;
};

export const rejectEvent = async (eventId) => {
  const response = await apiClient.put("/gymkhana/api/events/delete/", {
    id: eventId,
  });
  return response.data;
};

export const getEventComments = async (eventId) => {
  const response = await apiClient.post("/gymkhana/api/events/comments/", {
    event_id: eventId,
  });
  return response.data;
};

export const addEventComment = async ({
  eventId,
  commentatorDesignation,
  comment,
}) => {
  const response = await apiClient.post("/gymkhana/api/events/comments/add/", {
    event_id: eventId,
    commentator_designation: commentatorDesignation,
    comment,
  });
  return response.data;
};
