const express = require('express');
const router = express.Router();
const aiHelperController = require('../controllers/aiHelperController');
const authController = require('../controllers/AuthController');

router.post('/chat', authController.verifyToken, aiHelperController.chat);

module.exports = router;