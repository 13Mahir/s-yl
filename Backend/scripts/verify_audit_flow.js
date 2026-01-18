
// Using native fetch for simplicity in modern Node environment.

const BASE_URL = 'http://localhost:5001/api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runVerification() {
    console.log("🚀 Starting AUDIT Engine Verification...");

    try {
        // --- STEP 1: AUTHENTICATION (SHOULD LOG LOGIN? Wait, I didn't add login logs in server code block provided? I might have missed it in previous step replacing server.js. Let's check.)
        // Actually, looking at my replaces, I only replaced the Consent block. I might need to add LOGIN logs.
        // Let's assume I missed LOGIN logs and just test CONSENT first. If verification fails for LOGIN, I will fix.
        // Wait, the plan said "Log 'LOGIN' in verify-otp and verify-2fa".
        // I need to verify if I added those. I don't recall replacing the verify-otp function.
        // I will first run this test for CONSENT. If LOGIN logs are missing, I will add them in next step.

        console.log("\n1️⃣  Logging in Citizen...");
        const CITIZEN_MOBILE = "9876543210";
        const otpRes = await fetch(`${BASE_URL}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE }) });
        const otpData = await otpRes.json();
        const CITIZEN_OTP = otpData.demo_otp;
        const citizenLoginRes = await fetch(`${BASE_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE, otp: CITIZEN_OTP }) });
        const citizenLoginData = await citizenLoginRes.json();
        const CITIZEN_TOKEN = citizenLoginData.session_token;
        const CITIZEN_ID = citizenLoginData.user.unique_id;
        console.log(`✅ Citizen Logged In: ${CITIZEN_ID}`);

        console.log("\n2️⃣  Logging in Service Provider...");
        const PROVIDER_ID = "ORG-HEALTH-01";
        const twoFaRes = await fetch(`${BASE_URL}/auth/send-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: PROVIDER_ID, actor_type: 'SERVICE' }) });
        const twoFaData = await twoFaRes.json();
        const PROVIDER_CODE = twoFaData.demo_code;
        const providerLoginRes = await fetch(`${BASE_URL}/auth/verify-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: PROVIDER_ID, code: PROVIDER_CODE }) });
        const providerLoginData = await providerLoginRes.json();
        const PROVIDER_TOKEN = providerLoginData.session_token;
        console.log(`✅ Provider Logged In: ${PROVIDER_ID}`);


        // --- STEP 3: PERFORM CONSENT ACTIONS ---
        console.log("\n3️⃣  Provider Requesting Consent...");
        const requestBody = { citizen_identity_id: CITIZEN_ID, purpose: "Audit Test Access", requested_attributes: ["full_name"], duration_days: 1 };
        const requestRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PROVIDER_TOKEN}` },
            body: JSON.stringify(requestBody)
        });
        const requestData = await requestRes.json();
        const CONSENT_ID = requestData.consent_id;
        console.log(`✅ Consent Requested.`);

        console.log("\n4️⃣  Citizen Approving Consent...");
        await fetch(`${BASE_URL}/consents/${CONSENT_ID}/approve`, { method: 'POST', headers: { 'Authorization': `Bearer ${CITIZEN_TOKEN}` } });
        console.log("✅ Consent Approved.");

        console.log("\n5️⃣  Accessing Data...");
        await fetch(`${BASE_URL}/citizen/data?target_id=${CITIZEN_ID}`, { headers: { 'Authorization': `Bearer ${PROVIDER_TOKEN}` } });
        console.log("✅ Data Accessed.");

        console.log("\n6️⃣  Citizen Revoking Consent...");
        await fetch(`${BASE_URL}/consents/${CONSENT_ID}/revoke`, { method: 'POST', headers: { 'Authorization': `Bearer ${CITIZEN_TOKEN}` } });
        console.log("✅ Consent Revoked.");


        // --- STEP 4: VERIFY AUDIT LOGS ---
        console.log("\n🔎 Verifying Audit Logs via Transparency API...");

        // Check Citizen Access Log
        const citizenLogsRes = await fetch(`${BASE_URL}/audit/my-data-access`, { headers: { 'Authorization': `Bearer ${CITIZEN_TOKEN}` } });
        const citizenLogsData = await citizenLogsRes.json();

        if (!citizenLogsData.success || !citizenLogsData.logs) {
            console.error("❌ Failed to fetch logs:", citizenLogsData);
            throw new Error("Log fetch failed");
        }

        const logs = citizenLogsData.logs;

        console.log(`\nFound ${logs.length} logs for Citizen.`);

        // Expected Actions
        const requiredActions = ['CONSENT_REQUEST', 'CONSENT_APPROVED', 'DATA_ACCESS', 'CONSENT_REVOKED'];
        const foundActions = logs.map(l => l.action_type);

        console.log("Actions found:", foundActions);

        const allPresent = requiredActions.every(action => foundActions.includes(action));
        if (allPresent) {
            console.log("✅ All required Audit Actions found in Citizen Log.");
        } else {
            console.error("❌ Missing audit actions!");
        }

        // Verify Data Access Log Content
        const accessLog = logs.find(l => l.action_type === 'DATA_ACCESS');
        if (accessLog) {
            console.log("Access Log Details:", JSON.stringify(accessLog, null, 2));
            if (accessLog.actor_identity_id === PROVIDER_ID) console.log("✅ Correct Actor identified.");
            else console.error("❌ Incorrect Actor.");
        }

        console.log("\n🎉 Verification Complete.");

    } catch (err) {
        console.error("\n❌ VERIFICATION FAILED:", err.message);
    }
}

runVerification();
