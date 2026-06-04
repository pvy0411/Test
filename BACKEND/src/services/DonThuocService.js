const DonThuocRepo = require('../repositories/DonThuocRepo');
const ThuocRepo = require('../repositories/ThuocRepo');
const PhieuKhamRepo = require('../repositories/PhieuKhamRepo'); 
const { poolPromise } = require('../config/database');
const sql = require('mssql');

exports.KeDonThuoc = async (DonThuocData) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        // Kiểm tra phiếu khám đã tồn tại chưa 
        // const phieuKham = await PhieuKhamRepo.GetById(DonThuocData.MaPK);
        // if (!phieuKham) {
        //     throw { status: 404, message: `Phiếu khám ${DonThuocData.MaPK} không tồn tại!` };
        // }
        // Duyệt qua danh sách thuốc để kiểm tra tồn kho và tính tiền
        for (const item of DonThuocData.ChiTiet) {
            const thuoc = await ThuocRepo.GetThuocById(item.MaThuoc);
            if (!thuoc) {
                throw { status: 400, message: `Thuốc ${item.MaThuoc} không tồn tại trong danh mục` };
            }
            if (thuoc.SoLuongTon < item.SoLuongThuoc) {
                throw { status: 400, message: `Thuốc ${thuoc.TenThuoc} không đủ tồn kho (Còn: ${thuoc.SoLuongTon})` };
            }
            const thanhTien = item.SoLuongThuoc * thuoc.DonGiaBan;
            // Lưu vào bảng Chi tiết phiếu khám
            await DonThuocRepo.CreateChiTietDonThuoc({
                MaPK: DonThuocData.MaPK,
                MaThuoc: item.MaThuoc,
                SoLuongThuoc: item.SoLuongThuoc,
                DonGiaBan: thuoc.DonGiaBan,
                ThanhTien: thanhTien
                }, transaction
            );
            // Cập nhật tồn kho thuốc
            await ThuocRepo.UpdateStock(item.MaThuoc, -item.SoLuongThuoc, transaction);
        }

        await transaction.commit();
        return { message: "Kê đơn thuốc thành công!" };
    } 
    catch (err) {
        await transaction.rollback();
        throw err;
    }
};