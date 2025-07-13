const Comment = require('../models/comment');

// Add a comment
exports.addComment = async (req, res) => {
  try {
    console.log('📨 Incoming comment POST request');
    console.log('Params:', req.params); // capsuleId
    console.log('Body:', req.body);     // message
    console.log('User:', req.user);     // userId

    const { message } = req.body;
    const { capsuleId } = req.params;

    if (!message) return res.status(400).json({ message: 'Message is required' });

    const comment = new Comment({
      capsuleId,
      userId: req.user._id,
      message,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};

// Get comments for a capsule
exports.getCommentsByCapsule = async (req, res) => {
  try {
    const comments = await Comment.find({ capsuleId: req.params.capsuleId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
};