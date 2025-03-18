import { createSlice, current } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    username: "User",
    roles: ["Guest-User"],
    role: "Guest-User",
    accessibleModules: {}, // Format---> {role: {module: true}}
    currentAccessibleModules: {}, // Format---> {module: true}
  },
  reducers: {
    setUserName: (state, action) => {
      state.username = action.payload;
    },
    setRoles: (state, action) => {
      state.roles = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setAccessibleModules: (state, action) => {
      state.accessibleModules = action.payload;
    },
    setCurrentAccessibleModules: (state) => {
      state.currentAccessibleModules = current(state.accessibleModules)[
        state.role
      ];
    },
    clearUserName: (state) => {
      state.username = "User";
    },
    clearRoles: (state) => {
      state.roles = null;
    },
  },
});

export const {
  setUserName,
  setRoles,
  setRole,
  setAccessibleModules,
  setCurrentAccessibleModules,
  clearUserName,
  clearRoles,
} = userSlice.actions;
export default userSlice.reducer;
