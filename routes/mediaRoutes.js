const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const mediaController = require('../controllers/mediaController');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload media
router.post('/:capsuleId', auth, upload.single('image'), mediaController.uploadMedia);

// Get media
router.get('/:capsuleId', auth, mediaController.getMedia);

module.exports = router;