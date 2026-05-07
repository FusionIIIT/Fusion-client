import apiClient from "./apiClient";

export const getClubDetails = async (clubName) => {
  const response = await apiClient.post("/gymkhana/api/clubs/", {
    club_name: clubName,
  });
  return response.data;
};

export const getClubMembers = async (clubName) => {
  const response = await apiClient.post("/gymkhana/api/clubs/members/", {
    club_name: clubName,
  });
  return response.data;
};

export const getClubAchievements = async (clubName) => {
  const response = await apiClient.post("/gymkhana/api/clubs/", {
    club_name: clubName,
  });
  return response.data;
};

export const getClubPositionData = async () => {
  const response = await apiClient.get("/gymkhana/api/clubs/");
  return response.data;
};

export const getCurrentLoginRoleRelatedClub = async (rollNo) => {
  const response = await apiClient.post("/gymkhana/api/clubs/", {
    name: rollNo,
  });
  return response.data;
};

export const getFests = async () => {
  const response = await apiClient.get("/gymkhana/api/budget/fest/");
  return response.data;
};

export const createFest = async (festData) => {
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
};
