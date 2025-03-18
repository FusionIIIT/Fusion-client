import { createSlice } from "@reduxjs/toolkit";

const moduleSlice = createSlice({
  name: "module",
  initialState: {
    current_module: "Home",
  },

  reducers: {
    setCurrentModule: (state, action) => {
      state.current_module = action.payload;
    },
  },
});

export const { setCurrentModule } = moduleSlice.actions;
export default moduleSlice.reducer;
