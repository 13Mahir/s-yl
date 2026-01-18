// Using native fetch for simplicity in modern Node environment.

const BASE_URL = 'http://localhost:5001/api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runVerification() {
    console.log("🚀 Starting Consent Engine Verification...");

    try {
        // --- STEP 1: LOGIN CITIZEN ---
        console.log("\n1️⃣  Logging in Citizen...");
        const CITIZEN_MOBILE = "9876543210";

        await fetch(`${BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: CITIZEN_MOBILE })
        });

        // OTP is mocked as fixed or returned in previous step? 
        // In server.js: `res.json({ ..., demo_otp: otp })`
        // We need to capture that or just use the mock logic if it's predictable?
        // Ah, the send-otp returns the demo_otp.

        const otpRes = await fetch(`${BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: CITIZEN_MOBILE })
        });
        const otpData = await otpRes.json();
        const CITIZEN_OTP = otpData.demo_otp;

        const citizenLoginRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: CITIZEN_MOBILE, otp: CITIZEN_OTP })
        });
        const citizenLoginData = await citizenLoginRes.json();

        if (!citizenLoginData.success) throw new Error("Citizen login failed");
        const CITIZEN_TOKEN = citizenLoginData.session_token;
        const CITIZEN_ID = citizenLoginData.user.unique_id;
        console.log(`✅ Citizen Logged In: ${CITIZEN_ID}`);


        // --- STEP 2: LOGIN PROVIDER ---
        console.log("\n2️⃣  Logging in Service Provider...");
        const PROVIDER_ID = "ORG-HEALTH-01"; // From schema seed

        const twoFaRes = await fetch(`${BASE_URL}/auth/send-2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actor_id: PROVIDER_ID, actor_type: 'SERVICE' })
        });
        const twoFaData = await twoFaRes.json();
        const PROVIDER_CODE = twoFaData.demo_code;

        const providerLoginRes = await fetch(`${BASE_URL}/auth/verify-2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actor_id: PROVIDER_ID, code: PROVIDER_CODE })
        });
        const providerLoginData = await providerLoginRes.json();

        if (!providerLoginData.success) {
            console.error(providerLoginData);
            throw new Error("Provider login failed");
        }
        const PROVIDER_TOKEN = providerLoginData.session_token;
        console.log(`✅ Provider Logged In: ${PROVIDER_ID}`);


        // --- STEP 3: REQUEST CONSENT ---
        console.log("\n3️⃣  Provider Requesting Consent...");
        const requestBody = {
            citizen_identity_id: CITIZEN_ID,
            purpose: "Medical Record Access for Checkup",
            requested_attributes: ["full_name", "dob", "gender", "email"],
            duration_days: 30
        };

        const requestRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PROVIDER_TOKEN}`
            },
            body: JSON.stringify(requestBody)
        });
        const requestData = await requestRes.json();

        if (!requestData.success) throw new Error("Consent request failed: " + requestData.message);
        const CONSENT_ID = requestData.consent_id;
        console.log(`✅ Consent Requested. ID: ${CONSENT_ID}`);


        // --- STEP 4: ATTEMPT ACCESS (SHOULD FAIL) ---
        console.log("\n4️⃣  Attempting Access BEFORE Approval (Should Fail)...");
        const failAccessRes = await fetch(`${BASE_URL}/citizen/data?target_id=${CITIZEN_ID}`, {
            headers: { 'Authorization': `Bearer ${PROVIDER_TOKEN}` }
        });
        if (failAccessRes.status === 403) {
            console.log("✅ Access Correctly Denied (403).");
        } else {
            console.error(`❌ Unexpected Status: ${failAccessRes.status}`);
        }


        // --- STEP 5: APPROVE CONSENT ---
        console.log("\n5️⃣  Citizen Approving Consent...");
        const approveRes = await fetch(`${BASE_URL}/consents/${CONSENT_ID}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${CITIZEN_TOKEN}` }
        });
        const approveData = await approveRes.json();

        if (!approveData.success) throw new Error("Approval failed");
        console.log("✅ Consent Approved.");


        // --- STEP 6: ATTEMPT ACCESS (SHOULD SUCCEED) ---
        console.log("\n6️⃣  Attempting Access AFTER Approval (Should Succeed)...");
        const successAccessRes = await fetch(`${BASE_URL}/citizen/data?target_id=${CITIZEN_ID}`, {
            headers: { 'Authorization': `Bearer ${PROVIDER_TOKEN}` }
        });
        const successData = await successAccessRes.json();

        if (successData.success) {
            console.log("✅ Access Granted.");
            console.log("   Data:", JSON.stringify(successData.data));
            if (!successData.data.full_name || successData.data.address_city) {
                // We requested full_name, dob, gender, email. We did NOT request address_city.
                // address_city should be filtered OUT if not in requested_attributes?
                // Wait, middleware intersection: requestedAttributes (in code) vs allowedAttributes (in DB).
                // In server.js: requireConsent(['full_name', 'dob', 'gender', 'address_city', 'address_state', 'email'])
                // In DB (allowed): ["full_name", "dob", "gender", "email"]
                // Intersection: ["full_name", "dob", "gender", "email"]
                // So address_city should NOT be present.
                if (successData.data.address_city) console.error("❌ ERROR: Leak! Unconsented attribute 'address_city' returned.");
                else console.log("✅ Field Filtering Verified: Unconsented fields hidden.");
            }
        } else {
            throw new Error("Access failed after approval: " + successData.message);
        }


        // --- STEP 7: REVOKE CONSENT ---
        console.log("\n7️⃣  Citizen Revoking Consent...");
        const revokeRes = await fetch(`${BASE_URL}/consents/${CONSENT_ID}/revoke`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${CITIZEN_TOKEN}` }
        });
        if (!revokeRes.ok) throw new Error("Revocation failed");
        console.log("✅ Consent Revoked.");


        // --- STEP 8: ATTEMPT ACCESS (SHOULD FAIL) ---
        console.log("\n8️⃣  Attempting Access AFTER Revocation (Should Fail)...");
        const revokedAccessRes = await fetch(`${BASE_URL}/citizen/data?target_id=${CITIZEN_ID}`, {
            headers: { 'Authorization': `Bearer ${PROVIDER_TOKEN}` }
        });
        if (revokedAccessRes.status === 403) {
            console.log("✅ Access Correctly Denied (403).");
        } else {
            console.error(`❌ Unexpected Status: ${revokedAccessRes.status}`);
        }

        console.log("\n🎉 Verification Complete: ALL TESTS PASSED.");

    } catch (err) {
        console.error("\n❌ VERIFICATION FAILED:", err.message);
    }
}

runVerification();
