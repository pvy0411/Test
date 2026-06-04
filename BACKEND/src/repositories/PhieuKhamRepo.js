const { sql, poolPromise } = require('../config/database');

class PhieuKhamRepo {
    async Create(MaNV, MaBN, NgayKham) {
        const pool = await poolPromise;
        
        // Thêm phiếu khám - Trigger sẽ tự động tính SoThuTu
        // Dùng INTO clause vì có trigger trên bảng
        const result = await pool.request()
            .input('MaNV', sql.Int, MaNV)
            .input('MaBN', sql.Int, MaBN)
            .input('NgayKham', sql.Date, NgayKham)
            .query(`
                DECLARE @OutputTable TABLE (MaPK INT, SoThuTu INT);
                INSERT INTO PHIEUKHAM (MaNV, MaBN, NgayKham)
                OUTPUT INSERTED.MaPK, INSERTED.SoThuTu INTO @OutputTable
                VALUES (@MaNV, @MaBN, @NgayKham);
                SELECT * FROM @OutputTable;
            `);
        return result.recordset[0];
    }

    async CountByDate(date) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('date', sql.Date, date)
            .query('SELECT COUNT(*) as Count FROM PHIEUKHAM WHERE NgayKham = @date');
        return result.recordset[0].Count;
    }

    async GetFullDetail(MaPK) {
        const pool = await poolPromise;

        // 1. Thông tin phiếu khám + bệnh nhân
        const pkResult = await pool.request()
            .input('MaPK', sql.Int, MaPK)
            .query(`
                SELECT 
                    pk.MaPK, pk.MaNV, pk.MaBN, pk.NgayKham, pk.SoThuTu,
                    bn.TenBN, bn.CCCD, bn.GioiTinh, bn.NgaySinh, bn.DiaChi, bn.SDT, bn.Email
                FROM PHIEUKHAM pk
                JOIN BENHNHAN bn ON bn.MaBN = pk.MaBN
                WHERE pk.MaPK = @MaPK
            `);
        if (!pkResult.recordset[0]) return null;

        // 2. Hóa đơn liên kết (nếu đã có)
        const hdResult = await pool.request()
            .input('MaPK', sql.Int, MaPK)
            .query(`
                SELECT MaHD, NgayLap, TongTienThuoc, TienKham, TongTien
                FROM HOADON WHERE MaPK = @MaPK
            `);

        // 3. Chi tiết đơn thuốc
        const ctResult = await pool.request()
            .input('MaPK', sql.Int, MaPK)
            .query(`
                SELECT 
                    ct.MaThuoc, t.TenThuoc, ct.SoLuongThuoc, ct.DonGiaBan, ct.ThanhTien,
                    dvt.TenDVT, cd.MoTaCachDung AS CachDung
                FROM CT_PHIEUKHAM ct
                JOIN THUOC t ON t.MaThuoc = ct.MaThuoc
                LEFT JOIN DONVITINH dvt ON dvt.MaDVT = t.MaDVT
                LEFT JOIN CACHDUNG cd ON cd.MaCachDung = t.MaCachDung
                WHERE ct.MaPK = @MaPK
                ORDER BY ct.MaThuoc
            `);

        return {
            phieuKham: pkResult.recordset[0],
            hoaDon: hdResult.recordset[0] || null,
            chiTietThuoc: ctResult.recordset
        };
    }

    async GetAll() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                  SELECT pk.MaPK, pk.MaNV, pk.MaBN, pk.NgayKham, pk.SoThuTu,
                      b.TenBN, b.GioiTinh, b.NgaySinh, b.CCCD, b.SDT
                FROM PHIEUKHAM pk
                LEFT JOIN BENHNHAN b ON b.MaBN = pk.MaBN
                ORDER BY pk.MaPK ASC
            `);
        return result.recordset;
    }

    async GetHistoryByPatient(MaBN, years = 5) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaBN', sql.Int, MaBN)
            .input('Years', sql.Int, years)
            .query(`
                SELECT pk.MaPK, pk.NgayKham,
                    STRING_AGG(lb.TenLoaiBenh, ', ') AS TenBenh
                FROM PHIEUKHAM pk
                LEFT JOIN CT_LOAIBENH ctlb ON ctlb.MaPK = pk.MaPK
                LEFT JOIN LOAIBENH lb ON lb.MaLoaiBenh = ctlb.MaLoaiBenh
                WHERE pk.MaBN = @MaBN
                  AND pk.NgayKham >= DATEADD(year, -@Years, GETDATE())
                GROUP BY pk.MaPK, pk.NgayKham
                ORDER BY pk.NgayKham DESC;
            `);
        return result.recordset;
    }

    // Get diseases and symptoms for a specific MaPK
    async GetDiseasesByMaPK(MaPK) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaPK', sql.Int, MaPK)
            .query(`
                SELECT ctlb.MaLoaiBenh, lb.TenLoaiBenh AS TenBenh, ctlb.TrieuChung, ctlb.GhiChu
                FROM CT_LOAIBENH ctlb
                LEFT JOIN LOAIBENH lb ON lb.MaLoaiBenh = ctlb.MaLoaiBenh
                WHERE ctlb.MaPK = @MaPK
            `);
        return result.recordset;
    }

    async GetPrescriptionsByMaPK(MaPK) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaPK', sql.Int, MaPK)
            .query(`
                SELECT ct.MaThuoc, t.TenThuoc, ct.SoLuongThuoc, ct.DonGiaBan, ct.ThanhTien,
                       dvt.TenDVT as DonVi, cd.MoTaCachDung as CachDung
                FROM CT_PHIEUKHAM ct
                LEFT JOIN THUOC t ON t.MaThuoc = ct.MaThuoc
                LEFT JOIN DONVITINH dvt ON dvt.MaDVT = t.MaDVT
                LEFT JOIN CACHDUNG cd ON cd.MaCachDung = t.MaCachDung
                WHERE ct.MaPK = @MaPK
                ORDER BY ct.MaThuoc
            `);
        return result.recordset;
    }

    async DeletePrescription(MaPK, MaThuoc) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaPK', sql.Int, MaPK)
            .input('MaThuoc', sql.Int, MaThuoc)
            .query('DELETE FROM CT_PHIEUKHAM WHERE MaPK = @MaPK AND MaThuoc = @MaThuoc');
        return true;
    }
}
module.exports = new PhieuKhamRepo();
