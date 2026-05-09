/**
 * Notification Redux Slice
 * Manages notification state globally
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notificationsList: [],
  announcementsList: [],
  loading: false,
  error: null,
  sortedBy: "Most Recent",
  activeTab: "0",
  loadingId: -1,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Set notifications
    setNotifications: (state, action) => {
      state.notificationsList = action.payload;
    },

    // Set announcements
    setAnnouncements: (state, action) => {
      state.announcementsList = action.payload;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Update sort option
    setSortedBy: (state, action) => {
      state.sortedBy = action.payload;
    },

    // Update active tab
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    // Set loading notification ID
    setLoadingId: (state, action) => {
      state.loadingId = action.payload;
    },

    // Update notification status
    updateNotificationStatus: (state, action) => {
      const { notifId, updates } = action.payload;
      const notif = state.notificationsList.find((n) => n.id === notifId);
      const announce = state.announcementsList.find((n) => n.id === notifId);
      if (notif) Object.assign(notif, updates);
      if (announce) Object.assign(announce, updates);
    },

    // Remove notification
    removeNotification: (state, action) => {
      const notifId = action.payload;
      state.notificationsList = state.notificationsList.filter(
        (n) => n.id !== notifId,
      );
      state.announcementsList = state.announcementsList.filter(
        (n) => n.id !== notifId,
      );
    },

    // Clear all
    clearNotifications: (state) => {
      state.notificationsList = [];
      state.announcementsList = [];
      state.error = null;
    },
  },
});

export const {
  setNotifications,
  setAnnouncements,
  setLoading,
  setError,
  setSortedBy,
  setActiveTab,
  setLoadingId,
  updateNotificationStatus,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
