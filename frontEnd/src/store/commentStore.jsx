// store/commentStore.js
import { create } from "zustand";
import axios from "@/utils/axios";

export const useCommentStore = create((set, get) => ({
  comments: [],
  loading: false,
  error: null,

  fetchComments: async (blogId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`/comments/blog/${blogId}`);
      set({
        comments: Array.isArray(data?.comments) ? data.comments : [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err?.response?.data?.message || "Error",
        loading: false,
        comments: [],
      });
    }
  },

  addComment: async (blogId, content) => {
    const { data } = await axios.post(`/comments/${blogId}`, { content });
    set((state) => ({ comments: [data, ...(state.comments || [])] }));
    return data;
  },

  deleteComment: async (commentId) => {
    await axios.delete(`/comments/${commentId}`);
    set((state) => ({
      comments: (state.comments || []).filter((c) => c._id !== commentId),
    }));
  },
}));
