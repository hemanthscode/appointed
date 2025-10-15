const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect } = require('../middleware/auth');
const { teacherOnly } = require('../middleware/roleCheck');
const validation = require('../middleware/validation');

router.use(protect);

router.route('/')
  .get(teacherOnly, validation.validatePagination, scheduleController.getSchedule)
  .put(teacherOnly, scheduleController.updateSchedule);

router.get('/stats', teacherOnly, scheduleController.getScheduleStats);

router.get('/available/:teacherId', validation.validateMongoId('teacherId'), scheduleController.getAvailableSlots);

router.post('/block', teacherOnly, validation.validateScheduleSlot, scheduleController.blockSlot);

router.delete('/block/:slotId', teacherOnly, validation.validateMongoId('slotId'), scheduleController.unblockSlot);

router.delete('/:slotId', teacherOnly, validation.validateMongoId('slotId'), scheduleController.deleteSlot);

module.exports = router;
