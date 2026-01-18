const { generateExplanation } = require('../services/aiService');
const db = require('../config/db');

// Simple In-Memory Cache
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 Minutes

const getCachedResponse = (key) => {
    if (responseCache.has(key)) {
        const { value, expiry } = responseCache.get(key);
        if (Date.now() < expiry) return value;
        responseCache.delete(key);
    }
    return null;
};

const setCachedResponse = (key, value) => {
    responseCache.set(key, { value, expiry: Date.now() + CACHE_TTL });
    // Cleanup old keys periodically could be added, but relying on Map size limit or restart for demo is fine.
    if (responseCache.size > 1000) responseCache.clear(); // Safety
};

const explainConsent = async (req, res) => {
    const { context, ...data } = req.body;
    let prompt = "";

    // Generate Cache Key
    const cacheKey = `explain:${JSON.stringify(req.body)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return res.json({ success: true, explanation: cached, cached: true });

    if (context === 'RISK_ANALYSIS') {
        const { stats, activity_log } = data;
        const recentLogs = activity_log ? activity_log.map(a => `- ${a.msg} (${a.time})`).join('\n') : "No recent activity.";

        prompt = `
You are a Governance AI Analyst.
Analyze the following dashboard stats and recent activity logs for anomalies or risks.

Stats:
- Pending Requests: ${stats.pendingRequests}
- Active Cases: ${stats.activeCases}

Recent Activity:
${recentLogs}

Constraints:
- Identify any potential security risks or bottlenecks.
- If everything looks normal, say "Operations appear normal."
- Be concise (max 3 bullets).
- Do not hallucinate.
`;
    } else {
        // Default: CONSENT_REQUEST
        const { requester_role, requester_name, domain, requested_attributes, purpose, duration_days } = data;
        prompt = `
You are an assistant explaining a data access request.
Explain clearly and neutrally what the request means to the data owner (Citizen).

Context:
- Requester: ${requester_name} (${requester_role})
- Domain: ${domain}
- Attributes: ${requested_attributes ? requested_attributes.join(', ') : 'None'}
- Purpose: ${purpose}
- Duration: ${duration_days} days

Constraints:
- Do NOT suggest approval or denial.
- Do NOT include legal advice.
- Do NOT speculate.
- Keep explanation under 80 words.
- Use calm, reassuring language.
- Start directly with the explanation.
`;
    }

    try {
        const explanation = await generateExplanation(prompt);
        setCachedResponse(cacheKey, explanation.trim());
        res.json({ success: true, explanation: explanation.trim() });
    } catch (error) {
        // Fallback for missing key or API error
        if (error.message === 'GEMINI_API_KEY_MISSING' || error.message?.includes('API_KEY_INVALID')) {
            return res.status(503).json({
                success: false,
                error: "AI_SERVICE_UNAVAILABLE",
                message: "Basic Mode: AI Key missing or invalid. Using heuristic fallback on client."
            });
        }
        res.status(500).json({ success: false, error: "AI_GENERATION_FAILED" });
    }
};


const analyzeMetadata = async (req, res) => {
    const { organization, domain, time_window, metrics } = req.body;

    const prompt = `
You are an AI system analyzing metadata from a consent-driven digital identity platform.
Analyze the following statistics and provide high-level observations.

Context:
- Organization: ${organization}
- Domain: ${domain}
- Time window: ${time_window}
- Metrics: ${JSON.stringify(metrics, null, 2)}

Rules:
- Do not label anything illegal
- Do not make accusations
- Do not suggest actions
- Highlight only observable patterns
- Keep output under 100 words
- Use neutral, professional language
`;

    try {
        const explanation = await generateExplanation(prompt);
        res.json({
            success: true,
            analysis: explanation.trim(),
            meta: { time_window, generated_at: new Date().toISOString() }
        });
    } catch (error) {
        if (error.message === 'GEMINI_API_KEY_MISSING' || error.message?.includes('API_KEY_INVALID')) {
            return res.status(503).json({
                success: false,
                error: "AI_SERVICE_UNAVAILABLE",
                message: "Basic Mode: AI Key missing or invalid."
            });
        }
        res.status(500).json({ success: false, error: "AI_ANALYSIS_FAILED" });
    }
};


const explainRisk = async (req, res) => {
    const { domain, time_window, risk_level, signals } = req.body;

    const prompt = `
You are an AI explaining a governance risk score for a consent-driven digital identity system.

Context:
- Domain: ${domain}
- Time window: ${time_window}
- Risk level: ${risk_level}
- Signals: ${signals.join(', ')}

Rules:
- Explain risk neutrally
- Do not accuse or assign blame
- Do not recommend enforcement
- Emphasize advisory nature
- Keep explanation under 80 words
- Professional tone
- Output plain text only
`;

    try {
        const explanation = await generateExplanation(prompt);
        res.json({
            success: true,
            explanation: explanation.trim(),
            meta: { generated_at: new Date().toISOString() }
        });
    } catch (error) {
        if (error.message === 'GEMINI_API_KEY_MISSING' || error.message?.includes('API_KEY_INVALID')) {
            return res.status(503).json({
                success: false,
                error: "AI_SERVICE_UNAVAILABLE",
                message: "Basic Mode: AI Key missing or invalid."
            });
        }
        res.status(500).json({ success: false, error: "AI_RISK_EXPLAIN_FAILED" });
    }
};

const chatWithAssistant = async (req, res) => {
    const { message } = req.body;
    const user = req.user; // Secure, authenticated user from middleware

    try {
        // 1. CONTEXT INJECTION (Server-Side)
        let systemContext = {
            role: user.role,
            jurisdiction: "IND-KA (Karnataka Healthcare)", // Dynamic if needed
            active_consents: 0,
            pending_requests: 0,
            risk_level: "Low", // Default
            recent_activity: []
        };

        // Fetch Real Data based on Role
        if (user.role === 'Government' || user.role === 'Regulatory Authority') {
            const [pending] = await db.query(`SELECT COUNT(*) as count FROM consents WHERE status = 'pending'`);
            const [active] = await db.query(`SELECT COUNT(*) as count FROM consents WHERE status = 'granted'`);
            systemContext.pending_requests = pending[0].count;
            systemContext.active_consents = active[0].count;

            // Risk Heuristic: If pending > 5, High Risk
            if (systemContext.pending_requests > 5) systemContext.risk_level = "High";
            else if (systemContext.pending_requests > 2) systemContext.risk_level = "Moderate";

        } else if (user.role === 'Service Provider') {
            const [active] = await db.query(`SELECT COUNT(*) as count FROM consents WHERE requester_identity_id = ? AND status = 'granted'`, [user.unique_id]);
            systemContext.active_consents = active[0].count;
        } else if (user.role === 'Citizen') {
            const [active] = await db.query(`SELECT COUNT(*) as count FROM consents WHERE owner_identity_id = ? AND status = 'granted'`, [user.unique_id]);
            systemContext.active_consents = active[0].count;
        }

        // 2. PROMPT ENGINEERING
        const prompt = `
You are the **TrustID Governance Assistant**, an AI specialized in the ${systemContext.jurisdiction} domain provided by the TrustID platform.
Your goal is to provide accurate, professional, and context-aware answers strictly related to Governance, Data Security, and the TrustID system.

USER CONTEXT:
- Role: ${systemContext.role}
- Identity: ${user.full_name || 'Authenticated Entity'}
- Jurisdiction: ${systemContext.jurisdiction}
- Active Data Channels: ${systemContext.active_consents}
- Pending Approvals: ${systemContext.pending_requests} (Gov only)
- Calculated Risk Level: ${systemContext.risk_level}

USER QUERY: "${message}"

GUIDELINES:
1. **Domain Focused**: You are an expert on TrustID, Data Privacy, and Governance. Do NOT answer questions about unrelated topics (e.g., sports, cooking, general world news). If asked, politely state you are focused on TrustID governance.
2. **Context-First**: Always prioritize the provided statistics and logs in your explanation.
3. **Tone**: Calm, professional, government-grade.
4. **Safety**: Do not hallucinate laws. Refer to "Digital Personal Data Protection Act (DPDP) 2023" for compliance.
5. **Intelligent Fallback**: If the exact answer isn't in the data, provide a general governance best-practice answer, but keep it relevant to the domain.

Respond directly to the user in under 300 words.
`;

        // 3. GENERATION
        const explanation = await generateExplanation(prompt);

        res.json({
            success: true,
            reply: explanation.trim(),
            meta: {
                generated_at: new Date().toISOString(),
                context_used: { role: systemContext.role, risk: systemContext.risk_level }
            }
        });

    } catch (error) {
        console.error("AI Chat Error:", error);

        // 4. ROBUST ERROR HANDLING (No User Blame)
        if (error.status === 429 || error.status === 503) {
            return res.json({
                success: true,
                reply: `[System Notice] The detailed governance analysis engine is currently under high load. However, I can confirm that your session is active and basic system operations are normal. Please check the 'Audit Logs' tab for specific event details.`
            });
        }

        res.status(500).json({ success: false, message: "Governance Assistant Temporarily Unavailable" });
    }
};

module.exports = { explainConsent, analyzeMetadata, explainRisk, chatWithAssistant };
