const Media = require('../models/media');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload media to a capsule
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const newMedia = new Media({
      capsuleId: req.params.capsuleId,
      imageData: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await newMedia.save();
    res.status(201).json({ message: 'Media uploaded', mediaId: newMedia._id });
  } catch (err) {
    console.error('Error uploading media:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// Retrieve media for a capsule
exports.getMedia = async (req, res) => {
  try {
    const media = await Media.findOne({ capsuleId: req.params.capsuleId });
    if (!media) return res.status(404).json({ message: 'No media found' });

    res.set('Content-Type', media.contentType);
    res.send(media.mediaData);
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).json({ message: 'Fetch failed' });
  }
};