const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const validation = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const {
  studentOnly,
  teacherOnly,
  adminOnly,
  checkAppointmentAccess
} = require('../middleware/roleCheck');

router.use(protect);

router.route('/')
  .get(validation.validatePagination, validation.validateAppointmentQuery, appointmentController.getAppointments)
  .post(studentOnly, validation.validateAppointment, appointmentController.createAppointment);

router.route('/:id')
  .get(validation.validateMongoId('id'), checkAppointmentAccess, appointmentController.getAppointment)
  .put(validation.validateMongoId('id'), checkAppointmentAccess, validation.validateAppointmentUpdate, appointmentController.updateAppointment)
  .delete(adminOnly, validation.validateMongoId('id'), appointmentController.deleteAppointment);

router.patch('/:id/approve', teacherOnly, validation.validateMongoId('id'), checkAppointmentAccess, appointmentController.approveAppointment);
router.patch('/:id/reject', teacherOnly, validation.validateMongoId('id'), checkAppointmentAccess, appointmentController.rejectAppointment);
router.patch('/:id/cancel', validation.validateMongoId('id'), checkAppointmentAccess, appointmentController.cancelAppointment);
router.patch('/:id/complete', teacherOnly, validation.validateMongoId('id'), checkAppointmentAccess, appointmentController.completeAppointment);
router.patch('/:id/rate', studentOnly, validation.validateMongoId('id'), checkAppointmentAccess, appointmentController.rateAppointment);

module.exports = router;
