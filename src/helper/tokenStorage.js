const TOKEN_KEY = "authToken";

export const tokenStorage = {
  getAccess() {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh() {
    return localStorage.getItem(TOKEN_KEY); // Return same token for refresh
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  },
  setTokens({ access }) {
    // For backward compatibility, but we now use single token
    if (access) localStorage.setItem(TOKEN_KEY, access);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
