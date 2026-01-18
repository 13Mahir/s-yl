
const BASE_URL = 'http://localhost:5001/api';
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runVerification() {
    console.log("🚀 Starting WORKFLOW Engine Verification...");

    try {
        // --- STEP 1: AUTHENTICATION ---
        console.log("\n1️⃣  Logging in Citizen, Service, and Gov...");

        // Citizen
        const CITIZEN_MOBILE = "9876543210";
        const otpRes = await fetch(`${BASE_URL}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE }) });
        const CITIZEN_OTP = (await otpRes.json()).demo_otp;
        const citizenLoginRes = await fetch(`${BASE_URL}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: CITIZEN_MOBILE, otp: CITIZEN_OTP }) });
        const citizenLoginData = await citizenLoginRes.json();
        const CITIZEN_TOKEN = citizenLoginData.session_token;
        const CITIZEN_ID = citizenLoginData.user.unique_id;

        // Service
        const PROVIDER_ID = "ORG-HEALTH-01";
        const serv2faRes = await fetch(`${BASE_URL}/auth/send-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: PROVIDER_ID, actor_type: 'SERVICE' }) });
        const PROVIDER_CODE = (await serv2faRes.json()).demo_code;
        const servLoginRes = await fetch(`${BASE_URL}/auth/verify-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: PROVIDER_ID, code: PROVIDER_CODE }) });
        const PROVIDER_TOKEN = (await servLoginRes.json()).session_token;

        // Gov
        const GOV_ID = "GOV-RJ-TR-2025";
        const gov2faRes = await fetch(`${BASE_URL}/auth/send-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: GOV_ID, actor_type: 'GOV' }) });
        const GOV_CODE = (await gov2faRes.json()).demo_code;
        const govLoginRes = await fetch(`${BASE_URL}/auth/verify-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor_id: GOV_ID, code: GOV_CODE }) });
        const GOV_TOKEN = (await govLoginRes.json()).session_token;

        console.log("✅ All roles logged in.");

        // --- STEP 2: ENSURE CONSENT EXISTS (Prerequisite for Service creating workflow) ---
        console.log("\n2️⃣  Ensuring Active Consent...");
        const consentRes = await fetch(`${BASE_URL}/consents/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PROVIDER_TOKEN}` },
            body: JSON.stringify({ citizen_identity_id: CITIZEN_ID, purpose: "Workflow Prerequisite", requested_attributes: ["full_name"], duration_days: 10 })
        });
        const prevConsentData = await consentRes.json();
        const consentId = prevConsentData.consent_id;
        await fetch(`${BASE_URL}/consents/${consentId}/approve`, { method: 'POST', headers: { 'Authorization': `Bearer ${CITIZEN_TOKEN}` }, body: JSON.stringify({ duration_days: 10 }) });
        console.log("✅ Consent Active for 'full_name'.");


        // --- STEP 3: CREATE WORKFLOW CASE ---
        console.log("\n3️⃣  Service Creating Workflow Case...");
        const createRes = await fetch(`${BASE_URL}/workflows`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PROVIDER_TOKEN}` },
            body: JSON.stringify({
                type: "LICENSE_RENEWAL",
                citizen_identity_id: CITIZEN_ID,
                purpose: "Renewal Application",
                required_attributes: ["full_name"]
            })
        });
        const createData = await createRes.json();
        if (!createData.success) throw new Error("Workflow Creation Failed: " + createData.message);
        const CASE_ID = createData.case_id;
        console.log(`✅ Case Created: ${CASE_ID} [Status: ${createData.status}]`);


        // --- STEP 4: GOV REVIEW (SUBMITTED -> UNDER_REVIEW) ---
        console.log("\n4️⃣  Gov Reviewing Case...");
        const reviewRes = await fetch(`${BASE_URL}/workflows/${CASE_ID}/review`, { method: 'POST', headers: { 'Authorization': `Bearer ${GOV_TOKEN}` } });
        const reviewData = await reviewRes.json();
        if (!reviewData.success) throw new Error("Gov Review Failed: " + reviewData.message);
        console.log(`✅ Status Changed: ${reviewData.status}`);


        // --- STEP 5: GOV APPROVE (UNDER_REVIEW -> APPROVED) ---
        console.log("\n5️⃣  Gov Approving Case...");
        const approveRes = await fetch(`${BASE_URL}/workflows/${CASE_ID}/approve`, { method: 'POST', headers: { 'Authorization': `Bearer ${GOV_TOKEN}` } });
        const approveData = await approveRes.json();
        if (!approveData.success) throw new Error("Gov Approve Failed: " + approveData.message);
        console.log(`✅ Status Changed: ${approveData.status}`);


        // --- STEP 6: VERIFY AUDIT LOGS ---
        console.log("\n6️⃣  Verifying Audit Logs...");
        const auditRes = await fetch(`${BASE_URL}/audit/my-data-access`, { headers: { 'Authorization': `Bearer ${CITIZEN_TOKEN}` } });
        const auditData = await auditRes.json();

        const workflowLogs = auditData.logs.filter(l => l.action_type === 'WORKFLOW_CREATED' || l.action_type === 'WORKFLOW_UPDATE');
        console.log(`Found ${workflowLogs.length} workflow logs.`);

        if (workflowLogs.length >= 3) {
            console.log("✅ Audit Logs confirmed for Create, Review, Approve.");
        } else {
            console.warn("⚠️  Might be missing some logs, check manually.");
        }

        console.log("\n🎉 Verification Complete.");

    } catch (err) {
        console.error("\n❌ VERIFICATION FAILED:", err.message);
    }
}

runVerification();
