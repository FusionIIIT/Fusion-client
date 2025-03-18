import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userslice";
import moduleReducer from "./moduleslice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    module: moduleReducer,
  },
});
