const express = require('express');
const router = express.Router();

const weddingController = require('../controllers/weddingController');
const authMiddleware = require('../utils/authMiddleware');

// Create wedding (requires login)
router.post('/', authMiddleware, weddingController.createWedding);

// Get wedding by slug
router.get('/:slug', weddingController.getWeddingBySlug);

module.exports = router;
