const HoaDonService = require('../services/HoaDonService');
const res_ = require('../utils/responseHelper.js'); 

exports.GetAll = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = await HoaDonService.GetAll({ page: +page, limit: +limit });
        res_.SendSuccess(res, 'Lấy danh sách hóa đơn thành công', data, null, 200);
    } 
    catch (err) {
        const status = err.status || 500;
        if (status >= 400 && status < 500) {
        res_.SendFail(res, err.message, null, status);
        } else {
        res_.SendError(res, err.message, status);
        }
    }
};
 
exports.GetById = async (req, res) => {
    try {
        const data = await HoaDonService.GetById(req.params.id);
        res_.SendSuccess(res, 'Lấy thông tin hóa đơn thành công', data, null, 200);
    } 
    catch (err) {
        const status = err.status || 500;
        if (status >= 400 && status < 500) {
        res_.SendFail(res, err.message, null, status);
        } else {
        res_.SendError(res, err.message, status);
        }
    }
};

exports.CreateHoaDon = async (req, res) => {
    try {
        const { MaPK } = req.body;
        if (!MaPK) throw { status: 400, message: 'Thiếu mã phiếu khám (MaPK)' };
        const data = await HoaDonService.ThanhToanHoaDon(MaPK);
        res_.SendSuccess(res, 'Thanh toán hóa đơn thành công', data, null, 201);
    } 
    catch (err) {
        const status = err.status || 500;
        if (status >= 400 && status < 500) {
            res_.SendFail(res, err.message, null, status);
        } else {
            res_.SendError(res, err.message, status);
        }
    }
};

exports.DeleteHoaDon = async (req, res) => {
    try {
        await HoaDonService.DeleteHoaDon(req.params.id);
        res_.SendSuccess(res, 'Xóa hóa đơn thành công', null, null, 200);
    } 
    catch (err) {
        const status = err.status || 500;
        if (status >= 400 && status < 500) {
        res_.SendFail(res, err.message, null, status);
        } else {
        res_.SendError(res, err.message, status);
        }
    }
};