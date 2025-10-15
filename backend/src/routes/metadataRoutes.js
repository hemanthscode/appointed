const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadataController');
const { optionalAuth } = require('../middleware/auth');

router.get('/departments', optionalAuth, metadataController.getDepartments);
router.get('/subjects', metadataController.getSubjects);
router.get('/time-slots', metadataController.getTimeSlots);
router.get('/appointment-purposes', metadataController.getAppointmentPurposes);
router.get('/user-years', metadataController.getUserYears);

module.exports = router;
