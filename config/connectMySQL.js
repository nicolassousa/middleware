const mysql = require('mysql');
module.exports = {
    con: mysql.createConnection({
        host: 'remotemysql.com',
        user: 'hPFgx8P6mZ',
        password: 'VyQQ9fOQgx',
        database: 'hPFgx8P6mZ'
    })
};