const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER, 
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

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