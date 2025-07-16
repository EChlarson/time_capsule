const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getAllCapsules, getCapsuleById, createCapsule,getPublicCapsules} = require('../controllers/capsuleController');

// Validation rules for creating a capsule
const capsuleValidationRules = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('message').notEmpty().withMessage('Message is required').trim(),
  body('revealDate')
    .isISO8601()
    .withMessage('Reveal date must be a valid ISO 8601 date (e.g., 2025-12-31)')
    .toDate(),
  body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Image URL must be valid'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
];

// Validation rules for updating a capsule
const capsuleUpdateValidationRules = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('message').optional().notEmpty().withMessage('Message cannot be empty').trim(),
  body('revealDate')
    .optional()
    .isISO8601()
    .withMessage('Reveal date must be a valid ISO 8601 date (e.g., 2025-12-31)')
    .toDate(),
  body('imageUrl').optional({ checkFalsy: true }).isURL().withMessage('Image URL must be valid'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean'),
];

// Routes
router.get('/', auth, getAllCapsules); // Get all capsules for user
router.get('/:id', auth, getCapsuleById); // Get capsule by ID
router.post('/', auth, capsuleValidationRules, validate, createCapsule); // Create a new capsule
router.put('/:id', auth, capsuleUpdateValidationRules, validate, require('../controllers/capsuleController').updateCapsule); // Update a capsule
router.delete('/:id', auth, require('../controllers/capsuleController').deleteCapsule); // Delete a capsule
router.get('/public/all', getPublicCapsules);

module.exports = router;