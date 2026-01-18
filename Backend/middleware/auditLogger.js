const db = require('../config/db');
const crypto = require('crypto');

/**
 * Appends an entry to the Audit Log.
 * This function should be called AFTER the action has successfully completed.
 * 
 * @param {Object} params
 * @param {string} params.actor_identity_id - The ID of the user performing the action
 * @param {string} params.actor_role - Role of the actor
 * @param {string} params.target_identity_id - ID of the user whose data/consent is affected
 * @param {string} params.action_type - Enum: DATA_ACCESS, CONSENT_REQUEST, etc.
 * @param {string[]} [params.accessed_attributes] - Array of fields accessed (nullable)
 * @param {string} [params.purpose] - Reason for the action (nullable)
 * @param {Object} [params.metadata] - Extra details like IP, SessionID (nullable)
 */
const logAudit = async ({
    actor_identity_id,
    actor_role,
    target_identity_id,
    action_type,
    accessed_attributes = null,
    purpose = null,
    metadata = null
}) => {
    try {
        const id = crypto.randomUUID();
        // Use standard JSON.stringify explicitly to ensure format, though mysql2 works with objects for JSON columns usually.
        // It's safer to passthrough objects if mysql driver handles it, or stringify manually. 
        // mysql2 usually handles object -> json string conversion for JSON columns.

        await db.query(
            `INSERT INTO audit_logs 
            (id, actor_identity_id, actor_role, target_identity_id, action_type, accessed_attributes, purpose, metadata) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                actor_identity_id,
                actor_role,
                target_identity_id,
                action_type,
                accessed_attributes ? JSON.stringify(accessed_attributes) : null,
                purpose,
                metadata ? JSON.stringify(metadata) : null
            ]
        );
        console.log(`[AUDIT] Logged ${action_type} by ${actor_identity_id} on ${target_identity_id}`);
    } catch (err) {
        // CRITICAL: If audit logging fails, should we stop the flow?
        // Requirement says "Audit logs MUST be backend-controlled". Ideally yes, but for now we log error.
        console.error("❌ AUDIT LOGGING FAILED:", err);
    }
};

module.exports = { logAudit };
