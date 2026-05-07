import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import apiClient from "../services/apiClient";

// Fetch upcoming events
export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: async () => {
      const response = await apiClient.get("/gymkhana/api/events/");
      return response.data;
    },
  });
};

// Fetch past events
export const usePastEvents = () => {
  return useQuery({
    queryKey: ["pastEvents"],
    queryFn: async () => {
      const response = await apiClient.get("/gymkhana/api/events/?past=true");
      return response.data;
    },
  });
};

// Fetch event comments
export const useEventComments = (eventId) => {
  return useQuery({
    queryKey: ["eventComments", eventId],
    queryFn: async () => {
      const response = await apiClient.post("/gymkhana/api/events/comments/", {
        event_id: eventId,
      });
      return response.data;
    },
    enabled: !!eventId,
  });
};

// Create event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData) => {
      const response = await apiClient.put(
        "/gymkhana/api/events/new/",
        eventData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcomingEvents"]);
      notifications.show({
        title: "Success",
        message: "Event created successfully",
        color: "green",
      });
    },
  });
};

// Update event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData) => {
      const response = await apiClient.put(
        "/gymkhana/api/events/new/",
        eventData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcomingEvents"]);
      notifications.show({
        title: "Success",
        message: "Event updated successfully",
        color: "green",
      });
    },
  });
};

// Delete event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const response = await apiClient.delete("/gymkhana/api/events/delete/", {
        data: { id: eventId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcomingEvents"]);
      notifications.show({
        title: "Success",
        message: "Event deleted successfully",
        color: "green",
      });
    },
  });
};

// Approve event by FIC
export const useApproveFICEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const response = await apiClient.put("/gymkhana/api/events/approve/", {
        id: eventId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcomingEvents"]);
      notifications.show({
        title: "Approved",
        message: "Event approved by FIC",
        color: "green",
      });
    },
  });
};

// Approve event by Counsellor
export const useApproveCounsellorEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const response = await apiClient.put("/gymkhana/api/events/approve/", {
        id: eventId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcomingEvents"]);
      notifications.show({
        title: "Approved",
        message: "Event approved by Counsellor",
        color: "green",
      });
    },
  });
};

// Approve event by Dean
export const useApproveDeanEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const response = await apiClient.put("/gymkhana/api/events/approve/", {
        id: eventId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcomingEvents"]);
      notifications.show({
        title: "Approved",
        message: "Event approved by Dean",
        color: "green",
      });
    },
  });
};

// Reject event
export const useRejectEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId) => {
      const response = await apiClient.put("/gymkhana/api/events/delete/", {
        id: eventId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcomingEvents"]);
      notifications.show({
        title: "Rejected",
        message: "Event rejected",
        color: "orange",
      });
    },
  });
};

// Add event comment
export const useAddEventComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, commentatorDesignation, comment }) => {
      const response = await apiClient.post(
        "/gymkhana/api/events/comments/add/",
        {
          event_id: eventId,
          commentator_designation: commentatorDesignation,
          comment,
        },
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["eventComments", variables.eventId]);
      notifications.show({
        title: "Success",
        message: "Comment added",
        color: "green",
      });
    },
  });
};

// Fetch coordinator events for newsletter
export const useCoordinatorEvents = (rollNo, token) => {
  return useQuery({
    queryKey: ["coordinatorEvents", rollNo],
    queryFn: async () => {
      const response = await apiClient.post("/gymkhana/api/events/", {
        roll_number: rollNo,
      });
      return response.data;
    },
    enabled: !!rollNo,
  });
};
