const { sql, poolPromise } = require('../config/database');

class NhanVienRepo {
    async GetAll() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
                     SELECT NV.MaNV, NV.TenNV, NV.CCCD, NV.GioiTinh, NV.NgaySinh, NV.NgayBatDauLamViec, NV.BangCapChungChi, NV.DiaChi, NV.SDT, NV.Email,
                   NV.MaCV, NV.MaCK, CV.TenCV, CK.TenCK, TK.TenDangNhap
            FROM NHANVIEN NV
            JOIN CHUCVU CV ON NV.MaCV = CV.MaCV
            LEFT JOIN CHUYENKHOA CK ON NV.MaCK = CK.MaCK
            LEFT JOIN TAIKHOAN TK ON NV.MaNV = TK.MaNV
        `);
        return result.recordset;
    }

    async GetProfileById(MaNV) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNV', sql.Int, MaNV)
            .query(`
                  SELECT NV.MaNV, NV.TenNV, NV.CCCD, NV.GioiTinh, NV.NgaySinh, NV.NgayBatDauLamViec, NV.BangCapChungChi, NV.DiaChi, NV.SDT, NV.Email,
                       NV.MaCV, NV.MaCK, CV.TenCV, CK.TenCK
                FROM NHANVIEN NV
                JOIN CHUCVU CV ON NV.MaCV = CV.MaCV
                LEFT JOIN CHUYENKHOA CK ON NV.MaCK = CK.MaCK
                WHERE NV.MaNV = @MaNV
            `);
        return result.recordset[0];
    }

    async GetById(MaNV) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNV', sql.Int, MaNV)
            .query('SELECT * FROM NHANVIEN WHERE MaNV = @MaNV');
        return result.recordset[0];
    }

    async CheckUsernameExist(username) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT TenDangNhap FROM TAIKHOAN WHERE TenDangNhap = @username');
        return result.recordset.length > 0;
    }

    // Tạo Nhân viên + Tài khoản cùng lúc
    async Create(data) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const ngaySinh = data.NgaySinh || (data.NamSinh ? `${data.NamSinh}-01-01` : null);
            const requestNV = new sql.Request(transaction);
            const resultNV = await requestNV
                .input('TenNV', sql.NVarChar, data.TenNV)
                .input('CCCD', sql.VarChar, data.CCCD)
                .input('GioiTinh', sql.VarChar, data.GioiTinh)
                .input('NgaySinh', sql.Date, ngaySinh)
                .input('NgayBatDauLamViec', sql.Date, data.NgayBatDauLamViec || null)
                .input('BangCapChungChi', sql.NVarChar, data.BangCapChungChi || null)
                .input('DiaChi', sql.NVarChar, data.DiaChi || null)
                .input('SDT', sql.VarChar, data.SDT)
                .input('Email', sql.VarChar, data.Email || null)
                .input('MaCV', sql.Int, data.MaCV)
                .input('MaCK', sql.Int, data.MaCK || null)
                .query(`
                    INSERT INTO NHANVIEN (TenNV, CCCD, GioiTinh, NgaySinh, NgayBatDauLamViec, BangCapChungChi, DiaChi, SDT, Email, MaCV, MaCK)
                    OUTPUT INSERTED.MaNV
                    VALUES (@TenNV, @CCCD, @GioiTinh, @NgaySinh, @NgayBatDauLamViec, @BangCapChungChi, @DiaChi, @SDT, @Email, @MaCV, @MaCK)
                `);
            
            const MaNVMoi = resultNV.recordset[0].MaNV;

            const requestTK = new sql.Request(transaction);
            await requestTK
                .input('TenDangNhap', sql.VarChar, data.TenDangNhap)
                .input('MatKhau', sql.VarChar, data.MatKhau)
                .input('MaNV', sql.Int, MaNVMoi)
                .query(`
                    INSERT INTO TAIKHOAN (TenDangNhap, MatKhau, MaNV)
                    VALUES (@TenDangNhap, @MatKhau, @MaNV)
                `);

            await transaction.commit();
            return MaNVMoi;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }

    // Cập nhật thông tin nhân sự
    async Update(MaNV, data) {
        const pool = await poolPromise;
        const ngaySinh = data.NgaySinh || (data.NamSinh ? `${data.NamSinh}-01-01` : null);
        await pool.request()
            .input('MaNV', sql.Int, MaNV)
            .input('TenNV', sql.NVarChar, data.TenNV)
            .input('CCCD', sql.VarChar, data.CCCD)
            .input('GioiTinh', sql.VarChar, data.GioiTinh)
            .input('NgaySinh', sql.Date, ngaySinh)
            .input('NgayBatDauLamViec', sql.Date, data.NgayBatDauLamViec || null)
            .input('BangCapChungChi', sql.NVarChar, data.BangCapChungChi || null)
            .input('DiaChi', sql.NVarChar, data.DiaChi || null)
            .input('SDT', sql.VarChar, data.SDT)
            .input('Email', sql.VarChar, data.Email || null)
            .input('MaCK', sql.Int, data.MaCK || null)
            .query(`
                UPDATE NHANVIEN
                SET TenNV = @TenNV,
                    CCCD = @CCCD,
                    GioiTinh = @GioiTinh,
                    NgaySinh = @NgaySinh,
                    NgayBatDauLamViec = @NgayBatDauLamViec,
                    BangCapChungChi = @BangCapChungChi,
                    DiaChi = @DiaChi,
                    SDT = @SDT,
                    Email = @Email,
                    MaCK = @MaCK
                WHERE MaNV = @MaNV
            `);
    }

    async CheckCoPhieuKham(MaNV) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaNV', sql.Int, MaNV)
            .query('SELECT COUNT(*) as Count FROM PHIEUKHAM WHERE MaNV = @MaNV');
        return result.recordset[0].Count > 0;
    }

    // Xóa tài khoản trước, xóa nhân viên sau
    async Remove(MaNV) {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            request.input('MaNV', sql.Int, MaNV);
            await request.query('DELETE FROM TAIKHOAN WHERE MaNV = @MaNV');
            await request.query('DELETE FROM NHANVIEN WHERE MaNV = @MaNV');
            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
}
module.exports = new NhanVienRepo();