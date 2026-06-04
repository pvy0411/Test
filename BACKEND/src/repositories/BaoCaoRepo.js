const { poolPromise } = require('../config/database');
const sql = require('mssql');

exports.IsExist = async (thang, nam) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('Thang', sql.Int, thang)
        .input('Nam', sql.Int, nam)
        .query('SELECT TOP 1 Thang FROM BCDOANHTHU WHERE Thang = @Thang AND Nam = @Nam');
    return result.recordset[0] || null;
};

exports.GetBaoCaoHeader = async (thang, nam) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('Thang', sql.Int, thang)
        .input('Nam', sql.Int, nam)
        .query('SELECT Thang, Nam, TongDoanhThu, TongSoBenhNhan FROM BCDOANHTHU WHERE Thang = @Thang AND Nam = @Nam');
    return result.recordset[0] || null;
};
exports.GetDoanhThuTheoNgay = async (thang, nam) => {
    const pool = await poolPromise;
    const result = await pool.request()
    .input('Thang', sql.Int, thang)
    .input('Nam', sql.Int, nam)
    .query(`
        SELECT Ngay, Thang, Nam, SoBenhNhan, DoanhThu, TyLe
        FROM CT_BCDOANHTHU
        WHERE Thang = @Thang AND Nam = @Nam
        ORDER BY Ngay
    `);
    return result.recordset;
};

exports.ThongKeDoanhThuTheoThang = async (thang, nam) => {
    const pool = await poolPromise;
    // Tổng doanh thu và số bệnh nhân trong tháng
    const bcResult = await pool.request()
        .input('Thang', sql.Int, thang)
        .input('Nam', sql.Int, nam)
        .query(`
        SELECT 
            COUNT(DISTINCT pk.MaBN) AS TongSoBenhNhan,
            ISNULL(SUM(hd.TongTien), 0) AS TongDoanhThu
        FROM HOADON hd
        JOIN PHIEUKHAM pk ON hd.MaPK = pk.MaPK
        WHERE MONTH(hd.NgayLap) = @Thang AND YEAR(hd.NgayLap) = @Nam
        `);
    const CT_TheoNgay = await pool.request()
    .input('Thang', sql.Int, thang)
    .input('Nam', sql.Int, nam)
    .query(`
      SELECT 
        DAY(hd.NgayLap) AS Ngay,
        COUNT(DISTINCT pk.MaBN) AS SoBenhNhan,
        ISNULL(SUM(hd.TongTien), 0) AS DoanhThu
      FROM HOADON hd
      JOIN PHIEUKHAM pk ON hd.MaPK = pk.MaPK
      WHERE MONTH(hd.NgayLap) = @Thang AND YEAR(hd.NgayLap) = @Nam
      GROUP BY DAY(hd.NgayLap)
      ORDER BY Ngay
    `);
  return { TongHop: bcResult.recordset[0], ChiTiet: CT_TheoNgay.recordset };
};

exports.GetDoanhThuTheoNam = async (nam) => {
    const pool = await poolPromise;
    const result = await pool.request()
    .input('Nam', sql.Int, nam)
    .query(`
        SELECT Thang, Nam, TongDoanhThu, TongSoBenhNhan
        FROM BCDOANHTHU
        WHERE Nam = @Nam
        ORDER BY Thang
    `);
    return result.recordset;
};

exports.SaveBaoCaoDoanhThu = async (header, chiTiet) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
 
    try {
        // Upsert header vào BCDOANHTHU
        await transaction.request()
            .input('Thang', sql.Int, header.Thang)
            .input('Nam', sql.Int, header.Nam)
            .input('TongDoanhThu', sql.Decimal(18,2), header.TongDoanhThu)
            .input('TongSoBenhNhan', sql.Int, header.TongSoBenhNhan)
            .query(`
                MERGE BCDOANHTHU AS target
                USING (SELECT @Thang AS Thang, @Nam AS Nam) AS src
                    ON target.Thang = src.Thang AND target.Nam = src.Nam
                WHEN MATCHED THEN
                    UPDATE SET TongDoanhThu   = @TongDoanhThu, TongSoBenhNhan = @TongSoBenhNhan
                WHEN NOT MATCHED THEN
                    INSERT (Thang, Nam, TongDoanhThu, TongSoBenhNhan)
                    VALUES (@Thang, @Nam, @TongDoanhThu, @TongSoBenhNhan);
            `);
 
        // Xóa CT cũ nếu đã lập, rồi insert mới
        await transaction.request()
            .input('Thang', sql.Int, header.Thang)
            .input('Nam', sql.Int, header.Nam)
            .query('DELETE FROM CT_BCDOANHTHU WHERE Thang = @Thang AND Nam = @Nam');
 
        for (const row of chiTiet) {
            await transaction.request()
                .input('Ngay', sql.Int, row.Ngay)
                .input('Thang', sql.Int, row.Thang)
                .input('Nam', sql.Int, row.Nam)
                .input('SoBenhNhan', sql.Int, row.SoBenhNhan)
                .input('DoanhThu', sql.Decimal(18,2), row.DoanhThu)
                .input('TyLe', sql.Decimal(5,4), row.TyLe)
                .query(`
                    INSERT INTO CT_BCDOANHTHU (Ngay, Thang, Nam, SoBenhNhan, DoanhThu, TyLe)
                    VALUES (@Ngay, @Thang, @Nam, @SoBenhNhan, @DoanhThu, @TyLe)
                `);
        }
        await transaction.commit();

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

exports.GetBaoCaoSuDungThuoc = async (thang, nam) => {
    const pool = await poolPromise;
    const result = await pool.request()
    .input('Thang', sql.Int, thang)
    .input('Nam', sql.Int, nam)
    .query(`
        SELECT 
            T.MaThuoc,
            T.TenThuoc, 
            DVT.TenDVT, 
            SUM(CT.SoLuongThuoc) as SoLuongDung, 
            COUNT(CT.MaPK) as SoLanDung
        FROM CT_PHIEUKHAM CT
        JOIN PHIEUKHAM PK ON CT.MaPK = PK.MaPK
        JOIN THUOC T ON CT.MaThuoc = T.MaThuoc
        JOIN DONVITINH DVT ON T.MaDVT = DVT.MaDVT
        WHERE MONTH(PK.NgayKham) = @Thang AND YEAR(PK.NgayKham) = @Nam
        GROUP BY T.MaThuoc, T.TenThuoc, DVT.TenDVT
        ORDER BY SoLuongDung DESC
    `);
    return result.recordset;
};

exports.GetBaoCaoNhapThuoc = async (thang, nam) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('Thang', sql.Int, thang)
        .input('Nam', sql.Int, nam)
        .query(`
            SELECT 
                T.TenThuoc, 
                DVT.TenDVT, 
                SUM(CT.SoLuongNhap) AS TongSoLuongNhap, 
                SUM(CT.ThanhTien) AS TongTienNhap
            FROM CT_PHIEUNHAPTHUOC CT
            JOIN PHIEUNHAPTHUOC PN ON CT.MaPN = PN.MaPN
            JOIN THUOC T ON CT.MaThuoc = T.MaThuoc
            JOIN DONVITINH DVT ON T.MaDVT = DVT.MaDVT
            WHERE MONTH(PN.NgayNhap) = @thang AND YEAR(PN.NgayNhap) = @nam
            GROUP BY T.TenThuoc, DVT.TenDVT
            ORDER BY TongSoLuongNhap DESC
        `);
    return result.recordset;
};
