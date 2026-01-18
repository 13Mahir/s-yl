const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trustid_platform'
};

const createConsentsTable = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database...");

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS consents (
                id VARCHAR(36) PRIMARY KEY,
                owner_identity_id VARCHAR(50) NOT NULL,
                requester_identity_id VARCHAR(50) NOT NULL,
                purpose TEXT NOT NULL,
                allowed_attributes JSON NOT NULL,
                status ENUM('active', 'revoked', 'expired', 'pending') DEFAULT 'pending',
                valid_from TIMESTAMP NULL,
                valid_until TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_owner (owner_identity_id),
                INDEX idx_requester (requester_identity_id),
                INDEX idx_status (status)
            );
        `;

        await connection.query(createTableQuery);
        console.log("✅ 'consents' table created successfully.");

    } catch (err) {
        console.error("❌ Error creating table:", err);
    } finally {
        if (connection) await connection.end();
    }
};

createConsentsTable();
