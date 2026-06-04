const HoaDonRepo = require('../repositories/HoaDonRepo');
const ThamSoRepo = require('../repositories/ThamSoRepo'); 
const { poolPromise } = require('../config/database');
const sql = require('mssql');

exports.GetAll = async ({ page = 1, limit = 20 } = {}) => {
    return await HoaDonRepo.GetAll(+page, +limit);
};
 
exports.GetById = async (MaHD) => {
    const data = await HoaDonRepo.GetById(MaHD);
    if (!data) throw { status: 404, message: 'Không tìm thấy hóa đơn' };
    return data;
};

exports.ThanhToanHoaDon = async (MaPK) => {
    // Kiểm tra hóa đơn đã tồn tại chưa
    const phieuKham = await HoaDonRepo.CheckPhieuKham(MaPK);
    if (!phieuKham) 
        throw { status: 404, message: 'Không tìm thấy phiếu khám' };
    const existing = await HoaDonRepo.GetByMaPK(MaPK);
        if (existing) throw { status: 400, message: 'Phiếu khám này đã có hóa đơn' };
    // Gọi module ThamSo để lấy Tiền Khám
    const ResThamSo = await ThamSoRepo.GetByName('TienKham'); 
    const TienKham = parseFloat(ResThamSo);

    // Tỉnh tổng tiền thuốc 
    const TongTienThuoc = await HoaDonRepo.GetTongTienThuoc(MaPK);
    const TongTien = TienKham + TongTienThuoc;
    const NgayLap = new Date();

    // Khởi tạo Transaction lưu vào DB
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
        const MaHD = await HoaDonRepo.CreateHoaDon({
            MaPK, NgayLap, TongTienThuoc, TienKham, TongTien
            }, transaction
        );
        await transaction.commit();

        // Sau khi tạo hóa đơn, cập nhật báo cáo doanh thu cho tháng tương ứng
        try {
            const pool2 = await poolPromise;
            const thang = NgayLap.getMonth() + 1;
            const nam = NgayLap.getFullYear();
            await pool2.request()
                .input('Thang', sql.Int, thang)
                .input('Nam', sql.Int, nam)
                .query('EXEC sp_LapBaoCaoDoanhThu @Thang, @Nam');
        } catch (e) {
            // Không chặn thành công thanh toán nếu cập nhật báo cáo lỗi; chỉ log
            console.error('Lỗi khi cập nhật báo cáo doanh thu:', e);
        }

        return { MaHD, TongTien, TongTienThuoc, TienKham };
    } 
    catch (err) {
        await transaction.rollback();
        throw err; 
    }
};

exports.DeleteHoaDon = async (MaHD) => {
  const HoaDon = await HoaDonRepo.GetById(MaHD);
  if (!HoaDon) throw { status: 404, message: 'Không tìm thấy hóa đơn' };
 
  const pool = await poolPromise;
  const transaction = new (sql.Transaction)(pool);
  await transaction.begin();
 
  try {
    await HoaDonRepo.DeleteHoaDon(MaHD, transaction);
    await transaction.commit();
    // Sau khi xóa hóa đơn, cập nhật lại báo cáo doanh thu của tháng tương ứng
    try {
        const ngay = HoaDon.NgayLap ? new Date(HoaDon.NgayLap) : null;
        if (ngay) {
            const pool2 = await poolPromise;
            const thang = ngay.getMonth() + 1;
            const nam = ngay.getFullYear();
            await pool2.request()
                .input('Thang', sql.Int, thang)
                .input('Nam', sql.Int, nam)
                .query('EXEC sp_LapBaoCaoDoanhThu @Thang, @Nam');
        }
    } catch (e) {
        console.error('Lỗi khi cập nhật báo cáo doanh thu sau xóa hóa đơn:', e);
    }
  } 
  catch (err) {
    await transaction.rollback();
    throw err;
  }
};