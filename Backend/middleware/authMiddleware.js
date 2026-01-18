const db = require('../config/db');

// Middleware to verify session token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ success: false, message: "No session token provided." });
        }

        // 1. Check if token exists and is valid
        const [sessions] = await db.query(
            `SELECT s.*, u.full_name, u.unique_id, u.role as user_role, u.status 
             FROM sessions s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.token = ? AND s.expires_at > NOW()`,
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid or expired session.", code: "SESSION_EXPIRED" });
        }

        const session = sessions[0];

        // 1.5 Enforce Identity Suspension
        if (session.status !== 'active') {
            console.warn(`[SECURITY] Suspended Identity blocked: ${session.unique_id}`);
            return res.status(403).json({ success: false, message: "Identity Suspended. Contact Support." });
        }

        // 2. Attach User Identity to Request
        req.user = {
            id: session.user_id,
            unique_id: session.unique_id,
            displayName: session.full_name,
            role: session.user_role,
            token: session.token
        };

        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(500).json({ success: false, message: "Internal Authentication Error" });
    }
};

// Middleware to enforce role
const requireRole = (allowedRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

        if (!roles.includes(req.user.role)) {
            console.warn(`[SECURITY] Role blocked: User ${req.user.unique_id} (${req.user.role}) tried to access protected route (Required: ${roles.join(' or ')}).`);
            return res.status(403).json({ success: false, message: "Access Forbidden: Insufficient Permissions" });
        }

        next();
    };
};

module.exports = { authenticate, requireRole };
