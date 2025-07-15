const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const mediaController = require('../controllers/mediaController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/:capsuleId', auth, upload.single('image'), mediaController.uploadMedia);
router.get('/:capsuleId', auth, mediaController.getMedia);

module.exports = router;