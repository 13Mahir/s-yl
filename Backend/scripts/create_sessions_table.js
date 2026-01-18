const db = require('./config/db');

async function createSessionsTable() {
  try {
    console.log("Creating sessions table...");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sessions (
        token VARCHAR(255) PRIMARY KEY,
        user_id INT NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await db.query(createTableQuery);

    console.log("Sessions table created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

createSessionsTable();
