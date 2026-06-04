const DonThuocService = require('../services/DonThuocService');
const res_ = require('../utils/responseHelper');

exports.KeDon = async (req, res) => {
    try {
        // khởi tạo dữ liệu đơn thuốc từ request body
        const DonThuocData = req.body;

        // kiểm tra tính hợp lệ đầu vào
        if (!DonThuocData.MaPK) {
            throw { status: 400, message: 'Thiếu mã phiếu khám (MaPK)' };
        }
        if (!DonThuocData.ChiTiet || DonThuocData.ChiTiet.length === 0) {
            throw { status: 400, message: 'Đơn thuốc phải có ít nhất 1 loại thuốc' };
        }
        // Gọi service xử lý transaction
        const data = await DonThuocService.KeDonThuoc(DonThuocData);
        // Trả về response thành công
        res_.SendSuccess(res, 'Kê đơn thuốc thành công', data, null, 201);
    } catch (e) {
        const status = e.status || 500;
        if (status >= 400 && status < 500) {
            res_.SendFail(res, e.message, null, status);
        } else {
            res_.SendError(res, e.message, status);
        }
    }
};