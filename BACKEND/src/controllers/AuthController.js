const AuthService = require('../services/AuthService');

class AuthController {
    async Login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Vui lòng nhập đủ tên đăng nhập và mật khẩu!' });
            }

            const data = await AuthService.Login(username, password);
            res.status(200).json({ status: 'success', message: 'Đăng nhập thành công', data });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }
}
module.exports = new AuthController();