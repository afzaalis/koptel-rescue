const express = require('express');
const kmController = require('../controllers/kmController');
const router = express.Router();

// Get all KM metrics
router.get('/', kmController.getAllMetrics);

// Update KM metrics
router.put('/', kmController.updateMetrics);

module.exports = router;