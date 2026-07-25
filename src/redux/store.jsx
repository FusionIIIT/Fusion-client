import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userslice";
import moduleReducer from "./moduleslice";
import pfReducer from "./pfNoSlice";

const appReducer = combineReducers({
  user: userReducer,
  module: moduleReducer,
  pfNo: pfReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "RESET_STORE") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
