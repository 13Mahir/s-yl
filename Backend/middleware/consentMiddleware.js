const db = require('../config/db');

/**
 * Middleware to enforce consent-based access to citizen data.
 * @param {string[]} requestedAttributes - Array of attributes required by the endpoint.
 */
const requireConsent = (requestedAttributes) => {
    return async (req, res, next) => {
        try {
            const requester = req.user;

            // Allow access if the user is a Citizen accessing their own data
            // We expect target_id to be passed in query or body. 
            // For now, let's assume it's in query 'target_id' for GET requests.
            const targetIdentityId = req.query.target_id || req.body.target_id;

            if (!targetIdentityId) {
                return res.status(400).json({ success: false, message: "Target identity ID is required." });
            }

            // 1. Self-Access: Citizen accessing their own data
            if (requester.role === 'Citizen' && requester.unique_id === targetIdentityId) {
                req.allowedAttributes = requestedAttributes; // Grant full access (or whatever is requested)
                return next();
            }

            // 2. Third-Party Access: Service Provider or Gov
            // Must have ACTIVE consent
            // We check for 'active' status primarily. Then we check time. 
            // If time expired, we lazily update status to 'expired' and deny access.
            const [consents] = await db.query(
                `SELECT * FROM consents 
                 WHERE owner_identity_id = ? 
                 AND requester_identity_id = ? 
                 AND status = 'active'`,
                [targetIdentityId, requester.unique_id]
            );

            if (consents.length === 0) {
                console.warn(`[CONSENT] Access Denied: No active consent for ${requester.unique_id} to access ${targetIdentityId}`);
                return res.status(403).json({ success: false, message: "Access Denied: No active consent found." });
            }

            const activeConsent = consents[0];

            // Lazy Expiry Check
            const now = new Date();
            const validUntil = new Date(activeConsent.valid_until);

            if (now > validUntil) {
                // EXPIRED!
                console.warn(`[CONSENT] Access Denied: Consent expired on ${activeConsent.valid_until}. Marking as expired.`);

                // Update DB
                await db.query(`UPDATE consents SET status = 'expired' WHERE id = ?`, [activeConsent.id]);

                return res.status(403).json({ success: false, message: "Access Denied: Consent has expired." });
            }

            // const activeConsent = consents[0]; // REMOVED DUPLICATE
            const allowedAttributes = activeConsent.allowed_attributes; // JSON parsed automatically by mysql2 if configured, else parse it

            // Check if all requested attributes are in the allowed list
            // For rigorous security, we can either:
            // A) Reject if ANY requested attribute is missing (Strict)
            // B) Filter down to ONLY allowed attributes (Graceful)

            // The requirement says: "If no valid consent -> return 403". 
            // It also says "Strip all non-consented fields at backend level" in Part 5.
            // Let's implement intersection:

            const grantedAttributes = requestedAttributes.filter(attr => allowedAttributes.includes(attr));

            if (grantedAttributes.length === 0) {
                return res.status(403).json({ success: false, message: "Access Denied: None of the requested attributes are consented." });
            }

            // Attach the actually allowed attributes to the request for the route handler
            req.allowedAttributes = grantedAttributes;
            next();

        } catch (err) {
            console.error("Consent Middleware Error:", err);
            res.status(500).json({ success: false, message: "Internal Consent Enforcement Error" });
        }
    };
};

module.exports = { requireConsent };
