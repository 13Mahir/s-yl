const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trustid_platform'
};

const updateUsersTable = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database...");

        // specific check if column exists would be better, but 'ADD COLUMN IF NOT EXISTS' is MariaDB 10.2+ or MySQL 8.0.29+
        // simpler for this env: Try to add, ignore if duplicate column error (1060).

        try {
            const alterQuery = `
                ALTER TABLE users 
                ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active';
            `;
            await connection.query(alterQuery);
            console.log("✅ 'users' table updated with 'status' column.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ 'status' column already exists.");
            } else {
                throw err;
            }
        }

    } catch (err) {
        console.error("❌ Error updating table:", err);
    } finally {
        if (connection) await connection.end();
    }
};

updateUsersTable();
