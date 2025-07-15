const Media = require('../models/media');
const mongoose = require('mongoose');

exports.uploadMedia = async (req, res) => {
  try {
    const capsuleId = req.params.capsuleId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newMedia = new Media({
      capsuleId: new mongoose.Types.ObjectId(capsuleId),
      mediaData: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await newMedia.save();
    res.status(201).json({ message: 'Media uploaded', mediaId: newMedia._id });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const capsuleId = req.params.capsuleId;

    const media = await Media.findOne({
      capsuleId: new mongoose.Types.ObjectId(capsuleId),
    });

    if (!media) {
      console.log('No media found for capsuleId:', capsuleId);
      return res.status(404).json({ message: 'No media found' });
    }

    console.log(media.contentType);

    res.set('Content-Type', media.contentType);
    res.send(media.imageData);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};