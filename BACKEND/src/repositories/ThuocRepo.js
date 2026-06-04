const { poolPromise } = require('../config/database');
const sql = require('mssql');

exports.GetAllThuoc = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT
      t.MaThuoc, t.TenThuoc, t.DonGiaBan, t.SoLuongTon,
      cd.MoTaCachDung, dvt.TenDVT
    FROM THUOC t
    LEFT JOIN CACHDUNG cd ON t.MaCachDung = cd.MaCachDung
    LEFT JOIN DONVITINH dvt ON t.MaDVT = dvt.MaDVT
    ORDER BY t.MaThuoc
  `);
  return result.recordset;
};

exports.GetThuocById = async (id) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT * FROM THUOC WHERE MaThuoc = @id');
  return result.recordset[0];
};

exports.SearchThuocByName = async (keyword) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('keyword', sql.NVarChar, `%${keyword}%`)
        .query(`
            SELECT TOP 20
                t.MaThuoc, t.TenThuoc, t.DonGiaBan, t.SoLuongTon,
                cd.MoTaCachDung, dvt.TenDVT
            FROM  THUOC t
            JOIN  CACHDUNG   cd  ON t.MaCachDung = cd.MaCachDung
            JOIN  DONVITINH  dvt ON t.MaDVT      = dvt.MaDVT
            WHERE t.TenThuoc LIKE @keyword
            ORDER BY t.TenThuoc
        `);
    return result.recordset;
};

exports.UpdateInventoryAndPrice = async (MaThuoc, SoLuong, DonGiaBan, transaction) => {
  const request = transaction.request();
  await request
    .input('MaThuoc', sql.Int, MaThuoc)
    .input('SoLuong', sql.Int, SoLuong)
    .input('DonGia', sql.Float, DonGiaBan)
    .query('UPDATE THUOC SET SoLuongTon = SoLuongTon + @SoLuong, DonGiaBan = @DonGia WHERE MaThuoc = @MaThuoc');
};

exports.UpdateStock = async (MaThuoc, SoLuongThayDoi, transaction) => {
  const request = transaction.request();
  await request
    .input('MaThuoc', sql.Int, MaThuoc)
    .input('SoLuong', sql.Int, SoLuongThayDoi) 
    .query('UPDATE THUOC SET SoLuongTon = SoLuongTon + @SoLuong WHERE MaThuoc = @MaThuoc');
};

exports.CreateThuoc = async (thuoc) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('TenThuoc', sql.NVarChar, thuoc.TenThuoc)
    .input('DonGiaBan', sql.Float, thuoc.DonGiaBan || 0)
    .input('SoLuongTon', sql.Int, thuoc.SoLuongTon || 0)
    .input('MaCachDung', sql.Int, thuoc.MaCachDung)
    .input('MaDVT', sql.Int, thuoc.MaDVT)
    .query(`
      INSERT INTO THUOC (TenThuoc, DonGiaBan, SoLuongTon, MaCachDung, MaDVT)
      OUTPUT INSERTED.MaThuoc
      VALUES (@TenThuoc, @DonGiaBan, @SoLuongTon, @MaCachDung, @MaDVT)
    `);
  return result.recordset[0].MaThuoc;
};

exports.UpdateThuoc = async (thuoc) => {
  const pool = await poolPromise;
  await pool.request()
    .input('MaThuoc', sql.Int, thuoc.MaThuoc)
    .input('TenThuoc', sql.NVarChar, thuoc.TenThuoc)
    .input('DonGiaBan', sql.Float, thuoc.DonGiaBan)
    .input('MaCachDung', sql.Int, thuoc.MaCachDung)
    .input('MaDVT', sql.Int, thuoc.MaDVT)
    .query(`
      UPDATE THUOC
      SET TenThuoc = @TenThuoc,
          DonGiaBan = @DonGiaBan,
          MaCachDung = @MaCachDung,
          MaDVT = @MaDVT
      WHERE MaThuoc = @MaThuoc
    `);
};
 
exports.DeleteThuoc = async (MaThuoc) => {
  const pool = await poolPromise;
  await pool.request()
    .input('MaThuoc', sql.Int, MaThuoc)
    .query('DELETE FROM THUOC WHERE MaThuoc = @MaThuoc');
};
 
exports.IsThuocUsed = async (MaThuoc) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('MaThuoc', sql.Int, MaThuoc)
    .query(`
      SELECT COUNT(*) AS cnt FROM CT_PHIEUKHAM WHERE MaThuoc = @MaThuoc
      UNION ALL
      SELECT COUNT(*) FROM CT_PHIEUNHAPTHUOC WHERE MaThuoc = @MaThuoc
    `);
  return result.recordset.some(r => r.cnt > 0);
};
