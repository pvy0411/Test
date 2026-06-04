require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rootRoutes = require('./src/routes/index');
const { sendError } = require('./src/utils/responseHelper');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Định tuyến API
app.use('/api', rootRoutes);

// Kiểm tra hệ thống
app.use('/api/health-check', require('./src/routes/index'));

// Đăng nhập
app.use('/api/auth', require('./src/routes/AuthRoutes'));

// Nhân viên
app.use('/api/nhan-vien', require('./src/routes/NhanVienRoutes'));

// Tham số
app.use('/api/tham-so', require('./src/routes/ThamSoRoutes'));

// Bệnh nhân
app.use('/api/benh-nhan', require('./src/routes/BenhNhanRoutes'));

// Đặt lịch khám (Booking appointment)
app.use('/api/appointments', require('./src/routes/AppointmentRoutes'));

// Phiếu khám
app.use('/api/phieu-kham', require('./src/routes/PhieuKhamRoutes'));

// Loại bệnh
app.use('/api/benh', require('./src/routes/LoaiBenhRoutes'));

// Thuốc
app.use('/api/thuoc', require('./src/routes/ThuocRoutes'));

// Phiếu nhập thuốc
app.use('/api/phieunhap', require('./src/routes/PhieuNhapRoutes'));

// Đơn vị tính
app.use('/api/dvt', require('./src/routes/DVTRoutes'));

// Cách dùng
app.use('/api/cachdung', require('./src/routes/CachDungRoutes'));

// Hóa đơn
app.use('/api/hoadon', require('./src/routes/HoaDonRoutes'));

// Đơn thuốc
app.use('/api/donthuoc', require('./src/routes/DonThuocRoutes'));

// Báo cáo
app.use('/api/baocao', require('./src/routes/BaoCaoRoutes'));

// Xử lý route không tồn tại (404)
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: 'API endpoint không tồn tại trên hệ thống.'
    });
});

// Middleware xử lý lỗi tổng (Bắt lỗi từ các luồng không bắt được)
app.use((err, req, res, next) => {
    console.error('Lỗi hệ thống:', err.stack);
    sendError(res, 'Đã xảy ra lỗi nghiêm trọng tại máy chủ.');
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: ${PORT}`);
    // Kích hoạt kết nối DB ngay khi chạy server
    require('./src/config/database'); 
});
