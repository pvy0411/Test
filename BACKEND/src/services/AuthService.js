const AuthRepo = require('../repositories/AuthRepo');
const jwt = require('jsonwebtoken');

class AuthService {
    async Login(username, password) {
        const user = await AuthRepo.GetUserByUsername(username);
        
        // Kiểm tra user có tồn tại và đúng mật khẩu không
        if (!user || user.MatKhau !== password) {
            throw { status: 401, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
        }

        // Tạo Token chứa MaNV và quan trọng nhất là TenChucVu để phân quyền
        const token = jwt.sign(
            { 
                maNV: user.MaNV, 
                TenChucVu: user.TenCV,
                TenNV: user.TenNV 
            }, 
            process.env.JWT_SECRET || 'YOUR_SECRET_KEY', 
            { expiresIn: '8h' }
        );

        return { token, ChucVu: user.TenCV, TenNV: user.TenNV, MaNV: user.MaNV };
    }
}
module.exports = new AuthService();