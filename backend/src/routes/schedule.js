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
const {
  validateScheduleSlot,
  validateMongoId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Schedule management routes (teacher only)
router.route('/')
  .get(teacherOnly, validatePagination, getSchedule)
  .put(teacherOnly, updateSchedule);

// Statistics
router.get('/stats', teacherOnly, getScheduleStats);

// Public schedule routes (all authenticated users can view available slots)
router.get('/available/:teacherId', 
  validateMongoId('teacherId'), 
  getAvailableSlots
);

// Block/unblock slots (teacher only)
router.post('/block', teacherOnly, validateScheduleSlot, blockSlot);
router.delete('/block/:slotId', 
  teacherOnly, 
  validateMongoId('slotId'), 
  unblockSlot
);

// Delete schedule slot (teacher only)
router.delete('/:slotId', 
  teacherOnly, 
  validateMongoId('slotId'), 
  deleteSlot
);

module.exports = router;
