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

const createProjectsTable = async () => {
    const q = `CREATE TABLE IF NOT EXISTS projects (
        project_id VARCHAR(40) NOT NULL PRIMARY KEY,
        project_name VARCHAR(256) NOT NULL,
        system_prompt MEDIUMTEXT,
        user_prompt MEDIUMTEXT,
        openai_key VARCHAR(256),
        model VARCHAR(256),
        status VARCHAR(128),
        info MEDIUMTEXT
    )`

    const r = await this.query(q);
}

const createResponsesTable = async () => {
    const q = `CREATE TABLE IF NOT EXISTS responses (
        response_id VARCHAR(40) NOT NULL PRIMARY KEY,
        project_id VARCHAR(40) NOT NULL,
        input MEDIUMTEXT NOT NULL,
        orig_output MEDIUMTEXT,
        edited_output MEDIUMTEXT,
        editor_id VARCHAR(40),
        ts BIGINT,
        status VARCHAR(128),
        info MEDIUMTEXT,
        INDEX (project_id)
    )`

    const r = await this.query(q);
}

const createTables = async () => {
    await createProjectsTable();
    await createResponsesTable();
}

createTables();
