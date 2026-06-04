const BaoCaoService = require('../services/BaoCaoService');
const res_ = require('../utils/responseHelper');

exports.GetDoanhThuTheoNam = async (req, res) => {
    try {
        const { nam } = req.query;
        if (!nam) {
            throw { status: 400, message: 'Vui lòng cung cấp đầy đủ năm cần báo cáo' };
        }
        const data = await BaoCaoService.GetDoanhThuTheoNam(req.query.nam);
        res_.SendSuccess(res, 'Lấy thống kê doanh thu thành công', data, null, 200);
    } 
    catch (e) {
        const status = e.status || 500;
        if (status >= 400 && status < 500) {
            res_.SendFail(res, e.message, null, status);
        } else {
            res_.SendError(res, e.message, status);
        }
    }
};

exports.GetDoanhThuTheoNgay = async (req, res) => {
    try {
        const { thang, nam } = req.query;
        if (!thang || !nam) {
            throw { status: 400, message: 'Vui lòng cung cấp đầy đủ tháng và năm' };
        }
        const data = await BaoCaoService.GetDoanhThuTheoNgay(req.query.thang, req.query.nam);
        res_.SendSuccess(res, 'Lấy chi tiết doanh thu theo ngày thành công', data, null, 200);
    } 
    catch (e) {
        const status = e.status || 500;
        if (status >= 400 && status < 500) {
            res_.SendFail(res, e.message, null, status);
        } else {
            res_.SendError(res, e.message, status);
        }
    }
};
 
// Lập báo cáo doanh thu tháng: tổng hợp thực tế từ HOADON ko lưu vào database, chỉ trả về dữ liệu hiển thị
exports.GetBaoCaoDoanhThu = async (req, res) => {
    try {
        const { thang, nam } = req.query;
        if (!thang || !nam) {
            throw { status: 400, message: 'Vui lòng cung cấp đầy đủ tháng và năm' };
        }
        const data = await BaoCaoService.GetBaoCaoDoanhThu(req.query.thang, req.query.nam);
        res_.SendSuccess(res, 'Lập báo cáo doanh thu thành công', data, null, 200);
    } 
    catch (e) {
        const status = e.status || 500;
        if (status >= 400 && status < 500) {
            res_.SendFail(res, e.message, null, status);
        } else {
            res_.SendError(res, e.message, status);
        }
    }
};

exports.GetSuDungThuoc = async (req, res) => {
    try {
        const { thang, nam } = req.query;
        if (!thang || !nam) {
            throw { status: 400, message: 'Vui lòng cung cấp đầy đủ tháng và năm' };
        }
        const data = await BaoCaoService.GetBaoCaoSuDungThuoc(req.query.thang, req.query.nam);
        res_.SendSuccess(res, 'Lấy thống kê sử dụng thuốc thành công', data, null, 200);
    } 
    catch (e) {
        const status = e.status || 500;
        if (status >= 400 && status < 500) {
            res_.SendFail(res, e.message, null, status);
        } else {
            res_.SendError(res, e.message, status);
        }
    }
};

exports.GetNhapThuoc = async (req, res) => {
    try {
        const { thang, nam } = req.query;
        if (!thang || !nam) {
            throw { status: 400, message: 'Vui lòng cung cấp đầy đủ tháng và năm' };
        }
        const data = await BaoCaoService.GetBaoCaoNhapThuoc(req.query.thang, req.query.nam);
        res_.SendSuccess(res, 'Lấy thống kê nhập thuốc thành công', data, null, 200);
    } 
    catch (e) {
        const status = e.status || 500;
        if (status >= 400 && status < 500) {
            res_.SendFail(res, e.message, null, status);
        } else {
            res_.SendError(res, e.message, status);
        }
    }
};