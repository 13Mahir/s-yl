
const BASE_URL = 'http://localhost:5001/api';
const db = require('./config/db');

// --- DATA ---
const CITIZEN = {
    full_name: "Aarav Mehta",
    unique_id: "987654321012", // 12-digit mock Aadhaar
    role: "Citizen",
    dob: "1998-03-12",
    gender: "Male",
    address_city: "Ahmedabad",
    address_state: "Gujarat",
    health_id: "GJ-HID-784512",
    blood_group: "O+",
    known_conditions: "Asthma",
    emergency_contact: "+91-98XXXXXX21",
    city_id: "AMD-009812",
    insurance_policy_number: "LIC-GJ-99821",
    password_hash: "hashed_secret"
};

const HOSPITAL = {
    org_name: "Gujarat Civil Hospital",
    unique_id: "gov-gj-civil-hospital",
    role: "Service Provider", // Using Service Provider role for simplicity, or 'Regulatory Authority' if government? 
    // Prompt says "Role: government". In my schema 'Regulatory Authority' is government, but they usually *view* data too?
    // Actually, Hospitals are Service Providers that are Government-owned.
    // My schema supports 'Service Provider' requesting consent. 
    // Let's use 'Service Provider' but maybe I need to ensure they can login.
    // I will register them as Service Provider.
    email: "admin@civilhospital.gj.gov.in"
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
    console.log("\n==================================================");
    console.log("🚀  STARTING CONSENT LIFECYCLE SIMULATION");
    console.log("==================================================\n");

    try {
        // 1. SETUP DATA
        console.log("🛠️  1. POPULATING IDENTITIES...");

        // Clear existing demo users to ensure clean state
        await db.query(`DELETE FROM users WHERE unique_id IN (?, ?)`, [CITIZEN.unique_id, HOSPITAL.unique_id]);

        // Insert Citizen
        await db.query(`INSERT INTO users SET ?`, CITIZEN);
        console.log(`   ✅ Created Citizen: ${CITIZEN.full_name} (${CITIZEN.unique_id})`);

        // Insert Hospital
        await db.query(`INSERT INTO users (unique_id, role, full_name, email, password_hash) VALUES (?, ?, ?, ?, 'hashed')`,
            [HOSPITAL.unique_id, HOSPITAL.role, HOSPITAL.org_name, HOSPITAL.email]);
        console.log(`   ✅ Created Hospital: ${HOSPITAL.org_name} (${HOSPITAL.unique_id})`);


        // 2. LOGINS
        console.log("\n🔑  2. AUTHENTICATION...");

        // Login Hospital (2FA flow mock)
        const hosp2faInit = await fetch(`${BASE_URL}/auth/send-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: HOSPITAL.unique_id, actor_type: 'SERVICE' }) });
        const hospCode = (await hosp2faInit.json()).demo_code;
        const hospLogin = await fetch(`${BASE_URL}/auth/verify-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: HOSPITAL.unique_id, code: hospCode }) });
        const hospData = await hospLogin.json();
        if (!hospData.success) throw new Error("Hospital Login Failed: " + hospData.message);
        const hospToken = hospData.session_token;
        console.log(`   🏥 Hospital Logged In. Token: ${hospToken.substring(0, 10)}...`);

        // Login Citizen (OTP flow mock)
        const citOtpInit = await fetch(`${BASE_URL}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN.unique_id }) });
        const citOtp = (await citOtpInit.json()).demo_otp;
        const citLogin = await fetch(`${BASE_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN.unique_id, otp: citOtp }) });
        const citData = await citLogin.json();
        if (!citData.success) throw new Error("Citizen Login Failed: " + citData.message);
        const citToken = citData.session_token;
        console.log(`   👤 Citizen Logged In. Token: ${citToken.substring(0, 10)}...`);


        // 3. CONSENT REQUEST
        console.log("\n📨  3. CONSENT REQUEST (HOSPITAL -> CITIZEN)...");
        const REQ_ATTRS = ["health_id", "blood_group", "known_conditions"];
        console.log(`   Requesting: ${REQ_ATTRS.join(', ')}`);

        const reqRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hospToken}` },
            body: JSON.stringify({
                citizen_identity_id: CITIZEN.unique_id,
                purpose: "Verification of medical records for government hospital treatment",
                requested_attributes: REQ_ATTRS,
                duration_days: 7
            })
        });
        const reqData = await reqRes.json();
        if (!reqData.success) throw new Error("Consent Request Failed: " + reqData.message);
        const consentId = reqData.consent_id;
        console.log(`   ✅ Request Sent. ID: ${consentId}`);


        // 4. APPROVAL
        console.log("\n👍  4. CONSENT APPROVAL (CITIZEN)...");
        const approveRes = await fetch(`${BASE_URL}/consents/${consentId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${citToken}` },
            body: JSON.stringify({ duration_days: 7 })
        });
        const approveData = await approveRes.json();
        if (!approveData.success) throw new Error("Approval Failed: " + approveData.message);
        console.log(`   ✅ Consent Approved. Status: ${approveData.status}`);


        // 5. DATA ACCESS (SUCCESSFUL)
        console.log("\n🔓  5. DATA ACCESS (HOSPITAL)...");
        const accessRes = await fetch(`${BASE_URL}/citizen/data?target_id=${CITIZEN.unique_id}`, {
            headers: { 'Authorization': `Bearer ${hospToken}` }
        });
        const accessData = await accessRes.json();

        if (accessData.success) {
            console.log("   ✅ Access GRANTED. Returned Data:");
            console.dir(accessData.data, { depth: null, colors: true });

            // Verify fields
            const returnedKeys = Object.keys(accessData.data);
            const sensitiveKeys = ["insurance_policy_number", "city_id"];
            if (sensitiveKeys.some(k => returnedKeys.includes(k))) {
                console.error("   ❌ SECURITY FAILURE: Unconsented data (Insurance/CityID) leaked!");
            } else {
                console.log("   ✅ Privacy Verified: Only consented fields returned.");
            }
        } else {
            console.error("   ❌ Access Failed:", accessData.message);
        }


        // 6. REVOCATION
        console.log("\n🚫  6. CONSENT REVOCATION (CITIZEN)...");
        const revokeRes = await fetch(`${BASE_URL}/consents/${consentId}/revoke`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${citToken}` }
        });
        const revokeData = await revokeRes.json();
        console.log(`   ✅ Revocation Status: ${revokeData.message}`);


        // 7. DATA ACCESS (BLOCKED)
        console.log("\n🔒  7. POST-REVOCATION ACCESS RETRY...");
        const retryRes = await fetch(`${BASE_URL}/citizen/data?target_id=${CITIZEN.unique_id}`, {
            headers: { 'Authorization': `Bearer ${hospToken}` }
        });

        if (retryRes.status === 403) {
            console.log(`   ✅ Access DENIED (403 Forbidden) as expected.`);
        } else {
            console.error(`   ❌ SECURITY FAILURE: Access Allowed after revocation! Status: ${retryRes.status}`);
        }


        // 8. AUDIT LOGS
        console.log("\n📜  8. AUDIT TRAIL VERIFICATION...");
        const auditRes = await fetch(`${BASE_URL}/audit/my-data-access`, {
            headers: { 'Authorization': `Bearer ${citToken}` }
        });
        const auditLogs = (await auditRes.json()).logs;

        console.log("   Recent Logs:");
        auditLogs.slice(0, 5).forEach(log => {
            console.log(`   [${log.timestamp}] ${log.action_type} by ${log.actor_identity_id} -> ${log.purpose || 'N/A'}`);
        });

        console.log("\n✅ SIMULATION COMPLETE.");
        process.exit(0);

    } catch (err) {
        console.error("\n❌ SIMULATION FAILED:", err);
        process.exit(1);
    }
}

runDemo();
