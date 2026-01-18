const db = require('./config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query("DESCRIBE users");
        console.log("Users Table Columns:");
        rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkSchema();
