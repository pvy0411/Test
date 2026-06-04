const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'helga_SQLLogin_1',
    password: process.env.DB_PASSWORD || 'phuongvy41125',
    database: process.env.DB_NAME || 'QLPhongMachTu',
    server: process.env.DB_SERVER || 'QLPhongMachTu.mssql.somee.com', 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log("Kết nối MSSQL thành công!");
    } catch (err) {
        console.error("Lỗi kết nối database: ", err);
    }
}

connectDB();

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Đã kết nối thành công tới SQL Server!');
        return pool;
    })
    .catch(err => {
        console.error('Kết nối Database thất bại: ', err.message);
    });

module.exports = { sql, poolPromise };