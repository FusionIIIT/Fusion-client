import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import apiClient from "../services/apiClient";

// Fetch yearly plans
export const useYearlyPlans = () => {
  return useQuery({
    queryKey: ["yearlyPlans"],
    queryFn: async () => {
      const response = await apiClient.get("/gymkhana/api/yearly-plans/");
      return response.data;
    },
  });
};

// Fetch clubwise yearly plans
export const useClubwiseYearlyPlans = () => {
  return useQuery({
    queryKey: ["clubwiseYearlyPlans"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/gymkhana/api/clubwise_yearly_plan/",
      );
      return response.data;
    },
  });
};

// Upload yearly plan
export const useUploadYearlyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const response = await apiClient.post(
        "/gymkhana/api/upload_yearly_plan_excel/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["yearlyPlans"]);
      notifications.show({
        title: "Success",
        message: "Yearly plan uploaded successfully",
        color: "green",
      });
    },
  });
};

// Approve yearly plan by FIC
export const useApproveFICYearlyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId) => {
      const response = await apiClient.put(
        "/gymkhana/api/fic_approve_yearly_plan/",
        {
          id: planId,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["yearlyPlans"]);
      notifications.show({
        title: "Approved",
        message: "Yearly plan approved by FIC",
        color: "green",
      });
    },
  });
};

// Approve yearly plan by Counsellor
export const useApproveCounsellorYearlyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId) => {
      const response = await apiClient.put(
        "/gymkhana/api/counsellor_approve_yearly_plan/",
        { id: planId },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["yearlyPlans"]);
      notifications.show({
        title: "Approved",
        message: "Yearly plan approved by Counsellor",
        color: "green",
      });
    },
  });
};

// Approve yearly plan by Dean
export const useApproveDeanYearlyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId) => {
      const response = await apiClient.put(
        "/gymkhana/api/dean_approve_yearly_plan/",
        {
          id: planId,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["yearlyPlans"]);
      notifications.show({
        title: "Approved",
        message: "Yearly plan approved by Dean",
        color: "green",
      });
    },
  });
};

// Reject yearly plan
export const useRejectYearlyPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId) => {
      const response = await apiClient.put(
        "/gymkhana/api/reject_yearly_plan/",
        {
          id: planId,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["yearlyPlans"]);
      notifications.show({
        title: "Rejected",
        message: "Yearly plan rejected",
        color: "red",
      });
    },
  });
};
