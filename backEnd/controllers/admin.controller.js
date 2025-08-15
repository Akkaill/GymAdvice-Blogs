export const someAdminController = (req, res) => {
  res.json({
    success: true,
    message: `Hello ${req.user.username} (${req.user.role})`,
    data: {
      username: req.user.username,
      role: req.user.role,
      id: req.user._id,
      loggedInAt: new Date().toISOString(),
    },
  });
};
