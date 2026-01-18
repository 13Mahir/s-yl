
const BASE_URL = 'http://localhost:5001/api';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSecurityVerification() {
    console.log("🛡️  Starting SECURITY HARDENING Verification...");

    try {
        // --- 1. LOGOUT TEST ---
        console.log("\n1️⃣  Testing LOGOUT...");
        const CITIZEN_MOBILE = "9876543210";

        // Login
        const otpRes = await fetch(`${BASE_URL}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE }) });
        const otpCode = (await otpRes.json()).demo_otp;
        const loginRes = await fetch(`${BASE_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE, otp: otpCode }) });
        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error("Login Failed: " + loginData.message);
        const TOKEN = loginData.session_token;
        console.log("   Logged In. Token:", TOKEN.substring(0, 10) + "...");

        // Access Profile (Should Succeed)
        const profileRes1 = await fetch(`${BASE_URL}/auth/profile?unique_id=${CITIZEN_MOBILE}`, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
        if (profileRes1.status !== 200) throw new Error("Profile access failed before logout");
        console.log("   Access verified.");

        // Logout
        const logoutRes = await fetch(`${BASE_URL}/session/logout`, { method: 'POST', headers: { 'Authorization': `Bearer ${TOKEN}` } });
        console.log("   Logout Status:", logoutRes.status);

        // Access Profile (Should Fail)
        const profileRes2 = await fetch(`${BASE_URL}/auth/profile?unique_id=${CITIZEN_MOBILE}`, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
        if (profileRes2.status === 401) {
            console.log("✅ Logout Correctly Invalidated Session (401).");
        } else {
            console.error("❌ Logout Failed. Access Code:", profileRes2.status);
        }


        // --- 2. LAZY EXPIRY TEST ---
        console.log("\n2️⃣  Testing CONSENT LAZY EXPIRY...");
        // Need Service Provider Token
        const PROVIDER_ID = "ORG-HEALTH-01";
        const serv2faRes = await fetch(`${BASE_URL}/auth/send-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: PROVIDER_ID, actor_type: 'SERVICE' }) });
        const PROVIDER_CODE = (await serv2faRes.json()).demo_code;
        const servLoginRes = await fetch(`${BASE_URL}/auth/verify-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: PROVIDER_ID, code: PROVIDER_CODE }) });
        const PROVIDER_TOKEN = (await servLoginRes.json()).session_token;

        // Citizen Login Again
        const loginRes2 = await fetch(`${BASE_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE, otp: otpCode }) }); // Re-use otp/code if valid or new flow? 
        // Need new OTP usually, but for speed let's just make new one
        const otpRes2 = await fetch(`${BASE_URL}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE }) });
        const otpCode2 = (await otpRes2.json()).demo_otp;
        const loginRes3 = await fetch(`${BASE_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE, otp: otpCode2 }) });
        const loginData3 = await loginRes3.json();
        const CITIZEN_TOKEN2 = loginData3.session_token;
        const CITIZEN_ID2 = loginData3.user.unique_id;

        // Request Consent (Immediate Expiry)
        const consentRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PROVIDER_TOKEN}` },
            body: JSON.stringify({ citizen_identity_id: CITIZEN_ID2, purpose: "Expiry Test", requested_attributes: ["email"], duration_days: -1 })
        });
        const consentId = (await consentRes.json()).consent_id;

        // Approve with -1 days (Immediate Expiry)
        await fetch(`${BASE_URL}/consents/${consentId}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CITIZEN_TOKEN2}` }, body: JSON.stringify({ duration_days: -1 }) });
        console.log("   Consent Approved with -1 days (Expired). Checking enforcement...");

        // Access Data (Should Fail)
        const accessRes = await fetch(`${BASE_URL}/citizen/data?target_id=${CITIZEN_ID2}`, {
            headers: { 'Authorization': `Bearer ${PROVIDER_TOKEN}` }
        });

        if (accessRes.status === 403) {
            console.log("✅ Consent Correctly Expired (403).");
        } else {
            console.error(`❌ Expiry Check Failed. Status: ${accessRes.status}`);
        }


        // --- 3. RATE LIMITING TEST ---
        console.log("\n3️⃣  Testing RATE LIMITING...");
        let limitHit = false;
        const MAX_REQ = 110;
        console.log(`   Spamming ${MAX_REQ} requests...`);

        for (let i = 0; i < MAX_REQ; i++) {
            const res = await fetch(`${BASE_URL}/test-db`); // Public endpoint checks IP limit
            if (res.status === 429) {
                console.log(`✅ Rate Limit Hit at request #${i + 1} (Status 429).`);
                limitHit = true;
                break;
            }
        }

        if (!limitHit) console.warn("⚠️ Rate Limit NOT hit. Check configuration.");


        console.log("\n🎉 Security Verification Complete.");

    } catch (err) {
        console.error("\n❌ VERIFICATION FAILED:", err.message);
    }
}

runSecurityVerification();
