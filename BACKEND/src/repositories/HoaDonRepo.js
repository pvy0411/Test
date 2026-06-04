const { poolPromise } = require('../config/database');
const sql = require('mssql');

exports.GetAll = async (page, limit) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;
  const result = await pool.request()
  .input('Offset', sql.Int, offset)
  .input('Limit', sql.Int, limit)
  .query(`
    SELECT hd.MaHD, hd.MaPK, hd.NgayLap,
            hd.TongTienThuoc, hd.TienKham, hd.TongTien,
            bn.TenBN, nv.TenNV AS TenNhanVien
    FROM HOADON hd
    JOIN PHIEUKHAM pk ON hd.MaPK = pk.MaPK
    JOIN BENHNHAN bn  ON pk.MaBN = bn.MaBN
    JOIN NHANVIEN nv  ON pk.MaNV = nv.MaNV
    ORDER BY hd.NgayLap DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
  `)
  return result.recordset;
};

exports.GetByMaPK = async (MaPK) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('MaPK', sql.Int, MaPK)
    .query('SELECT * FROM HOADON WHERE MaPK = @MaPK');
  return result.recordset[0];
};

exports.GetTongTienThuoc = async (MaPK) => {
  const pool = await poolPromise;
    const result = await pool.request()
      .input('MaPK', sql.Int, MaPK)
      .query('SELECT SUM(ThanhTien) AS TongTien FROM CT_PHIEUKHAM WHERE MaPK = @MaPK');
    return result.recordset[0].TongTien || 0;
};

exports.CreateHoaDon = async ({ MaPK, NgayLap, TongTienThuoc, TienKham, TongTien }, transaction) => {
  const request = transaction.request();
  const result = await request
    .input('MaPK', sql.Int, MaPK)
    .input('NgayLap', sql.DateTime, NgayLap)
    .input('TongTienThuoc', sql.Float, TongTienThuoc)
    .input('TienKham', sql.Float, TienKham)
    .input('TongTien', sql.Float, TongTien)
    .query(`
      INSERT INTO HOADON (MaPK, NgayLap, TongTienThuoc, TienKham, TongTien) 
      OUTPUT INSERTED.MaHD
      VALUES (@MaPK, @NgayLap, @TongTienThuoc, @TienKham, @TongTien)
    `);
  return result.recordset[0].MaHD;
};

exports.DeleteHoaDon = async (MaHD, transaction) => {
  const request = transaction.request();
  await request
    .input('MaHD', sql.Int, MaHD)
    .query('DELETE FROM HOADON WHERE MaHD = @MaHD');
};

exports.CheckPhieuKham = async (MaPK) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('MaPK', sql.Int, MaPK)
    .query('SELECT MaPK FROM PHIEUKHAM WHERE MaPK = @MaPK');
  return result.recordset[0] || null;
};

// sinh mã hóa đơn tự động
// exports.GenerateMaHD = async (transaction) => {
//   const request = transaction.request();
//   const result = await request.query(`
//     SELECT TOP 1 MaHD FROM HOADON ORDER BY MaHD DESC
//   `);
//   if (!result.recordset[0]) return 'HD001';
//   const lastNum = parseInt(result.recordset[0].MaHD.replace('HD', '')) + 1;
//   return 'HD' + String(lastNum).padStart(3, '0');
// };
