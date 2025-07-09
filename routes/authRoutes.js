const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.login);
router.get('/callback', authController.callback);
router.get('/user', authController.getUser);
router.get('/logout', authController.logout);

module.exports = router;
