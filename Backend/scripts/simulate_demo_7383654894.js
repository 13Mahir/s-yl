const db = require('../config/db');
const crypto = require('crypto');

(async () => {
    try {
        const TARGET_ID = '7383654894';
        console.log(`🚀 Starting Demo Simulation for ${TARGET_ID}...`);

        // 1. Get Entities
        const [users] = await db.query("SELECT * FROM users WHERE unique_id IN (?, 'ORG-HEALTH-01', 'GOV-RJ-TR-2025', 'ORG-INS-01')", [TARGET_ID]);

        const citizen = users.find(u => u.unique_id === TARGET_ID);
        // Fallback: search by partial name if specific ID not found for providers
        const [providers] = await db.query("SELECT * FROM users WHERE role IN ('Service Provider', 'Government', 'Regulatory Authority')");

        const hospital = providers.find(p => p.full_name.includes('Hospital')) || providers[0];
        const insurance = providers.find(p => p.full_name.includes('Insurance')) || providers.find(p => p.role === 'Service Provider' && p.id !== hospital.id);
        const transport = providers.find(p => p.full_name.includes('Transport') || p.role.includes('Regulatory')) || providers.find(p => p.role === 'Government');

        if (!citizen) {
            console.error("❌ Citizen 7383654894 not found.");
            process.exit(1);
        }
        console.log(`👤 Citizen: ${citizen.full_name}`);
        console.log(`🏥 Hospital: ${hospital?.full_name}`);
        console.log(`🛡️ Insurance: ${insurance?.full_name}`);
        console.log(`🏛️ Govt: ${transport?.full_name}`);

        // 2. Clean Slate
        console.log("🧹 Cleaning old data...");
        await db.query("DELETE FROM consents WHERE owner_identity_id = ?", [TARGET_ID]);
        await db.query("DELETE FROM audit_logs WHERE target_identity_id = ?", [TARGET_ID]);

        // 3. SCENARIO 1: Hospital Request -> ACCEPTED (Active)
        const consentId1 = crypto.randomUUID();
        const attrs1 = JSON.stringify(['full_name', 'dob', 'blood_group', 'allergies']);
        await db.query(`
            INSERT INTO consents (id, owner_identity_id, requester_identity_id, purpose, allowed_attributes, status, created_at, valid_from, valid_until)
            VALUES (?, ?, ?, 'Emergency Care & History', ?, 'active', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))
        `, [consentId1, TARGET_ID, hospital.unique_id, attrs1]);

        // Log for Scenario 1
        await db.query(`
            INSERT INTO audit_logs (id, actor_identity_id, actor_role, target_identity_id, action_type, purpose, metadata, timestamp)
            VALUES (UUID(), ?, ?, ?, 'CONSENT_APPROVED', 'Hospital Access', ?, DATE_SUB(NOW(), INTERVAL 2 DAY))
        `, [citizen.unique_id, citizen.role, citizen.unique_id, JSON.stringify({ consent_id: consentId1 })]);

        // 4. SCENARIO 2: Insurance Request -> PENDING
        const consentId2 = crypto.randomUUID();
        const attrs2 = JSON.stringify(['full_name', 'dob', 'health_id', 'past_major_illnesses']);
        await db.query(`
            INSERT INTO consents (id, owner_identity_id, requester_identity_id, purpose, allowed_attributes, status, created_at)
            VALUES (?, ?, ?, 'Premium Calculation', ?, 'pending', NOW())
        `, [consentId2, TARGET_ID, insurance.unique_id, attrs2]);

        // Log for Scenario 2
        await db.query(`
            INSERT INTO audit_logs (id, actor_identity_id, actor_role, target_identity_id, action_type, purpose, metadata, timestamp)
            VALUES (UUID(), ?, ?, ?, 'CONSENT_REQUEST', 'Premium Calculation', ?, DATE_SUB(NOW(), INTERVAL 10 MINUTE))
        `, [insurance.unique_id, insurance.role, citizen.unique_id, JSON.stringify({ consent_id: consentId2 })]);

        // 5. SCENARIO 3: Govt Request -> PENDING
        if (transport) {
            const consentId3 = crypto.randomUUID();
            const attrs3 = JSON.stringify(['full_name', 'address_city', 'dob']);
            await db.query(`
                INSERT INTO consents (id, owner_identity_id, requester_identity_id, purpose, allowed_attributes, status, created_at)
                VALUES (?, ?, ?, 'License Renewal Verification', ?, 'pending', DATE_SUB(NOW(), INTERVAL 1 HOUR))
            `, [consentId3, TARGET_ID, transport.unique_id, attrs3]);
        }

        console.log("✅ Simulation Complete. Citizen has 1 Active Consent and 2 Pending Requests.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Simulation Failed:", err);
        process.exit(1);
    }
})();
