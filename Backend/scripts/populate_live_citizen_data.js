const db = require('../config/db');
const crypto = require('crypto');

(async () => {
    try {
        console.log("🚀 Starting Real Data Population for Citizen Portal...");

        // 1. Find a Target Citizen (Assuming the primary demo user)
        // We look for a citizen with a specific mobile or just the first one.
        const [citizens] = await db.query("SELECT * FROM users WHERE role = 'Citizen' LIMIT 1");
        if (citizens.length === 0) {
            console.error("❌ No Citizen found. Please run seed_data.js first.");
            process.exit(1);
        }
        const citizen = citizens[0];
        console.log(`👤 Target Citizen: ${citizen.full_name} (${citizen.unique_id})`);

        // 2. Find Providers/Gov Entities
        const [providers] = await db.query("SELECT * FROM users WHERE role IN ('Service Provider', 'Government', 'Regulatory Authority')");
        const insurance = providers.find(p => p.full_name.includes('Insurance') || p.role === 'Service Provider') || providers[0];
        const hospital = providers.find(p => p.full_name.includes('Hospital') || p.role === 'Service Provider') || providers[1] || providers[0];
        const ministry = providers.find(p => p.role === 'Government') || providers[0];

        if (!insurance || !hospital) {
            console.warn("⚠️ Not enough providers found, reusing available ones.");
        }

        console.log(`🏥 Using Entities: ${insurance?.full_name}, ${hospital?.full_name}, ${ministry?.full_name}`);

        // 3. Clear existing consents for this user to avoid duplicates (Optional, but good for cleanliness)
        await db.query("DELETE FROM consents WHERE owner_identity_id = ?", [citizen.unique_id]);
        await db.query("DELETE FROM audit_logs WHERE target_identity_id = ?", [citizen.unique_id]);

        // 4. Create Active Consent (Hospital)
        const activeConsentId = crypto.randomUUID();
        const activeAttrs = JSON.stringify(['full_name', 'dob', 'blood_group', 'allergies']);
        await db.query(`
            INSERT INTO consents (id, owner_identity_id, requester_identity_id, purpose, allowed_attributes, status, created_at, valid_from, valid_until)
            VALUES (?, ?, ?, 'Medical Emergency Access & Routine Checkup', ?, 'active', NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY))
        `, [activeConsentId, citizen.unique_id, hospital.unique_id, activeAttrs]);
        console.log("✅ Created Active Consent from Hospital.");

        // 5. Create Pending Request (Insurance) - HIGH PRIORITY
        const pendingId1 = crypto.randomUUID();
        const pendingAttrs1 = JSON.stringify(['full_name', 'dob', 'health_id', 'past_major_illnesses']);
        await db.query(`
            INSERT INTO consents (id, owner_identity_id, requester_identity_id, purpose, allowed_attributes, status, created_at)
            VALUES (?, ?, ?, 'Policy Premium Calculation & Risk Assessment', ?, 'pending', NOW())
        `, [pendingId1, citizen.unique_id, insurance.unique_id, pendingAttrs1]);
        console.log("✅ Created Pending Request from Insurance Co.");

        // 6. Create Pending Request (Government) - Subsidy
        const pendingId2 = crypto.randomUUID();
        const pendingAttrs2 = JSON.stringify(['full_name', 'address_city', 'income_bracket']); // Assuming income_bracket exists or just simulated attrs
        // Note: Validation might fail if 'income_bracket' isn't in ALLOWED_ATTRIBUTES in server.js. Let's use standard ones.
        const pendingAttrs2Safe = JSON.stringify(['full_name', 'address_city', 'address_state', 'email']);

        await db.query(`
            INSERT INTO consents (id, owner_identity_id, requester_identity_id, purpose, allowed_attributes, status, created_at)
            VALUES (?, ?, ?, 'Urban Development Subsidy Eligibility Check', ?, 'pending', DATE_SUB(NOW(), INTERVAL 2 HOUR))
        `, [pendingId2, citizen.unique_id, ministry.unique_id, pendingAttrs2Safe]);
        console.log("✅ Created Pending Request from Ministry.");

        // 7. Populate Audit Logs (History)
        const logs = [
            { actor: citizen, action: 'LOGIN', target: citizen, purpose: 'Portal Access', time: 'INTERVAL 5 MINUTE' },
            { actor: hospital, action: 'DATA_ACCESS', target: citizen, purpose: 'Emergency Room Admission', meta: { accessed: ['blood_group', 'allergies'] }, time: 'INTERVAL 2 DAY' },
            { actor: citizen, action: 'CONSENT_APPROVED', target: citizen, purpose: 'Hospital Access', meta: { consent_id: activeConsentId }, time: 'INTERVAL 2 DAY' },
            { actor: insurance, action: 'CONSENT_REQUEST', target: citizen, purpose: 'Policy Renewal', meta: { consent_id: pendingId1 }, time: 'INTERVAL 1 HOUR' }
        ];

        for (const log of logs) {
            await db.query(`
                INSERT INTO audit_logs (id, actor_identity_id, actor_role, target_identity_id, action_type, purpose, metadata, timestamp)
                VALUES (UUID(), ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), ${log.time}))
            `, [log.actor.unique_id, log.actor.role, log.target.unique_id, log.action, log.purpose, JSON.stringify(log.meta || {})]);
        }
        console.log("✅ Created Audit Logs (Access History).");

        console.log("🎉 Real Data Population Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Failed to populate data:", err);
        process.exit(1);
    }
})();
