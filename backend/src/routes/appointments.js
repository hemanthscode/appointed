const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  rateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const {
  studentOnly,
  teacherOnly,
  adminOnly,
  checkAppointmentAccess
} = require('../middleware/roleCheck');
const {
  validateAppointment,
  validateAppointmentUpdate,
  validateMongoId,
  validatePagination,
  validateAppointmentQuery
} = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(validatePagination, validateAppointmentQuery, getAppointments)
  .post(studentOnly, validateAppointment, createAppointment);

router.route('/:id')
  .get(validateMongoId('id'), checkAppointmentAccess, getAppointment)
  .put(validateMongoId('id'), checkAppointmentAccess, validateAppointmentUpdate, updateAppointment)
  .delete(adminOnly, validateMongoId('id'), deleteAppointment);

router.patch('/:id/approve', teacherOnly, validateMongoId('id'), checkAppointmentAccess, approveAppointment);
router.patch('/:id/reject', teacherOnly, validateMongoId('id'), checkAppointmentAccess, rejectAppointment);
router.patch('/:id/cancel', validateMongoId('id'), checkAppointmentAccess, cancelAppointment);
router.patch('/:id/complete', teacherOnly, validateMongoId('id'), checkAppointmentAccess, completeAppointment);
router.patch('/:id/rate', studentOnly, validateMongoId('id'), checkAppointmentAccess, rateAppointment);

module.exports = router;
