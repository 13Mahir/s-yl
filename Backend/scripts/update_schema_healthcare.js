const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("🛠️  Updating Schema for Deep Healthcare...");

        const columns = [
            "ADD COLUMN last_verification_date DATE",
            "ADD COLUMN past_major_illnesses TEXT",
            "ADD COLUMN allergies TEXT",
            "ADD COLUMN current_medications JSON",
            "ADD COLUMN clinical_height VARCHAR(20)",
            "ADD COLUMN clinical_weight VARCHAR(20)",
            "ADD COLUMN clinical_vitals_date DATE",
            "ADD COLUMN life_threatening_conditions TEXT"
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
