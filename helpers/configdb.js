const mysql = require('mysql');
require('dotenv').config();

const conexionDB = function conexionDB(sql, values, next) {

    if (arguments.length === 2) {
        next = values;
        values = null;
    }
    const config = process.env.NODE_ENV === 'local' ? {
        host: process.env.LOCAL_DB_HOST,
        database: process.env.LOCAL_DB_NAME,
        user: process.env.LOCAL_DB_USER,
        password: process.env.LOCAL_DB_PASSWORD,
        charset: 'utf8mb4'
    } : {
        host: process.env.PROD_DB_HOST,
        database: process.env.PROD_DB_NAME,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD,
        charset: 'utf8mb4'
    }
    const connection = mysql.createConnection(config);
    connection.connect(function(err) {
        if (err !== null) {
            console.log("Error connecting to mysql: " + err + '\n');
        }
    });
    connection.query(sql, values, function(err) {
        connection.end();
        if (err) {
            throw err;
        }
        next.apply(this, arguments);
    });
}

module.exports = { conexionDB };