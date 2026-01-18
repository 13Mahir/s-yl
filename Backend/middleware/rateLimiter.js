
const rateLimitMap = new Map();

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 1000; // Limit each IP/Identity to 1000 requests per window (Relaxed for Demo)

const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
        if (now > record.expiry) {
            rateLimitMap.delete(key);
        }
    }
}, WINDOW_MS); // Cleanup every window

const rateLimiter = (req, res, next) => {
    // Identify client: User ID if logged in, else IP
    let key = req.ip;
    if (req.user && req.user.unique_id) {
        key = req.user.unique_id;
    }

    const now = Date.now();

    if (!rateLimitMap.has(key)) {
        rateLimitMap.set(key, { count: 1, expiry: now + WINDOW_MS });
    } else {
        const record = rateLimitMap.get(key);

        if (now > record.expiry) {
            // Window expired, reset
            rateLimitMap.set(key, { count: 1, expiry: now + WINDOW_MS });
        } else {
            // Check limit
            if (record.count >= MAX_REQUESTS) {
                console.warn(`[SECURITY] Rate Limit Exceeded for ${key}`);
                return res.status(429).json({
                    success: false,
                    message: "Too many requests. Please try again later."
                });
            }
            record.count++;
        }
    }
    next();
};

module.exports = { rateLimiter };
