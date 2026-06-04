const NhanVienService = require('../services/NhanVienService');

class NhanVienController {
    async GetAll(req, res) {
        try {
            const data = await NhanVienService.GetAll();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async GetMe(req, res) {
        try {
            const maNV = req.user?.maNV;
            if (!maNV) {
                return res.status(401).json({ status: 'error', message: 'Không tìm thấy thông tin nhân viên trong token!' });
            }
            const data = await NhanVienService.GetProfileById(maNV);
            if (!data) {
                return res.status(404).json({ status: 'error', message: 'Không tìm thấy nhân viên!' });
            }
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            console.error('NhanVienController.GetMe error:', error);
            res.status(500).json({ status: 'error', message: error.message || 'Lỗi server khi lấy profile nhân viên.' });
        }
    }

    async Create(req, res) {
        try {
            const id = await NhanVienService.Create(req.body);
            res.status(201).json({ status: 'success', message: 'Thêm nhân viên thành công', MaNV: id });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }

    async Update(req, res) {
        try {
            const result = await NhanVienService.Update(req.params.id, req.body);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }

    async Delete(req, res) {
        try {
            const result = await NhanVienService.Delete(req.params.id);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }
}
module.exports = new NhanVienController();