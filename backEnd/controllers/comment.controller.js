import Comment from '../models/comment.model.js';

export const createComment = async (req, res) => {
  const { content } = req.body;
  const { blogId } = req.params; 
  const userId = req.user._id;

  if (!content?.trim()) return res.status(400).json({ message: 'Comment is empty' });

  try {
    const newComment = await Comment.create({ blogId, userId, content });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create comment' });
  }
};


export const getCommentsByBlogId = async (req, res) => {
  const { blogId } = req.params;
  try {
    const comments = await Comment.find({ blogId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.userId.toString() === user._id.toString();
    const isAdmin = ['admin', 'superadmin'].includes(user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
