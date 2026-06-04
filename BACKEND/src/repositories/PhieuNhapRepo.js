const { poolPromise } = require('../config/database');
const sql = require('mssql');

// Lấy danh sách phiếu nhập, phân trang
const GetAll = async ({ page = 1, limit = 20 }) => {
    const pool   = await poolPromise;
    const offset = (page - 1) * limit;
    const result = await pool.request()
        .input('Offset', sql.Int, offset)
        .input('Limit',  sql.Int, limit)
        .query(`
            SELECT * FROM PHIEUNHAPTHUOC
            ORDER BY MaPN ASC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
        `);
    const count = await pool.request()
        .query('SELECT COUNT(*) AS Total FROM PHIEUNHAPTHUOC');

    return { data: result.recordset, total: count.recordset[0].Total };
};

// Lấy 1 phiếu kèm chi tiết các dòng thuốc
const GetById = async (MaPN) => {
    const pool = await poolPromise;
    const phieu = await pool.request()
        .input('MaPN', sql.Int, MaPN)
        .query('SELECT * FROM PHIEUNHAPTHUOC WHERE MaPN = @MaPN');

    if (!phieu.recordset[0]) return null;

    const ChiTiet = await pool.request()
    .input('MaPN', sql.Int, MaPN)
    .query(`
        SELECT ct.*, t.TenThuoc, t.DonGiaBan AS GiaBanHienTai
        FROM   CT_PHIEUNHAPTHUOC ct
        JOIN   THUOC t ON ct.MaThuoc = t.MaThuoc
        WHERE  ct.MaPN = @MaPN
    `);      
    return { ...phieu.recordset[0], ChiTiet: ChiTiet.recordset };
};

// Insert PHIEUNHAPTHUOC vào database
const CreatePhieuNhap = async ({ NgayNhap, TongTienNhap }, transaction) => {
    const result = await transaction.request()
        .input('NgayNhap', sql.DateTime, NgayNhap)
        .input('TongTienNhap', sql.Decimal(18,2), TongTienNhap)
        .query(`
            INSERT INTO PHIEUNHAPTHUOC (NgayNhap, TongTienNhap)
            OUTPUT INSERTED.MaPN
            VALUES (@NgayNhap, @TongTienNhap)
        `);
    return result.recordset[0].MaPN;
};

// Insert CT_PHIEUNHAPTHUOC vào database
const CreateChiTiet = async ({ MaPN, MaThuoc, DonGiaNhap, SoLuongNhap, ThanhTien }, transaction) => {
    await transaction.request()
        .input('MaPN', sql.Int, MaPN)
        .input('MaThuoc', sql.Int, MaThuoc)
        .input('DonGiaNhap', sql.Decimal(18,2), DonGiaNhap)
        .input('SoLuong', sql.Int, SoLuongNhap)
        .input('ThanhTien', sql.Decimal(18,2), ThanhTien)
        .query(`
            INSERT INTO CT_PHIEUNHAPTHUOC (MaPN, MaThuoc, DonGiaNhap, SoLuong, ThanhTien)
            VALUES (@MaPN, @MaThuoc, @DonGiaNhap, @SoLuong, @ThanhTien)
        `);
};

// Cập nhật TongTienNhap sau khi tính 
const UpdateTongTien = async (MaPN, TongTienNhap, transaction) => {
    await transaction.request()
        .input('MaPN', sql.Int, MaPN)
        .input('TongTienNhap', sql.Decimal(18,2), TongTienNhap)
        .query('UPDATE PHIEUNHAPTHUOC SET TongTienNhap = @TongTienNhap WHERE MaPN = @MaPN');
};


const DeleteChiTiet = async (MaPN, transaction) => {
  const request = transaction.request();
  await request
    .input('MaPN', sql.Int, MaPN)
    .query('DELETE FROM CT_PHIEUNHAPTHUOC WHERE MaPN = @MaPN');
};
 
const DeletePhieuNhap = async (MaPN, transaction) => {
  const request = transaction.request();
  await request
    .input('MaPN', sql.Int, MaPN)
    .query('DELETE FROM PHIEUNHAPTHUOC WHERE MaPN = @MaPN');
};
 
// const GenerateMaPN = async (transaction) => {
//   const request = transaction.request();
//   const result = await request.query(`
//     SELECT TOP 1 MaPN FROM PHIEUNHAPTHUOC ORDER BY MaPN DESC
//   `);
//   if (!result.recordset[0]) return 'PN001';
//   const lastNum = parseInt(result.recordset[0].MaPN.replace('PN', '')) + 1;
//   return 'PN' + String(lastNum).padStart(3, '0');
// };

module.exports = { GetAll, GetById, CreatePhieuNhap, CreateChiTiet, UpdateTongTien, DeleteChiTiet, DeletePhieuNhap };
