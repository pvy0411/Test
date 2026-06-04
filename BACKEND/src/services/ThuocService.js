const ThuocRepo = require('../repositories/ThuocRepo');
const DVTRepo = require('../repositories/DVTRepo');
const CachDungRepo = require('../repositories/CachDungRepo');

const toPositiveInt = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

exports.GetAllThuoc = async () => {
  return await ThuocRepo.GetAllThuoc();
};

exports.GetThuocById = async (id) => {
  const thuoc = await ThuocRepo.GetThuocById(id);
  if (!thuoc) throw { status: 404, message: 'Không tìm thấy thuốc' };
  return thuoc;
};

exports.SearchThuoc = async (keyword) => {
    if (!keyword || keyword.trim() === '')
        throw { status: 400, message: 'Từ khoá tìm kiếm không được để trống' };
    return ThuocRepo.SearchThuocByName(keyword.trim());
};

exports.CreateThuoc = async (thuoc) => {
  if (!thuoc.TenThuoc)
    throw { status: 400, message: 'Tên thuốc không được để trống' };
  
  // Lookup DVT bằng mã hoặc tên
  let dvt = null;
  if (thuoc.MaDVT) {
    thuoc.MaDVT = toPositiveInt(thuoc.MaDVT);
    if (!thuoc.MaDVT) throw { status: 400, message: 'Mã đơn vị tính không hợp lệ' };
    dvt = await DVTRepo.GetById(thuoc.MaDVT);
    if (!dvt) throw { status: 400, message: `Đơn vị tính mã "${thuoc.MaDVT}" không tồn tại` };
  } else if (thuoc.TenDVT) {
    dvt = await DVTRepo.GetByName(thuoc.TenDVT);
    if (!dvt) throw { status: 400, message: `Đơn vị tính "${thuoc.TenDVT}" không tồn tại` };
    thuoc.MaDVT = dvt.MaDVT;
  } else {
    throw { status: 400, message: 'Vui lòng cung cấp đơn vị tính' };
  }

  // Lookup CachDung từ tên - lấy mã đầu tiên nếu có mô tả tương tự
  let cachDung = null;
  if (thuoc.MoTaCachDung) {
    // Tìm kiếm CachDung có mô tả chứa từ khóa
    const allCachDung = await CachDungRepo.GetAll();
    cachDung = allCachDung.find(cd => 
      cd.MoTaCachDung.toLowerCase().includes(thuoc.MoTaCachDung.toLowerCase())
    );
    if (!cachDung) {
      // Nếu không tìm thấy, tạo mới
      await CachDungRepo.Create({ MoTaCachDung: thuoc.MoTaCachDung });
      const newCachDung = await CachDungRepo.GetAll();
      cachDung = newCachDung[newCachDung.length - 1];
    }
    thuoc.MaCachDung = cachDung.MaCachDung;
  } else if (thuoc.MaCachDung) {
    thuoc.MaCachDung = toPositiveInt(thuoc.MaCachDung);
    if (!thuoc.MaCachDung) throw { status: 400, message: 'Mã cách dùng không hợp lệ' };
    const existingCachDung = await CachDungRepo.GetById(thuoc.MaCachDung);
    if (!existingCachDung) throw { status: 400, message: `Cách dùng mã "${thuoc.MaCachDung}" không tồn tại` };
  } else {
    throw { status: 400, message: 'Vui lòng cung cấp cách dùng' };
  }

  const MaThuoc = await ThuocRepo.CreateThuoc(thuoc);
  
  // Lấy thuốc vừa tạo (cần lấy MaThuoc từ DB)
  return await ThuocRepo.GetThuocById(MaThuoc);
};
 
exports.UpdateThuoc = async (id, thuoc) => {
  const existing = await ThuocRepo.GetThuocById(id);
  if (!existing) 
    throw { status: 404, message: 'Không tìm thấy thuốc' };
  await ThuocRepo.UpdateThuoc(thuoc);
  return await ThuocRepo.GetThuocById(id);
};
 
exports.DeleteThuoc = async (id) => {
  const existing = await ThuocRepo.GetThuocById(id);
  if (!existing) 
    throw { status: 404, message: 'Không tìm thấy thuốc' };
  const used = await ThuocRepo.IsThuocUsed(id);
  if (used) 
    throw { status: 400, message: 'Thuốc đang được sử dụng, không thể xóa' };
  await ThuocRepo.DeleteThuoc(id);
};
