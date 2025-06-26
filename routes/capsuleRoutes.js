const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');

// Placeholder controller for testing OAuth
const capsuleController = {
  getCapsules: (req, res) => res.json({ message: 'Capsules fetched', user: req.user }),
  createCapsule: (req, res) => res.json({ message: 'Capsule created', user: req.user }),
};

router.get('/', auth, capsuleController.getCapsules);
router.post('/', auth, capsuleController.createCapsule);

//Routes for API
const {
  getAllCapsules,
  getCapsuleById
} = require('../controllers/capsuleController');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

router.get('/', isAuthenticated, getAllCapsules);
router.get('/:id', isAuthenticated, getCapsuleById);

module.exports = router;