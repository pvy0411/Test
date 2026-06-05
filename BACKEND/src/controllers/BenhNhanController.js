const BenhNhanService = require('../services/BenhNhanService');

class BenhNhanController {
    async GetAll(req, res) {
        try {
            const data = await BenhNhanService.GetAll();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async GetAllWithLastExam(req, res) {
        try {
            const data = await BenhNhanService.GetAllWithLastExam();
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async Create(req, res) {
        try {
            // Lấy MaNV từ JWT token (do XacThuc middleware gắn vào req.user)
            const MaNV = req.user?.maNV || null;

            const result = await BenhNhanService.Create(req.body, MaNV);

            // result = { maBN, maPK, soThuTu }
            res.status(201).json({
                status: 'success',
                message: 'Lập hồ sơ và tạo phiếu khám thành công!',
                maBN: result.maBN,
                maPK: result.maPK,
                soThuTu: result.soThuTu,
                TenBN: result.TenBN
            });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }

    async Update(req, res) {
        try {
            const result = await BenhNhanService.Update(req.params.id, req.body);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }

    async GetProfileAndHistoryByCCCD(req, res) {
        try {
            const cccd = req.params.cccd;
            const years = req.query.years ? parseInt(req.query.years, 10) : 5;
            const data = await BenhNhanService.GetProfileAndHistoryByCCCD(cccd, years);
            res.status(200).json({ status: 'success', data });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }

    async UpdateByCCCD(req, res) {
        try {
            const cccd = req.params.cccd;
            const dataUpdate = req.body;
            const result = await BenhNhanService.UpdateByCCCD(cccd, dataUpdate);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }

    async Delete(req, res) {
        try {
            await BenhNhanService.Delete(req.params.id);
            res.status(200).json({ status: 'success', message: 'Đã xóa bệnh nhân' });
        } catch (error) {
            res.status(error.status || 500).json({ status: 'error', message: error.message });
        }
    }
}
module.exports = new BenhNhanController();