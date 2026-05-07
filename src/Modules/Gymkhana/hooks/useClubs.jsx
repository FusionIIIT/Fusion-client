import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import apiClient from "../services/apiClient";

// Fetch club data
export const useClubData = (clubName) => {
  return useQuery({
    queryKey: ["clubData", clubName],
    queryFn: async () => {
      const response = await apiClient.post("/gymkhana/api/clubs/", {
        club_name: clubName,
      });
      return response.data;
    },
    enabled: !!clubName && clubName !== "Select a Club",
  });
};

// Fetch club members
export const useClubMembers = (clubName, token) => {
  return useQuery({
    queryKey: ["clubMembers", clubName],
    queryFn: async () => {
      const response = await apiClient.post("/gymkhana/api/clubs/members/", {
        club_name: clubName,
      });
      return response.data;
    },
    enabled: !!clubName && clubName !== "Select a Club",
  });
};

// Fetch club achievements
export const useClubAchievements = (clubName, token) => {
  return useQuery({
    queryKey: ["clubAchievements", clubName],
    queryFn: async () => {
      const response = await apiClient.post("/gymkhana/api/clubs/", {
        club_name: clubName,
      });
      return response.data;
    },
    enabled: !!clubName && clubName !== "Select a Club",
  });
};

// Fetch club position data
export const useClubPositionData = (token) => {
  return useQuery({
    queryKey: ["clubPositionData"],
    queryFn: async () => {
      const response = await apiClient.get("/gymkhana/api/clubs/");
      return response.data;
    },
  });
};

// Fetch current user's role related club
export const useCurrentLoginRoleRelatedClub = (rollNo, token) => {
  return useQuery({
    queryKey: ["currentLoginRoleRelatedClub", rollNo],
    queryFn: async () => {
      const response = await apiClient.post("/gymkhana/api/clubs/", {
        name: rollNo,
      });
      return response.data;
    },
    enabled: !!rollNo,
  });
};

// Fetch all club positions
export const useAllClubPositions = (token) => {
  return useQuery({
    queryKey: ["allClubPositions"],
    queryFn: async () => {
      const response = await apiClient.get("/gymkhana/api/clubs/");
      return response.data;
    },
  });
};

// Fetch fests
export const useFests = () => {
  return useQuery({
    queryKey: ["fests"],
    queryFn: async () => {
      const response = await apiClient.get("/gymkhana/api/budget/fest/");
      return response.data;
    },
  });
};

// Create fest
export const useCreateFest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (festData) => {
      const formData = new FormData();
      formData.append("name", festData.name);
      formData.append("category", festData.category);
      formData.append("description", festData.description);
      formData.append("date", festData.date);
      formData.append("link", festData.link);

      const response = await apiClient.post(
        "/gymkhana/api/budget/fest/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["fests"]);
      notifications.show({
        title: "Success",
        message: "Fest created successfully",
        color: "green",
      });
    },
  });
};
