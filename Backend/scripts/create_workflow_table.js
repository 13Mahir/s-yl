const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trustid_platform'
};

const createWorkflowTable = async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to database...");

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS workflow_cases (
                id VARCHAR(36) PRIMARY KEY,
                type VARCHAR(100) NOT NULL,
                citizen_identity_id VARCHAR(50) NOT NULL,
                service_identity_id VARCHAR(50) NULL,
                government_identity_id VARCHAR(50) NULL,
                status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'DRAFT',
                purpose TEXT NULL,
                required_attributes JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_citizen (citizen_identity_id),
                INDEX idx_service (service_identity_id),
                INDEX idx_status (status)
            );
        `;

        await connection.query(createTableQuery);
        console.log("✅ 'workflow_cases' table created successfully.");

    } catch (err) {
        console.error("❌ Error creating table:", err);
    } finally {
        if (connection) await connection.end();
    }
};

createWorkflowTable();
