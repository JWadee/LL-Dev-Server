const mysql = require('mysql');

//DB connection pool
const pool = mysql.createPool({
    connectionLimit: 100,
    host: '162.249.2.42',
    user: 'admin',
    password: 'LLsredael321?',
    database: 'Lineleaders',
    port:3306,
    debug: false,
    timezone: 'UTC'
});


module.exports = pool;