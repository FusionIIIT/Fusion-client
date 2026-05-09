export const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Token ${token}` } : {};
};
