const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trustid_platform'
};

const checkDb = async () => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.query(`SELECT * FROM consents ORDER BY created_at DESC LIMIT 1`);
        console.log("Last Consent Record:", rows[0]);
        console.log("Current Server Time:", new Date());

        if (rows.length > 0) {
            console.log("Valid Until:", rows[0].valid_until);
            console.log("Is Past?", new Date() > new Date(rows[0].valid_until));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
};

checkDb();
