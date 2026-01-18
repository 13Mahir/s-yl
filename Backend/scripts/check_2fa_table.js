
const db = require('./config/db');

async function checkTable() {
    try {
        const [rows] = await db.query('DESCRIBE two_factor_sessions');
        console.log('Table Schema:', rows);
    } catch (err) {
        console.error('Error describing table:', err.message);
        // Try creating it if missing
        if (err.code === 'ER_NO_SUCH_TABLE') {
            console.log("Table missing. Creating...");
            await db.query(`
                CREATE TABLE IF NOT EXISTS two_factor_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    actor_type ENUM('SERVICE', 'GOV') NOT NULL,
                    actor_id VARCHAR(50) NOT NULL,
                    verification_code VARCHAR(10) NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    is_verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
             `);
            console.log("Table created.");
        }
    } finally {
        process.exit();
    }
}

checkTable();
