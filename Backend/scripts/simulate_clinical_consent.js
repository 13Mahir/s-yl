
const BASE_URL = 'http://localhost:5001/api';
const db = require('./config/db');

// --- DATA ---
const HOSPITAL = {
    unique_id: "gov-gj-civil-hospital",
    role: "Service Provider"
};
const CITIZEN_ID = "987654321012";

async function runClinicalConsent() {
    console.log("\n==================================================");
    console.log("🏥  TESTING CLINICAL CONSENT REQUESTS");
    console.log("==================================================\n");

    try {
        // 1. HOSPITAL LOGIN
        const hosp2faInit = await fetch(`${BASE_URL}/auth/send-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: HOSPITAL.unique_id, actor_type: 'SERVICE' }) });
        const hospCode = (await hosp2faInit.json()).demo_code;
        const hospLogin = await fetch(`${BASE_URL}/auth/verify-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: HOSPITAL.unique_id, code: hospCode }) });
        const hospData = await hospLogin.json();
        if (!hospData.success) throw new Error("Hospital Login Failed: " + hospData.message);
        const TOKEN = hospData.session_token;
        console.log(`   ✅ Hospital Logged In.`);

        // 2. INVALID REQUEST (Wildcard)
        console.log("\n❌  TEST 1: INVALID REQUEST (Wildcard)");
        const invalidRes1 = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({
                citizen_identity_id: CITIZEN_ID,
                purpose: "Give me everything",
                requested_attributes: ["*"],
                duration_days: 1
            })
        });
        const invalidData1 = await invalidRes1.json();
        if (invalidRes1.status === 400) {
            console.log(`   ✅ Wildcard Rejected. Message: ${invalidData1.message}`);
        } else {
            console.error(`   ❌ Wildcard NOT Rejected! Status: ${invalidRes1.status}`);
        }

        // 3. INVALID REQUEST (Unknown Attribute)
        console.log("\n❌  TEST 2: INVALID REQUEST (Unknown Attribute)");
        const invalidRes2 = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({
                citizen_identity_id: CITIZEN_ID,
                purpose: "Sneaky access",
                requested_attributes: ["financial_records"],
                duration_days: 1
            })
        });
        const invalidData2 = await invalidRes2.json();
        if (invalidRes2.status === 400) {
            console.log(`   ✅ Unknown Attribute Rejected. Message: ${invalidData2.message}`);
        } else {
            console.error(`   ❌ Unknown Attribute NOT Rejected! Status: ${invalidRes2.status}`);
        }

        // 4. VALID CLINICAL REQUEST
        console.log("\n✅  TEST 3: VALID CLINICAL REQUEST");
        const VALID_ATTRS = ["allergies", "current_medications", "blood_group"];
        const validRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
            body: JSON.stringify({
                citizen_identity_id: CITIZEN_ID,
                purpose: "Emergency Treatment Verification",
                requested_attributes: VALID_ATTRS,
                duration_days: 1
            })
        });
        const validData = await validRes.json();
        if (validData.success) {
            console.log(`   ✅ Valid Request Accepted. ID: ${validData.consent_id}`);
        } else {
            console.error(`   ❌ Valid Request Failed! Message: ${validData.message}`);
        }

        console.log("\n🏁  TEST COMPLETE.");
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST FAILED:", err);
        process.exit(1);
    }
}

runClinicalConsent();
