const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllCapsules, getCapsuleById, createCapsule } = require('../controllers/capsuleController');

// Validation rules for creating a capsule
const capsuleValidationRules = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('message').notEmpty().withMessage('Message is required').trim(),
  body('revealDate')
    .isISO8601()
    .withMessage('Reveal date must be a valid ISO 8601 date (e.g., 2025-12-31)')
    .toDate(),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
];

// Routes
router.get('/', auth, getAllCapsules); // Get all capsules for user
router.get('/:id', auth, getCapsuleById); // Get capsule by ID
router.post('/', auth, capsuleValidationRules, createCapsule); // Create a capsule

module.exports = router;