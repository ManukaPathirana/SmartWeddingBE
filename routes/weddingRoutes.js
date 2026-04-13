const express = require('express');
const router = express.Router();
const weddingController = require('../controllers/weddingController');

// Create wedding
router.post('/', weddingController.createWedding);

// Get wedding by slug
router.get('/:slug', weddingController.getWeddingBySlug);

module.exports = router;
