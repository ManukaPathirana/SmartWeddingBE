const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');

// Bulk add guests
router.post('/bulk', guestController.bulkAddGuests);

// Get guest by token
router.get('/:token', guestController.getGuestByToken);

module.exports = router;
