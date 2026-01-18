
const db = require('./config/db');

async function checkStatus() {
    try {
        const [rows] = await db.query(`SELECT unique_id, role, status FROM users WHERE role IN ('Government', 'Service Provider')`);
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkStatus();
