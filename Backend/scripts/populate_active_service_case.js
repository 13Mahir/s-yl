
const BASE_URL = 'http://localhost:5001/api';
const db = require('../config/db');

// --- DATA ---
const CITIZEN = {
    full_name: "Rajesh Kumar",
    unique_id: "7383654894", // The Demo User ID mentioned in context
    role: "Citizen",
    dob: "1985-08-20",
    gender: "Male",
    address_city: "Bengaluru",
    address_state: "Karnataka",
    health_id: "KA-HID-998212",
    blood_group: "B+",
    known_conditions: "Diabetes Type 2",
    emergency_contact: "+91-9876543210",
    city_id: "BLR-560001",
    insurance_policy_number: "PMJAY-KA-88219",
    password_hash: "hashed_secret"
};

const PROVIDER = {
    org_name: "Karnataka General Hospital",
    unique_id: "gov-ka-general-hospital",
    role: "Service Provider",
    email: "admin@kgh.bfuhs.ac.in",
    service_type: "Clinical Health Service"
};

async function runSimulation() {
    console.log("\n==================================================");
    console.log("🚀  POPULATING ACTIVE SERVICE CASE (LIVE SCENARIO)");
    console.log("==================================================\n");

    try {
        // 1. UPSERT USERS (Do not delete, just ensure they exist)
        console.log("🛠️  1. ENSURING ENTITIES EXIST...");

        // Upsert Citizen
        const [citExist] = await db.query(`SELECT * FROM users WHERE unique_id = ?`, [CITIZEN.unique_id]);
        if (citExist.length === 0) {
            await db.query(`INSERT INTO users SET ?`, CITIZEN);
            console.log(`   ✅ Created Citizen: ${CITIZEN.full_name}`);
        } else {
            console.log(`   ℹ️  Citizen exists: ${CITIZEN.full_name}`);
        }

        // Upsert Provider
        const [provExist] = await db.query(`SELECT * FROM users WHERE unique_id = ?`, [PROVIDER.unique_id]);
        if (provExist.length === 0) {
            await db.query(`INSERT INTO users (unique_id, role, full_name, email, password_hash) VALUES (?, ?, ?, ?, 'hashed')`,
                [PROVIDER.unique_id, PROVIDER.role, PROVIDER.org_name, PROVIDER.email]);
            console.log(`   ✅ Created Provider: ${PROVIDER.org_name}`);
        } else {
            console.log(`   ℹ️  Provider exists: ${PROVIDER.org_name}`);
        }

        // 2. LOGINS
        console.log("\n🔑  2. AUTHENTICATING...");

        // Login Provider
        const prov2faInit = await fetch(`${BASE_URL}/auth/send-2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actor_id: PROVIDER.unique_id, actor_type: 'SERVICE' })
        });
        const provCode = (await prov2faInit.json()).demo_code;
        const provLogin = await fetch(`${BASE_URL}/auth/verify-2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actor_id: PROVIDER.unique_id, code: provCode })
        });
        const provData = await provLogin.json();
        const provToken = provData.session_token;
        console.log(`   🏥 Provider Logged In (Token Acquired)`);

        // Login Citizen
        const citOtpInit = await fetch(`${BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: CITIZEN.unique_id })
        });
        const citOtp = (await citOtpInit.json()).demo_otp;
        const citLogin = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: CITIZEN.unique_id, otp: citOtp })
        });
        const citData = await citLogin.json();
        const citToken = citData.session_token;
        console.log(`   👤 Citizen Logged In (Token Acquired)`);

        // 3. CREATE & APPROVE REQUEST
        console.log("\n⚡  3. EXECUTING LIVE CONSENT TRANSACTION...");

        const SENSITIVE_REQUEST = {
            citizen_identity_id: CITIZEN.unique_id,
            service_type: "Emergency Trauma Care",
            purpose: "Immediate access to Blood Group & Allergies for Trauma Response",
            requested_attributes: ["full_name", "blood_group", "allergies", "current_medications", "emergency_contact"],
            duration_days: 1
        };

        const reqRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provToken}` },
            body: JSON.stringify(SENSITIVE_REQUEST)
        });
        const reqData = await reqRes.json();

        if (reqData.success) {
            console.log(`   ✅ Case Created: #${reqData.consent_id} [${SENSITIVE_REQUEST.purpose}]`);

            // Approve immediately
            const approveRes = await fetch(`${BASE_URL}/consents/${reqData.consent_id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${citToken}` },
                body: JSON.stringify({ duration_days: 1 })
            });
            const approveData = await approveRes.json();

            if (approveData.success) {
                console.log(`   ✅ Case Approved & Active (Live Data Channel Established)`);
            } else {
                console.error(`   ❌ Verification Failed: ${approveData.message}`);
            }

        } else {
            console.error(`   ❌ Request Creation Failed: ${reqData.message}`);
        }

        // 4. GENERATE A PENDING REQUEST (For "Case Management" Pending status)
        const PENDING_REQUEST = {
            citizen_identity_id: CITIZEN.unique_id,
            service_type: "Post-Discharge Monitoring",
            purpose: "Weekly vitals check for diabetes management",
            requested_attributes: ["full_name", "health_id", "address_city"],
            duration_days: 30
        };

        const penRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provToken}` },
            body: JSON.stringify(PENDING_REQUEST)
        });
        const penData = await penRes.json();
        if (penData.success) {
            console.log(`   ✅ Pending Case Created: #${penData.consent_id} (Requires User Action)`);
        }

        console.log("\n==================================================");
        console.log("🎉  SYSTEM STATE UPDATED");
        console.log("--------------------------------------------------");
        console.log(`👉 Login as Provider: ${PROVIDER.unique_id} (Code: Use Backdoor/Logs)`);
        console.log(`👉 Login as Citizen:  ${CITIZEN.unique_id}  (OTP: Use Backdoor/778899)`);
        console.log("==================================================\n");

        process.exit(0);

    } catch (err) {
        console.error("\n❌ SCRIPT ERROR:", err);
        process.exit(1);
    }
}

runSimulation();
