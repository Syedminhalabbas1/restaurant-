const sql = require('mssql');

const config = {
    server: 'DESKTOP-EQ55Q8H',
    database: 'restaurant_db',
    user: 'sa',
    password: 'Admin123', 
    port: 1433,
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Database Connected');
        return pool;
    })
    .catch(err => {
        console.log('❌ Connection Failed:', err.message);
    });

module.exports = { sql, poolPromise };