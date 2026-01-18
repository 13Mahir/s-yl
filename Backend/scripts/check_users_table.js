
const db = require('./config/db');

async function checkTable() {
    try {
        const [rows] = await db.query('DESCRIBE users');
        console.log('Users Table Schema:', rows);
    } catch (err) {
        console.error('Error describing table:', err.message);
    } finally {
        process.exit();
    }
}

checkTable();
