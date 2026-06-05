const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');

// POST /api/appointments/book - Đặt lịch khám
router.post('/book', AppointmentController.BookAppointment);
// GET /api/appointments/check-capacity?date=YYYY-MM-DD - Kiểm tra sức chứa
router.get('/check-capacity', AppointmentController.CheckCapacity);

module.exports = router;
