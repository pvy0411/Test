const { sql, poolPromise } = require('../config/database');

class AuthRepo {
    async GetUserByUsername(username) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(`
                SELECT TK.TenDangNhap, TK.MatKhau, NV.MaNV, NV.TenNV, CV.TenCV 
                FROM TAIKHOAN TK
                JOIN NHANVIEN NV ON TK.MaNV = NV.MaNV
                JOIN CHUCVU CV ON NV.MaCV = CV.MaCV
                WHERE TK.TenDangNhap = @username
            `);
        return result.recordset[0];
    }
}
module.exports = new AuthRepo();