const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');

// POST /api/appointments/book - Đặt lịch khám
router.post('/book', AppointmentController.BookAppointment);

module.exports = router;
