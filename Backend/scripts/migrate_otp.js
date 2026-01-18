const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Do not specify database yet, to allow creation
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true // Enable multiple statements for schema.sql
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        // 1. Create Database
        const dbName = process.env.DB_NAME || 'trustid_platform';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Database '${dbName}' checked/created.`);

        await connection.changeUser({ database: dbName });
        console.log(`Switched to database '${dbName}'.`);

        // 2. Read and Execute Schema
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await connection.query(schemaSql);
        console.log('Schema executed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
