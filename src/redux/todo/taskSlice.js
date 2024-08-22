import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  isEditing: false,
  editIndex: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask(state, action) {
      state.tasks.push(action.payload);
    },
    editTask(state, action) {
      const { index, task } = action.payload;
      state.tasks[index] = task;
    },
    removeTask(state, action) {
      state.tasks = state.tasks.filter((_, i) => i !== action.payload);
    },
    removeAllTasks(state) {
      state.tasks = [];
    },
    setEditing(state, action) {
      state.isEditing = action.payload.isEditing;
      state.editIndex = action.payload.editIndex;
    },
    loadTasks(state, action) {
      state.tasks = action.payload;
    },
  },
});

export const {
  addTask,
  editTask,
  removeTask,
  removeAllTasks,
  setEditing,
  loadTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
