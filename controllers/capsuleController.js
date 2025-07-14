const { validationResult } = require('express-validator');
const Capsule = require('../models/capsule');

// Get all Capsules for Logged-in User
exports.getAllCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({ userId: req.user._id });
    res.json(capsules);
  } catch (err) {
    res.status(500).json({ message: 'Error Retrieving Capsules' });
  }
};

// Get a Capsule by ID for Logged-in User
exports.getCapsuleById = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: 'Capsule not Found' });

    const isOwner = capsule.userId.equals(req.user._id);
    const isRevealed = new Date() >= capsule.revealDate;

    if (!isOwner && !isRevealed) {
      return res.status(403).json({ message: 'Capsule is still locked' });
    }

    res.json(capsule);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching capsule' });
  }
};

// Create a New Capsule for Logged-in User
exports.createCapsule = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Create new capsule
    const capsule = new Capsule({
      userId: req.user._id,
      title: req.body.title,
      message: req.body.message,
      revealDate: req.body.revealDate,
      isPrivate: req.body.isPrivate !== undefined ? req.body.isPrivate : true,
    });

    // Save to database
    await capsule.save();
    res.status(201).json({ message: 'Capsule created successfully', capsule });
  } catch (err) {
    console.error('Capsule creation error:', err);
    res.status(500).json({ message: 'Error creating capsule', error: err.message });
  }
};

// Update a Capsule for Logged-in User
exports.updateCapsule = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find capsule
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check ownership
    if (!capsule.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to update this capsule' });
    }

    // Prepare updates (only update provided fields)
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.message) updates.message = req.body.message;
    if (req.body.revealDate) updates.revealDate = req.body.revealDate;
    if (req.body.isPrivate !== undefined) updates.isPrivate = req.body.isPrivate;

    // Update capsule
    const updatedCapsule = await Capsule.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Capsule updated successfully', capsule: updatedCapsule });
  } catch (err) {
    res.status(500).json({ message: 'Error updating capsule', error: err.message });
  }
};

// Delete a Capsule for Logged-in User
exports.deleteCapsule = async (req, res) => {
  try {
    // Find capsule
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check ownership
    if (!capsule.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to delete this capsule' });
    }

    // Delete capsule
    await Capsule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Capsule deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting capsule', error: err.message });
  }
};