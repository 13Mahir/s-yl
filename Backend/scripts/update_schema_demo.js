const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🛠️  Updating Schema for Demo...");

        // Add columns if they don't exist
        // Note: IF NOT EXISTS syntax for ADD COLUMN requires MariaDB 10.2+ or MySQL 8.0.29+. 
        // For safety, we can wrap in try-catch or check existence. 
        // Simple approach: Try adding each. If error duplicate, ignore.

        const columns = [
            "ADD COLUMN health_id VARCHAR(50)",
            "ADD COLUMN blood_group VARCHAR(5)",
            "ADD COLUMN known_conditions TEXT",
            "ADD COLUMN emergency_contact VARCHAR(15)",
            "ADD COLUMN city_id VARCHAR(50)",
            "ADD COLUMN insurance_policy_number VARCHAR(50)"
        ];

        for (const col of columns) {
            try {
                await db.query(`ALTER TABLE users ${col}`);
                console.log(`   ✅ Executed: ${col}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`   ⚠️  Column already exists (skipped): ${col}`);
                } else {
                    console.error(`   ❌ Error executing ${col}:`, err.message);
                }
            }
        }

        console.log("✅ Schema Update Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Update Failed:", err);
        process.exit(1);
    }
}

updateSchema();
