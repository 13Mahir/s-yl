const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🛠️  Updating Users Schema for Roles...");

        // Modify ENUM to include 'Government', 'Organization'
        // Existing: 'Citizen', 'Service Provider', 'Regulatory Authority', 'Admin' (maybe)
        // We will make it broad.
        await db.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('Citizen', 'Service Provider', 'Regulatory Authority', 'Government', 'Organization', 'Admin') NOT NULL
        `);
        console.log("   ✅ Executed: MODIFY COLUMN role ENUM(...)");

        console.log("✅ Schema Update Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Update Failed:", err);
        process.exit(1);
    }
}

updateSchema();
