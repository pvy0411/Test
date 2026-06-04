const { sql, poolPromise } = require('../config/database');

class LoaiBenhRepo {
    async GetAll() {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT
                lb.MaLoaiBenh,
                lb.TenLoaiBenh,
                -- aggregate TrieuChung + GhiChu from CT_LOAIBENH into a single description
                ISNULL(STUFF((
                    SELECT '; ' + ISNULL(cl.TrieuChung,'') + CASE WHEN ISNULL(cl.GhiChu,'')<>'' THEN ' (' + cl.GhiChu + ')' ELSE '' END
                    FROM CT_LOAIBENH cl
                    WHERE cl.MaLoaiBenh = lb.MaLoaiBenh
                    FOR XML PATH('')
                ),1,2,''), '') AS MoTa
            FROM LOAIBENH lb
            ORDER BY lb.MaLoaiBenh
        `);
        return result.recordset;
    }

    async Create(tenBenh) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('TenBenh', sql.NVarChar, tenBenh)
            .query(`
                INSERT INTO LOAIBENH (TenLoaiBenh) 
                OUTPUT INSERTED.MaLoaiBenh 
                VALUES (@TenBenh)
            `);
        return result.recordset[0].MaLoaiBenh;
    }

    async Update(maLoaiBenh, tenBenh) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaLoaiBenh', sql.Int, maLoaiBenh)
            .input('TenBenh', sql.NVarChar, tenBenh)
            .query('UPDATE LOAIBENH SET TenLoaiBenh = @TenBenh WHERE MaLoaiBenh = @MaLoaiBenh');
    }

    async CheckDaSuDung(maLoaiBenh) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('MaLoaiBenh', sql.Int, maLoaiBenh)
            .query('SELECT COUNT(*) as SoLan FROM CT_LOAIBENH WHERE MaLoaiBenh = @MaLoaiBenh');
        return result.recordset[0].SoLan > 0;
    }

    async Remove(maLoaiBenh) {
        const pool = await poolPromise;
        await pool.request()
            .input('MaLoaiBenh', sql.Int, maLoaiBenh)
            .query('DELETE FROM LOAIBENH WHERE MaLoaiBenh = @MaLoaiBenh');
    }

    async Delete(maLoaiBenh) {
        return this.Remove(maLoaiBenh);
    }
}
module.exports = new LoaiBenhRepo();
