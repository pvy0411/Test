const { sql, poolPromise } = require('../config/database');

class ThamSoRepo {
    async GetAll() {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM THAMSO');
        return result.recordset;
    }

    async GetByName(name) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .query('SELECT GiaTri FROM THAMSO WHERE TenThamSo = @name');
        return result.recordset[0]?.GiaTri;
    }

    async Update(name, value) {
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('value', sql.Decimal(18,2), value)
            .query('UPDATE THAMSO SET GiaTri = @value WHERE TenThamSo = @name');
    }
}
module.exports = new ThamSoRepo();