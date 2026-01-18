const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trustid_platform'
};

const createAuditTable = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database...");

        // DROP OLD TABLE FIRST to ensure schema update
        await connection.query('DROP TABLE IF EXISTS audit_logs');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS audit_logs (
                id VARCHAR(36) PRIMARY KEY,
                actor_identity_id VARCHAR(50) NOT NULL,
                actor_role VARCHAR(50) NOT NULL,
                target_identity_id VARCHAR(50) NOT NULL,
                action_type ENUM('DATA_ACCESS', 'CONSENT_REQUEST', 'CONSENT_APPROVED', 'CONSENT_REVOKED', 'LOGIN', 'LOGOUT') NOT NULL,
                accessed_attributes JSON NULL,
                purpose TEXT NULL,
                metadata JSON NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_actor (actor_identity_id),
                INDEX idx_target (target_identity_id),
                INDEX idx_time (timestamp)
            );
        `;

        await connection.query(createTableQuery);
        console.log("✅ 'audit_logs' table created successfully.");

    } catch (err) {
        console.error("❌ Error creating table:", err);
    } finally {
        if (connection) await connection.end();
    }
};

createAuditTable();
