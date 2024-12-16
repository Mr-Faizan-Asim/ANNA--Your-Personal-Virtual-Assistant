// routes/waitlistRoutes.js
const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');

// Route to add an email to the waitlist
router.post('/waitlist', waitlistController.addEmailToWaitlist);

// Route to get all waitlist emails (optional, you can skip this in production)
router.get('/waitlist', waitlistController.getWaitlistEmails);

module.exports = router;
