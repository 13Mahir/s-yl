
const db = require('./config/db');
const crypto = require('crypto');

async function seed() {
    console.log("\n🌱  SEEDING NATIONAL GOVERNANCE SIMULATION");
    console.log("==================================================");

    try {
        // 1. CLEANUP
        // Fetch ID for Mahir's email to ensure we clean up duplicates
        const [emailRows] = await db.query(`SELECT unique_id FROM users WHERE email = 'mahirshah1303@gmail.com'`);

        let IDS_TO_CLEAN = [
            'gov-root-admin', 'GOV-ROOT-ADMIN',
            'gov-gj-civil-hospital', 'GOV-GJ-CIVIL-HOSPITAL',
            'gov-rj-transport-dept', 'GOV-RJ-TRANSPORT-DEPT',
            'gov-gj-municipal-corp', 'GOV-GJ-MUNICIPAL-CORP',
            'org-apollo-ahm', 'ORG-APOLLO-AHM',
            'org-citycare-diag', 'ORG-CITYCARE-DIAG',
            'org-smartcity-utils', 'ORG-SMARTCITY-UTILS',
            '987654321012', '9123456780', '9876543210', '7383654894'
        ];

        if (emailRows.length > 0) {
            IDS_TO_CLEAN.push(emailRows[0].unique_id);
        }

        // Remove duplicates
        IDS_TO_CLEAN = [...new Set(IDS_TO_CLEAN)];

        console.log(`   🧹 Cleaning up ${IDS_TO_CLEAN.length} entities:`, IDS_TO_CLEAN);

        // NULL email to break unique constraint immediately (Backup plan if DELETE fails)
        await db.query(`UPDATE users SET email = NULL WHERE email = 'mahirshah1303@gmail.com'`);
        await db.query(`UPDATE users SET email = NULL WHERE email = 'mahirshah1303+gov@gmail.com'`);

        // Delete Dependents FIRST (Foreign Key Constraints)
        await db.query(`DELETE FROM workflow_cases WHERE citizen_identity_id IN (?) OR service_identity_id IN (?)`, [IDS_TO_CLEAN, IDS_TO_CLEAN]);
        await db.query(`DELETE FROM consents WHERE owner_identity_id IN (?) OR requester_identity_id IN (?)`, [IDS_TO_CLEAN, IDS_TO_CLEAN]);
        await db.query(`DELETE FROM audit_logs WHERE actor_identity_id IN (?) OR target_identity_id IN (?)`, [IDS_TO_CLEAN, IDS_TO_CLEAN]);
        await db.query(`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE unique_id IN (?))`, [IDS_TO_CLEAN]);
        await db.query(`DELETE FROM otp_sessions WHERE mobile_number IN (?)`, [IDS_TO_CLEAN]);
        // Also clean 2FA sessions (added in server.js) which likely use actor_id = unique_id
        await db.query(`DELETE FROM two_factor_sessions WHERE actor_id IN (?)`, [IDS_TO_CLEAN]);

        // Then Delete Users
        await db.query(`DELETE FROM users WHERE unique_id IN (?)`, [IDS_TO_CLEAN]);
        await db.query(`DELETE FROM users WHERE email = 'mahirshah1303@gmail.com'`); // Double-tap
        console.log("   ✅ Cleanup Complete.");

        // 2. ROOT AUTHORITY
        await db.query(`
            INSERT INTO users (unique_id, role, full_name, status, password_hash, dob, gender, address_city, address_state)
            VALUES (?, 'Regulatory Authority', 'Ministry of Electronics & IT', 'active', 'root_pass_123', '1980-01-01', 'Other', 'New Delhi', 'Delhi')
        `, ['gov-root-admin']);
        console.log("   ✅ Created Root: Ministry of Electronics & IT");

        // 3. GOVERNMENT AUTHORITIES (APPROVED)
        const GOV_ENTITIES = [
            { id: 'GOV-GJ-CIVIL-HOSPITAL', name: 'Gujarat Civil Hospital', city: 'Ahmedabad', state: 'Gujarat', pass: 'GJ-HOSPITAL@123' },
            { id: 'GOV-RJ-TRANSPORT-DEPT', name: 'Rajasthan State Transport Dept', city: 'Jaipur', state: 'Rajasthan', pass: 'RJ-TRANSPORT@123' },
            { id: 'GOV-GJ-MUNICIPAL-CORP', name: 'Gujarat Municipal Corporation', city: 'Gandhinagar', state: 'Gujarat', pass: 'GJ-MUNICIPAL@123' }
        ];

        for (const g of GOV_ENTITIES) {
            await db.query(`
                INSERT INTO users (unique_id, role, full_name, status, password_hash, dob, gender, address_city, address_state)
                VALUES (?, 'Government', ?, 'active', ?, '1990-01-01', 'Other', ?, ?)
            `, [g.id, g.name, g.pass, g.city, g.state]);
        }
        console.log("   ✅ Created 3 Govt Authorities");

        // 4. ORGANIZATIONS (MIXED STATUS)
        const ORGS = [
            { id: 'ORG-APOLLO-AHM', name: 'Apollo Hospital Ahmedabad', role: 'Service Provider', status: 'active', pass: 'APOLLO@123', city: 'Ahmedabad' },
            { id: 'ORG-CITYCARE-DIAG', name: 'CityCare Diagnostics', role: 'Service Provider', status: 'pending', pass: 'CITYCARE@123', city: 'Ahmedabad' },
            { id: 'ORG-SMARTCITY-UTILS', name: 'SmartCity Utilities', role: 'Service Provider', status: 'active', pass: 'SMARTCITY@123', city: 'Surat' }
        ];

        for (const o of ORGS) {
            await db.query(`
                INSERT INTO users (unique_id, role, full_name, status, password_hash, dob, gender, address_city, address_state)
                VALUES (?, ?, ?, ?, ?, '2000-01-01', 'Other', ?, 'Gujarat')
            `, [o.id, o.role, o.name, o.status, o.pass, o.city]);
        }
        console.log("   ✅ Created 3 Organizations");

        // 5. CITIZENS
        // Mahir (Approved, Rich Data)
        await db.query(`
            INSERT INTO users (unique_id, role, full_name, status, password_hash, dob, gender, address_city, address_state, email, health_id, blood_group, allergies, clinical_height, clinical_weight, clinical_vitals_date)
            VALUES (?, 'Citizen', 'Mahir Shah', 'active', 'hashed_default', '1998-05-15', 'Male', 'Ahmedabad', 'Gujarat', 'mahirshah1303+gov@gmail.com', 'HID-GJ-998877', 'B+', 'Chickpeas', "5'11\\"", '48 kg', '2025-12-01')
        `, ['987654321012']); // Using the specific ID requested in previous turn, but prompt says mobile 7383654894. I should update Unique ID to Mobile?
        // Prompt says "Mobile: 7383654894". In our system `unique_id` IS often the mobile login. 
        // PART 5 says: "Citizen Login: Mobile: 7383654894".
        // SO I WILL USE '7383654894' as the unique_id for Mahir.

        // Wait, previous seeds used '987654321012'. I should Update Mahir's ID to '7383654894' to match the Login Instructions.

        // Re-inserting Mahir with CORRECT Mobile ID
        await db.query(`DELETE FROM users WHERE unique_id = '7383654894'`);
        await db.query(`
            INSERT INTO users (unique_id, role, full_name, status, password_hash, dob, gender, address_city, address_state, email, health_id, blood_group, allergies, clinical_height, clinical_weight, clinical_vitals_date)
            VALUES (?, 'Citizen', 'Mahir Shah', 'active', 'hashed_default', '1998-05-15', 'Male', 'Ahmedabad', 'Gujarat', 'mahirshah1303@gmail.com', 'HID-GJ-998877', 'B+', 'Chickpeas', "5'11\\"", '48 kg', '2025-12-01')
        `, ['7383654894']);

        // Riya (Approved)
        await db.query(`DELETE FROM users WHERE unique_id = '9123456780'`);
        await db.query(`
            INSERT INTO users (unique_id, role, full_name, status, password_hash, dob, gender, address_city, address_state, allergies)
            VALUES (?, 'Citizen', 'Riya Patel', 'active', 'hashed_default', '1995-08-20', 'Female', 'Surat', 'Gujarat', 'Penicillin')
        `, ['9123456780']);

        // Arjun (Pending)
        await db.query(`DELETE FROM users WHERE unique_id = '9876543210'`);
        await db.query(`
            INSERT INTO users (unique_id, role, full_name, status, password_hash, dob, gender, address_city, address_state)
            VALUES (?, 'Citizen', 'Arjun Mehta', 'pending', 'hashed_default', '1992-11-10', 'Male', 'Jaipur', 'Rajasthan')
        `, ['9876543210']);

        console.log("   ✅ Created 3 Citizens (Mahir, Riya, Arjun)");


        // 6. DEFAULT GOVERNANCE CASES
        const CASES = [
            // Healthcare
            { type: 'Emergency Medical Verification', domain: 'Healthcare', purpose: 'Critical Care Identity Check', req: ['health_id', 'blood_group', 'allergies'], cit: '7383654894', svc: 'gov-gj-civil-hospital' },
            { type: 'Allergy & Medication Validation', domain: 'Healthcare', purpose: 'Prescription safety check', req: ['allergies', 'current_medications'], cit: '9123456780', svc: 'gov-gj-civil-hospital' },
            { type: 'Chronic Disease Management', domain: 'Healthcare', purpose: 'Long-term care plan', req: ['known_conditions'], cit: '7383654894', svc: 'gov-gj-civil-hospital' },
            // Transport
            { type: 'License Renewal', domain: 'Transport', purpose: 'RTO Identity Check', req: ['full_name', 'dob', 'address_state'], cit: '9876543210', svc: 'gov-rj-transport-dept' },
            { type: 'Vehicle Registration', domain: 'Transport', purpose: 'Ownership transfer', req: ['full_name', 'address_city'], cit: '7383654894', svc: 'gov-rj-transport-dept' },
            // Urban
            { type: 'Address Verification', domain: 'Urban', purpose: 'Municipal tax assessment', req: ['address_city'], cit: '9123456780', svc: 'gov-gj-municipal-corp' },
            { type: 'Utility Mapping', domain: 'Urban', purpose: 'Water connection setup', req: ['address_city', 'address_state'], cit: '7383654894', svc: 'org-smartcity-utils' } // Assigned to Org
        ];

        for (let i = 0; i < CASES.length; i++) {
            const c = CASES[i];
            const caseId = `CASE-2026-${String(i + 1).padStart(3, '0')}`;
            await db.query(`
                INSERT INTO workflow_cases (id, type, domain, citizen_identity_id, service_identity_id, purpose, required_attributes, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [caseId, c.type, c.domain, c.cit, c.svc, c.purpose, JSON.stringify(c.req), 'SUBMITTED']);
        }
        console.log(`   ✅ Seeded ${CASES.length} Active Governance Cases.`);

        console.log("\n🌱  SEEDING COMPLETE.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding Failed:", err);
        process.exit(1);
    }
}

seed();
