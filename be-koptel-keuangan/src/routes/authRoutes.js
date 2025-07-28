const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.get('/me', authController.verifyToken, authController.getMe);

module.exports = router;
