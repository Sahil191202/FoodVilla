import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    activeTab: "overview",
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setActiveTab } = adminSlice.actions;
export const selectActiveTab = (state) => state.admin.activeTab;
export default adminSlice.reducer;