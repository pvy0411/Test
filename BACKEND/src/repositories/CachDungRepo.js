const { poolPromise } = require('../config/database');
const sql = require('mssql');
 
exports.GetAll = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM CACHDUNG ORDER BY MaCachDung');
    return result.recordset;
};
 
exports.GetById = async (id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaCachDung', sql.Int, id)
        .query('SELECT * FROM CACHDUNG WHERE MaCachDung = @MaCachDung');
    return result.recordset[0] || null;
};
 
exports.Create = async ({ MoTaCachDung }) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MoTaCachDung', sql.NVarChar, MoTaCachDung)
        .query('INSERT INTO CACHDUNG (MoTaCachDung) VALUES (@MoTaCachDung)');
};
 
exports.Update = async (id, { MoTaCachDung }) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaCachDung', sql.Int, id)
        .input('MoTaCachDung', sql.NVarChar, MoTaCachDung)
        .query('UPDATE CACHDUNG SET MoTaCachDung = @MoTaCachDung WHERE MaCachDung = @MaCachDung');
};
 
exports.Delete = async (id) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaCachDung', sql.Int, id)
        .query('DELETE FROM CACHDUNG WHERE MaCachDung = @MaCachDung');
};
 
// Kiểm tra đang chỏ tới thuốc nào chưa trước khi xóa
exports.IsUsed = async (id) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaCachDung', sql.Int, id)
        .query('SELECT COUNT(*) AS cnt FROM THUOC WHERE MaCachDung = @MaCachDung');
    return result.recordset[0].cnt > 0;
};
