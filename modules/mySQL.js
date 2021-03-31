const mysql = require('mysql');
const config = require('../configs');
let sqlCon;

function connectDB() {
    sqlCon = mysql.createConnection({
        host: config.mySqlConfig.MYSQL_HOST,
        user: config.mySqlConfig.MYSQL_USERNAME,
        password: config.mySqlConfig.MYSQL_PASSWORD,
        database: config.mySqlConfig.MYSQL_DATABASE_NAME,
        port: config.mySqlConfig.MYSQL_PORT,
    });

    sqlCon.connect(function (err) {
        if (err) throw err;
        console.log("Database MySQL Connected!");
    });
}


function getValueQuery(query) {
    return new Promise((resolve, reject) => {
        sqlCon.query(query, (err, rows, fields) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    })
}

module.exports = {
    connectDB,
    getValueQuery,
};