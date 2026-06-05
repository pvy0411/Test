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

    // API kiểm tra sức chứa cho ngày
    async CheckCapacity(req, res) {
        try {
            const date = req.query.date;
            if (!date) return res.status(400).json({ status: 'error', message: 'Thiếu tham số date' });

            const result = await AppointmentService.GetCapacity(date);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            console.error('[AppointmentController] CheckCapacity lỗi:', error);
            res.status(error.status || 500).json({ status: 'error', message: error.message || 'Lỗi khi kiểm tra sức chứa' });
        }
    }
}

module.exports = new AppointmentController();
