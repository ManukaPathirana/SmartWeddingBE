const express = require('express');
const router = express.Router();
const rsvpController = require('../controllers/rsvpController');

// Create RSVP
router.post('/', rsvpController.createRSVP);

// Get RSVPs by wedding_id
router.get('/:wedding_id', rsvpController.getRSVPsByWedding);

module.exports = router;
