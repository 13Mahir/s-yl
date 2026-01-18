const db = require('./config/db');

async function safeAddColumn(colDef) {
    try {
        await db.query(`ALTER TABLE users ADD COLUMN ${colDef}`);
        console.log(`✅ Added: ${colDef.split(' ')[0]}`);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log(`ℹ️ Exists: ${colDef.split(' ')[0]}`);
        } else {
            console.error(`❌ Failed to add ${colDef.split(' ')[0]}:`, err.message);
        }
    }
}

async function alterTable() {
    console.log("Modifying schema...");

    // Agriculture
    await safeAddColumn("agri_land_status VARCHAR(100)");
    await safeAddColumn("agri_subsidy VARCHAR(100)");
    await safeAddColumn("agri_farm_activity TEXT");
    await safeAddColumn("agri_soil_health VARCHAR(100)");

    // Civic
    await safeAddColumn("civic_address TEXT");
    await safeAddColumn("civic_zone VARCHAR(100)");
    await safeAddColumn("civic_utility_status VARCHAR(100)");

    console.log("Schema update complete.");
    process.exit();
}
alterTable();
