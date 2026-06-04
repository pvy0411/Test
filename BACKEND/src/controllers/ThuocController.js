const ThuocService = require('../services/ThuocService');
const res_ = require('../utils/responseHelper.js');

exports.GetAllThuoc = async (req, res) => {
  try {
    const data = await ThuocService.GetAllThuoc();
    res_.SendSuccess(res, 'Lấy danh sách thuốc thành công', data, null, 200);
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

exports.GetThuocById = async (req, res) => {
  try {
    const data = await ThuocService.GetThuocById(req.params.id);
    res_.SendSuccess(res, 'Lấy thông tin thuốc thành công', data, null, 200);
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

exports.SearchThuoc = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) throw { status: 400, message: 'Thiếu từ khoá tìm kiếm (?q=...)' };
    const data = await ThuocService.SearchThuoc(q);
    res_.SendSuccess(res, 'Tìm kiếm thuốc thành công', data, null, 200);
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

exports.CreateThuoc = async (req, res) => {
  try {
    const data = await ThuocService.CreateThuoc(req.body);
    res_.SendSuccess(res, 'Tạo thuốc thành công', data, null, 201);
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
 
exports.UpdateThuoc = async (req, res) => {
  try {
    const data = await ThuocService.UpdateThuoc(req.params.id, req.body);
    res_.SendSuccess(res, 'Cập nhật thuốc thành công', data, null, 200);
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
 
exports.DeleteThuoc = async (req, res) => {
  try {
    await ThuocService.DeleteThuoc(req.params.id);
    res_.SendSuccess(res, 'Xóa thuốc thành công', null, null, 200);
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