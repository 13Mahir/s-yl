const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🛠️  Updating Users Schema for Status...");

        // Modify ENUM to include 'pending'
        await db.query(`
            ALTER TABLE users 
            MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active'
        `);
        console.log("   ✅ Executed: MODIFY COLUMN status ENUM(...)");

        console.log("✅ Schema Update Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Update Failed:", err);
        process.exit(1);
    }
}

updateSchema();
