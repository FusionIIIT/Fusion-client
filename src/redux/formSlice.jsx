import { createSlice } from "@reduxjs/toolkit";

const formSlice = createSlice({
  name: "form",
  initialState: {},
  reducers: {
    updateForm: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetForm: () => {
      return {};
    },
  },
});

export const { updateForm, resetForm } = formSlice.actions;
export default formSlice.reducer;
