const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🛠️  Updating Schema for Governance...");

        // Add 'domain' to workflow_cases
        try {
            await db.query(`ALTER TABLE workflow_cases ADD COLUMN domain VARCHAR(100) NULL AFTER type`);
            console.log("   ✅ Executed: ADD COLUMN domain to workflow_cases");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') console.log("   ⚠️  Column 'domain' already exists in workflow_cases (skipped)");
            else console.error("   ❌ Error adding domain:", err.message);
        }

        console.log("✅ Schema Update Complete.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Update Failed:", err);
        process.exit(1);
    }
}

updateSchema();
