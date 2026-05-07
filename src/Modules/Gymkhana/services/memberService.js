import apiClient from "./apiClient";

export const getClubMembers = async (clubName) => {
  const response = await apiClient.post("/gymkhana/api/clubs/members/", {
    club_name: clubName,
  });
  return response.data;
};

export const approveMember = async (memberId) => {
  const response = await apiClient.post("/gymkhana/api/members/approve/", {
    id: memberId,
  });
  return response.data;
};

export const rejectMember = async (memberId) => {
  const response = await apiClient.post("/gymkhana/api/members/reject/", {
    id: memberId,
  });
  return response.data;
};

export const requestMembership = async (memberData) => {
  const response = await apiClient.post(
    "/gymkhana/api/members/join/",
    memberData,
  );
  return response.data;
};
