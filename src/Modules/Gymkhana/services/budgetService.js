import apiClient from "./apiClient";

export const getUpcomingBudgets = async () => {
  const response = await apiClient.get("/gymkhana/api/budget/club/");
  return response.data;
};

export const createBudget = async (budgetData) => {
  const response = await apiClient.put(
    "/gymkhana/api/budget/club/",
    budgetData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

export const updateBudget = async (budgetId, budgetData) => {
  const response = await apiClient.put("/gymkhana/api/budget/update-amount/", {
    id: budgetId,
    ...budgetData,
  });
  return response.data;
};

export const approveFICBudget = async (budgetId) => {
  const response = await apiClient.put("/gymkhana/api/budget/approve/", {
    id: budgetId,
  });
  return response.data;
};

export const approveCounsellorBudget = async (budgetId) => {
  const response = await apiClient.put("/gymkhana/api/budget/approve/", {
    id: budgetId,
  });
  return response.data;
};

export const approveDeanBudget = async (budgetId) => {
  const response = await apiClient.put("/gymkhana/api/budget/approve/", {
    id: budgetId,
  });
  return response.data;
};

export const reviewDeanBudget = async (budgetId) => {
  const response = await apiClient.put("/gymkhana/api/budget/approve/", {
    id: budgetId,
  });
  return response.data;
};

export const rejectBudget = async (budgetId) => {
  const response = await apiClient.put("/gymkhana/api/budget/reject/", {
    id: budgetId,
  });
  return response.data;
};

export const getBudgetComments = async (budgetId) => {
  const response = await apiClient.post("/gymkhana/api/budget/comments/", {
    budget_id: budgetId,
  });
  return response.data;
};

export const addBudgetComment = async ({
  budgetId,
  commentatorDesignation,
  comment,
}) => {
  const response = await apiClient.post("/gymkhana/api/budget/comments/add/", {
    budget_id: budgetId,
    commentator_designation: commentatorDesignation,
    comment,
  });
  return response.data;
};
