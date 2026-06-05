const AppointmentService = require('../services/AppointmentService');

class AppointmentController {
    // API để đặt lịch khám
    async BookAppointment(req, res) {
        try {
            console.log('[AppointmentController] BookAppointment được gọi với body:', req.body);
            
            const result = await AppointmentService.BookAppointment(req.body);
            
            console.log('[AppointmentController] Service trả về result:', result);
            
            res.status(201).json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } catch (error) {
            console.error('[AppointmentController] Lỗi:', error);
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message,
                errors: error.errors || []
            });
        }
    }
}

module.exports = new AppointmentController();
