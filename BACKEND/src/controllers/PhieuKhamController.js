const PhieuKhamService = require('../services/PhieuKhamService');

class PhieuKhamController {
    async GetFullDetail(req, res) {
        try {
            const MaPK = parseInt(req.params.maPK, 10);
            if (isNaN(MaPK)) return res.status(400).json({ status: 'error', message: 'Mã phiếu khám không hợp lệ' });
            const data = await PhieuKhamService.GetFullDetail(MaPK);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            res.status(err.status || 500).json({ status: 'error', message: err.message });
        }
    }

    async Create(req, res) {
        try {
            // MaBN lấy từ frontend gửi lên
            const { MaBN } = req.body; 
            
            // MaNV lấy từ chính Token của người đang đăng nhập (nhờ authMiddleware)
            const MaNV = req.user.maNV; 

            if (!MaBN) {
                return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp Mã bệnh nhân!' });
            }

            const result = await PhieuKhamService.CreatePhieuKham(MaNV, MaBN);

            res.status(201).json({
                status: 'success',
                message: 'Lập phiếu khám thành công!',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async GetAll(req, res) {
        try {
            const result = await PhieuKhamService.GetAllPhieuKham();

            res.status(200).json({
                status: 'success',
                message: 'Lấy danh sách phiếu khám thành công!',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async GetHistoryByPatient(req, res) {
        try {
            const MaBN = parseInt(req.params.maBN, 10);
            const years = req.query.years ? parseInt(req.query.years, 10) : 5;

            if (isNaN(MaBN)) {
                return res.status(400).json({ status: 'error', message: 'Mã bệnh nhân không hợp lệ' });
            }

            const data = await PhieuKhamService.GetHistoryByPatient(MaBN, years);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            res.status(400).json({ status: 'error', message: err.message });
        }
    }

    async GetDiseasesByMaPK(req, res) {
        try {
            const MaPK = parseInt(req.params.maPK, 10);
            if (isNaN(MaPK)) return res.status(400).json({ status: 'error', message: 'Mã phiếu khám không hợp lệ' });
            const data = await PhieuKhamService.GetDiseasesByMaPK(MaPK);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            res.status(400).json({ status: 'error', message: err.message });
        }
    }

    async GetPrescriptionsByMaPK(req, res) {
        try {
            const MaPK = parseInt(req.params.maPK, 10);
            if (isNaN(MaPK)) return res.status(400).json({ status: 'error', message: 'Mã phiếu khám không hợp lệ' });
            const data = await PhieuKhamService.GetPrescriptionsByMaPK(MaPK);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            res.status(400).json({ status: 'error', message: err.message });
        }
    }

    async DeletePrescription(req, res) {
        try {
            const MaPK = parseInt(req.params.maPK, 10);
            const MaThuoc = parseInt(req.params.maThuoc, 10);
            if (isNaN(MaPK) || isNaN(MaThuoc)) return res.status(400).json({ status: 'error', message: 'Mã phiếu hoặc mã thuốc không hợp lệ' });
            await PhieuKhamService.DeletePrescription(MaPK, MaThuoc);
            res.status(200).json({ status: 'success', message: 'Xóa thuốc khỏi phiếu khám thành công' });
        } catch (err) {
            res.status(400).json({ status: 'error', message: err.message });
        }
    }

    // Tạo phiếu khám cho bệnh nhân đã tồn tại (backfill / khi cần tạo thủ công)
    async CreateForPatient(req, res) {
        try {
            const { MaBN } = req.body;
            const MaNV = req.user?.maNV || null;

            if (!MaBN) {
                return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp Mã bệnh nhân!' });
            }

            const result = await PhieuKhamService.CreatePhieuKham(MaNV, MaBN);
            res.status(201).json({ status: 'success', message: 'Tạo phiếu khám thành công', data: result });
        } catch (error) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = new PhieuKhamController();