const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Placeholder controller for testing OAuth
const capsuleController = {
  getCapsules: (req, res) => res.json({ message: 'Capsules fetched', user: req.user }),
  createCapsule: (req, res) => res.json({ message: 'Capsule created', user: req.user }),
};

router.get('/', auth, capsuleController.getCapsules);
router.post('/', auth, capsuleController.createCapsule);

module.exports = router;