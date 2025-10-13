const express = require('express');
const {
  getSchedule,
  updateSchedule,
  getAvailableSlots,
  blockSlot,
  unblockSlot,
  deleteSlot,
  getScheduleStats
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/auth');
const { teacherOnly } = require('../middleware/roleCheck');
const { validateScheduleSlot, validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(teacherOnly, validatePagination, getSchedule)
  .put(teacherOnly, updateSchedule);

router.get('/stats', teacherOnly, getScheduleStats);

router.get('/available/:teacherId', validateMongoId('teacherId'), getAvailableSlots);

router.post('/block', teacherOnly, validateScheduleSlot, blockSlot);

router.delete('/block/:slotId', teacherOnly, validateMongoId('slotId'), unblockSlot);

router.delete('/:slotId', teacherOnly, validateMongoId('slotId'), deleteSlot);

module.exports = router;
