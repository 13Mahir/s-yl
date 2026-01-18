const db = require('./config/db');

async function addColumns() {
    try {
        console.log("Checking and adding missing columns to users table...");

        // Array of columns to check/add
        const columns = [
            "ADD COLUMN IF NOT EXISTS dob DATE",
            "ADD COLUMN IF NOT EXISTS gender ENUM('Male', 'Female', 'Other')",
            "ADD COLUMN IF NOT EXISTS address_city VARCHAR(100)",
            "ADD COLUMN IF NOT EXISTS address_state VARCHAR(100)"
        ];

        for (const colDef of columns) {
            // MySQL doesn't support IF NOT EXISTS in ADD COLUMN in all versions readily in one line without procedure, 
            // but commonly we can try-catch or use stored procedure. 
            // For simplicity in this env, we'll just try to add them. 
            // If it fails with "Duplicate column", we ignore.
            try {
                await db.query(`ALTER TABLE users ${colDef.replace("IF NOT EXISTS ", "")}`);
                console.log(`Added: ${colDef}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${colDef}`);
                } else {
                    console.error(`Failed to add: ${colDef}`, e.message);
                }
            }
        }

        console.log("Schema migration completed.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

addColumns();
