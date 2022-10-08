const mysql = require('mysql');
require('dotenv').config();

const conexionDB = function conexionDB(sql, values, next) {

    if (arguments.length === 2) {
        next = values;
        values = null;
    }
    var connection = mysql.createConnection({
        host: process.env.DB_HOST,
        database: "peekus",
        user: "root",
        password: process.env.LOCAL_DB_PASSWORD
    });
    connection.connect(function(err) {
        if (err !== null) {
            console.log("[MYSQL] Error connecting to mysql:" + err + '\n');
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