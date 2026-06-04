const LoaiBenhService = require('../services/LoaiBenhService');

class LoaiBenhController {
    // Lấy danh sách tất cả loại bệnh
    async GetAll(req, res) {
        try {
            const data = await LoaiBenhService.GetAll();
            res.status(200).json({
                status: 'success',
                data: data
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // Thêm loại bệnh mới (Dòng số 7 bên Route gọi hàm này)
    async Create(req, res) {
        try {
            const { TenBenh } = req.body; // Lấy TenBenh từ body JSON gửi lên
            
            if (!TenBenh) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Vui lòng cung cấp tên loại bệnh!' 
                });
            }

            const id = await LoaiBenhService.Create(TenBenh);
            res.status(201).json({
                status: 'success',
                message: 'Thêm loại bệnh thành công',
                MaLoaiBenh: id
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // Cập nhật thông tin loại bệnh
    async Update(req, res) {
        try {
            const maLoaiBenh = req.params.id;
            const { TenBenh } = req.body;

            const result = await LoaiBenhService.Update(maLoaiBenh, TenBenh);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // Xóa loại bệnh
    async Delete(req, res) {
        try {
            const maLoaiBenh = req.params.id;
            const result = await LoaiBenhService.Delete(maLoaiBenh);
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new LoaiBenhController();