const jwt = require('jsonwebtoken');

// MIDDLEWARE XÁC THỰC 
const XacThuc = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token, vui lòng đăng nhập!' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY'); 
        req.user = decoded; 
        next();
    } 
    catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

// MIDDLEWARE PHÂN QUYỀN
const PhanQuyen = (...DanhSachQuyen) => {
    return (req, res, next) => {
        if (!req.user || !req.user.TenChucVu) {
            return res.status(401).json({ message: 'Lỗi xác thực: Không tìm thấy thông tin chức vụ!' });
        }
        const ChucVu = req.user.TenChucVu; 
        
        if (ChucVu === 'Admin' || DanhSachQuyen.includes(ChucVu)) {
            next(); 
        } else {
            res.status(403).json({ message: `Lỗi phân quyền: Chức vụ '${ChucVu}' không được phép thực hiện thao tác này` });
        }
    };
};

module.exports = { XacThuc, PhanQuyen };
