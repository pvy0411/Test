const PhieuNhapRepo = require('../repositories/PhieuNhapRepo');
const ThuocRepo = require('../repositories/ThuocRepo');
const ThamSoRepo = require('../repositories/ThamSoRepo');
const { poolPromise, sql } = require('../config/database');

const toPositiveInt = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
};

const toPositiveNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
};

// Lấy danh sách phiếu nhập có phân trang
const GetAll = ({ page, limit }) => {
    return PhieuNhapRepo.GetAll({ page, limit });
};

// Lấy 1 phiếu và kiểm tra tồn tại, nếu không có thì trả về lỗi 404
const GetById = async (MaPN) => {
    const data = await PhieuNhapRepo.GetById(MaPN);
    if (!data) {
        throw { status: 404, message: `Phiếu nhập '${MaPN}' không tồn tại` };
    }
    return data;
};

// Tạo phiếu nhập 
const Create = async (DataInput) => {
    const { NgayNhap, ChiTiet } = DataInput;
    
    // Kiểm tra tính hợp lệ đầu vào
    if (!ChiTiet || ChiTiet.length === 0) {
        throw { status: 400, message: 'Phiếu nhập phải có ít nhất 1 dòng thuốc' };
    }

    // Kiểm tra từng thuốc trong chi tiết có hợp lệ không
    for (const item of ChiTiet) {
        item.MaThuoc = toPositiveInt(item.MaThuoc);
        item.SoLuongNhap = toPositiveInt(item.SoLuongNhap);
        item.DonGiaNhap = toPositiveNumber(item.DonGiaNhap);
        if (!item.MaThuoc) {
            throw { status: 400, message: 'Mã thuốc không hợp lệ' };
        }
        const thuoc = await ThuocRepo.GetThuocById(item.MaThuoc);
        if (!thuoc) {
            throw { status: 400, message: `Thuốc '${item.MaThuoc}' không tồn tại` };
        }
        if (!item.SoLuongNhap) {
            throw { status: 400, message: `Số lượng nhập của '${item.MaThuoc}' phải lớn hơn 0` };
        }
        if (!item.DonGiaNhap) {
            throw { status: 400, message: `Đơn giá nhập của '${item.MaThuoc}' phải lớn hơn 0` };
        }
    }

    // Truy vấn đến tỷ lệ tính giá bán từ tham số
    const ResThamSo = await ThamSoRepo.GetByName('TyLeTinhDonGiaBan');
    const TyLe = parseFloat(ResThamSo);

    // Tính tổng tiền nhập
    const TongTienNhap = ChiTiet.reduce((sum, item) => sum + (item.SoLuongNhap * item.DonGiaNhap), 0);
    
    // Tạo transaction để đảm bảo tính toàn vẹn dữ liệu
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        // Lưu PHIEUNHAPTHUOC với tổng tiền nhập đã tính toán
        // const MaPN = await PhieuNhapRepo.GenerateMaPN(transaction);
        const MaPN = await PhieuNhapRepo.CreatePhieuNhap({ NgayNhap, TongTienNhap }, transaction);

        // Vòng lặp lưu CT_PHIEUNHAPTHUOC và cập nhật tồn kho + giá bán
        for (const item of ChiTiet) {
            const ThanhTien = item.SoLuongNhap * item.DonGiaNhap;
            await PhieuNhapRepo.CreateChiTiet({ ...item, MaPN, ThanhTien: ThanhTien }, transaction);
            
            // Tăng số lượng tồn và Cập nhật giá bán mới (= DonGiaNhap * TyLe)
            const DonGiaBanMoi = item.DonGiaNhap * TyLe;
            await ThuocRepo.UpdateInventoryAndPrice(item.MaThuoc, item.SoLuongNhap, DonGiaBanMoi, transaction);
        }
        await transaction.commit();
        return await PhieuNhapRepo.GetById(MaPN);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
    // Trả về phiếu nhập vừa tạo select DB sau khi commit
    return await PhieuNhapRepo.GetById(MaPN);
};

const UpdatePhieuNhap = async (MaPN, MaNV, ChiTiet) => {
    const existing = await PhieuNhapRepo.GetById(MaPN);
    if (!existing) throw { status: 404, message: 'Không tìm thấy phiếu nhập' };
    if (!ChiTiet || ChiTiet.length === 0)
    throw { status: 400, message: 'Phiếu nhập phải có ít nhất một dòng thuốc' };

    const pool = await poolPromise;
    const transaction = new (require('mssql').Transaction)(pool);
    await transaction.begin();

    try {
    // Hoàn lại tồn kho của dữ liệu cũ
    for (const old of existing.ChiTiet) {
        await ThuocRepo.UpdateStock(old.MaThuoc, -(Number(old.SoLuong) || 0), transaction); 
    }
    // Xóa dữ liệu cũ
    await PhieuNhapRepo.DeleteChiTiet(MaPN, transaction);

    let TongTienNhap = 0;
    const ResThamSo = await ThamSoRepo.GetByName('TyLeTinhDonGiaBan');
    const TyLe = parseFloat(ResThamSo);
    for (const item of ChiTiet) {
        item.MaThuoc = toPositiveInt(item.MaThuoc);
        item.SoLuongNhap = toPositiveInt(item.SoLuongNhap);
        item.DonGiaNhap = toPositiveNumber(item.DonGiaNhap);
        if (!item.MaThuoc || !item.DonGiaNhap || !item.SoLuongNhap)
        throw { status: 400, message: 'Thiếu thông tin chi tiết thuốc' };
        if (item.SoLuongNhap <= 0)
        throw { status: 400, message: 'Số lượng nhập phải lớn hơn 0' };

        const ThanhTien = item.DonGiaNhap * item.SoLuongNhap;
        TongTienNhap += ThanhTien;

        await PhieuNhapRepo.CreateChiTiet({ MaPN, ...item, ThanhTien }, transaction);

        const DonGiaBan = item.DonGiaNhap * TyLe;
        await ThuocRepo.UpdateInventoryAndPrice(item.MaThuoc, item.SoLuongNhap, DonGiaBan, transaction);
    }

    // Cập nhật header
    await PhieuNhapRepo.UpdateTongTien(MaPN, TongTienNhap, transaction);
    await transaction.commit();
    return { MaPN, TongTienNhap };
    } catch (err) {
    await transaction.rollback();
    throw err;
    }
};
 
// Xóa phiếu nhập
const DeletePhieuNhap = async (MaPN) => {
    const existing = await PhieuNhapRepo.GetById(MaPN);
    if (!existing) throw { status: 404, message: 'Không tìm thấy phiếu nhập' };

    const pool = await poolPromise;
    const transaction = new (require('mssql').Transaction)(pool);
    await transaction.begin();

    try {
    // Hoàn lại tồn kho
    for (const item of existing.ChiTiet) {
        await ThuocRepo.UpdateStock(item.MaThuoc, -(Number(item.SoLuong) || 0), transaction);
    }
    await PhieuNhapRepo.DeleteChiTiet(MaPN, transaction);
    await PhieuNhapRepo.DeletePhieuNhap(MaPN, transaction);
    await transaction.commit();
    } catch (err) {
    await transaction.rollback();
    throw err;
    }
};

module.exports = { GetAll, GetById, Create, UpdatePhieuNhap, DeletePhieuNhap };
