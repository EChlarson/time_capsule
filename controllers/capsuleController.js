const { validationResult } = require('express-validator'); // Fixed typo: validationResults -> validationResult
const Capsule = require('../models/capsule'); // Fixed case: capsule -> Capsule

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
      return res.status(400).json({ errors: errors.array() });
    }

    // Create new capsule
    const capsule = new Capsule({
      userId: req.user._id, // Link to authenticated user
      title: req.body.title,
      message: req.body.message,
      imageUrl: req.body.imageUrl,
      revealDate: req.body.revealDate,
      isPrivate: req.body.isPrivate !== undefined ? req.body.isPrivate : true,
    });

    // Save to database
    await capsule.save();
    res.status(201).json({ message: 'Capsule created successfully', capsule });
  } catch (err) {
    res.status(500).json({ message: 'Error creating capsule', error: err.message });
  }
};