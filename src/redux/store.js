import { configureStore } from "@reduxjs/toolkit";
import taskReducer from "./todo/taskSlice.js";

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
});
