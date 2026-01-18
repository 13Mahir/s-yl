
const db = require('./config/db');

async function fix() {
    try {
        await db.query(`UPDATE users SET status = 'active' WHERE unique_id = 'GOV-GJ-CIVIL-HOSPITAL'`);
        console.log("✅ GOV-GJ-CIVIL-HOSPITAL has been re-activated.");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

fix();
