const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addComment, getCommentsByCapsule } = require('../controllers/commentController');

router.post('/:capsuleId', auth, addComment);
router.get('/:capsuleId', auth, getCommentsByCapsule);

module.exports = router;