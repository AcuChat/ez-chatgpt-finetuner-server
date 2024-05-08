require('dotenv').config();
const mysql = require('mysql2');


const { MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

// Create a connection pool with a specific configuration
const pool = mysql.createPool({
    host: MYSQL_HOST,   // Host where the database server is located
    user: MYSQL_USER,        // Database username
    password: MYSQL_PASSWORD, // Database password
    database: MYSQL_DATABASE,  // Database name
    waitForConnections: true,
    connectionLimit: 10, // The number of connections to create in the pool
    queueLimit: 0        // Maximum number of connection requests the pool will queue before returning an error
});

exports.query = async query => {
   return new Promise((resolve, reject) => {
    pool.query(query, (err, results, fields) => {
        if (err) {
            console.error('An error occurred: ', err);
            resolve(false)
        }
        resolve (results);
    });
   })
}

exports.escape = str => mysql.escape(str);