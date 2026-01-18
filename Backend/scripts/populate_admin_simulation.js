const db = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

async function runSimulation() {
    console.log("Starting Admin Data Simulation...");

    const actors = [
        { id: '7383654894', role: 'Citizen' },
        { id: 'gov-ka-general-hospital', role: 'Service Provider' },
        { id: 'gov-admin-01', role: 'Government' }
    ];

    const actions = [
        { type: 'LOGIN', purpose: 'Session Access' },
        { type: 'GRANT', purpose: 'Medical Record Access' },
        { type: 'ACCESS', purpose: 'Emergency Trauma Care' },
        { type: 'REVOKE', purpose: 'User Request' }
    ];

    try {
        const crypto = require('crypto');
        // 1. POPULATE AUDIT LOGS
        console.log("Inserting 25 Realistic Audit Logs...");
        for (let i = 0; i < 25; i++) {
            const actor = actors[Math.floor(Math.random() * actors.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const timeOffset = Math.floor(Math.random() * 10000000); // Random time in last ~3 hours
            const timestamp = new Date(Date.now() - timeOffset);
            const uuid = crypto.randomUUID();

            await db.query(`INSERT INTO audit_logs (id, actor_identity_id, actor_role, action_type, purpose, target_identity_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [uuid, actor.id, actor.role, action.type, action.purpose, 'system', timestamp]
            );
        }

        // 2. POPULATE PLATFORM SETTINGS (Key-Value Store)
        // Ensure table exists first (if not created via migration, strictly create here for demo speed)
        await db.query(`CREATE TABLE IF NOT EXISTS system_settings (
            setting_key VARCHAR(255) PRIMARY KEY,
            setting_value TEXT,
            description TEXT
        )`);

        const settings = [
            { key: 'global_risk_threshold', value: 'High', desc: 'Global Alert Trigger Level' },
            { key: 'min_consent_duration', value: '1 Hour', desc: 'Minimum allowed consent time' },
            { key: 'max_consent_duration', value: '30 Days', desc: 'Maximum allowed consent time' },
            { key: 'two_factor_enforcement', value: 'Strict', desc: '2FA Policy for Providers' },
            { key: 'maintenance_mode', value: 'False', desc: 'System-wide lockout' }
        ];

        for (const s of settings) {
            await db.query(`INSERT INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?`,
                [s.key, s.value, s.desc, s.value]
            );
        }
        console.log("Platform Settings Configured.");

        console.log("Simulation Complete. Admin Board Populated.");
        process.exit(0);

    } catch (err) {
        console.error("Simulation Failed:", err);
        process.exit(1);
    }
}

runSimulation();
