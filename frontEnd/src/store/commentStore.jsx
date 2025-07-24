import { create } from 'zustand';
import axios from '@/utils/axios';

export const useCommentStore = create((set) => ({
  comments: [],
  loading: false,
  error: null,

  fetchComments: async (blogId) => {
    set({ loading: true });
    try {
      const { data } = await axios.get(`/comments/blog/${blogId}`);
      set({ comments: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error', loading: false });
    }
  },

  addComment: async (blogId, content) => {
    try {
      const { data } = await axios.post(`/comments/${blogId}`, { content });
      set((state) => ({ comments: [data, ...state.comments] }));
    } catch (err) {
      console.error(err);
    }
  },

  deleteComment: async (commentId) => {
    try {
      await axios.delete(`/comments/${commentId}`);
      set((state) => ({
        comments: state.comments.filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
