const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'trustid_platform'
    });

    try {
        console.log("Adding service_type column to consents table...");
        // Check if column exists first to avoid error (though harmless usually)
        const [columns] = await db.query(`SHOW COLUMNS FROM consents LIKE 'service_type'`);
        if (columns.length === 0) {
            await db.query(`ALTER TABLE consents ADD COLUMN service_type VARCHAR(100) DEFAULT 'General Service'`);
            console.log("Column 'service_type' added successfully.");
        } else {
            console.log("Column 'service_type' already exists.");
        }

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await db.end();
    }
}

migrate();
