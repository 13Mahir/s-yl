const db = require('./config/db');

async function seedCitizen() {
    try {
        const mobile = '7383654894';

        // 1. Check if user exists, if not create basic
        const [rows] = await db.query("SELECT * FROM users WHERE unique_id = ?", [mobile]);

        if (rows.length === 0) {
            console.log("Creating user " + mobile);
            // Using dummy hash since bcryptjs is missing and we rely on OTP
            const hash = 'DUMMY_HASH_123';
            await db.query(`INSERT INTO users (unique_id, full_name, role, password_hash, status, created_at) VALUES (?, ?, 'Citizen', ?, 'active', NOW())`, [mobile, 'Mahir Shah', hash]);
        }

        // 2. Update with Full Vault Data
        const updateQuery = `
            UPDATE users SET 
                full_name = 'Mahir Shah',
                dob = '1998-05-15',
                gender = 'Male',
                address_city = 'Ahmedabad',
                address_state = 'Gujarat',
                
                health_id = 'ABHA-1234-5678',
                blood_group = 'O+',
                clinical_height = '5 ft 11 in',
                clinical_weight = '48 kg',
                known_conditions = 'Underweight (Clinically Observed)',
                life_threatening_conditions = 'Avoid legume-based medication supplements',
                allergies = 'Chickpea (Severe)',
                clinical_vitals_date = NOW(),
                
                agri_land_status = 'Not Applicable',
                agri_subsidy = 'None',
                agri_farm_activity = 'No active farming records',
                agri_soil_health = 'Not Issued',
                
                civic_address = 'A-31 Pruthvi Tower, Jodhpur Satellite, Ahmedabad – 380015',
                civic_zone = 'AMC West Zone',
                civic_utility_status = 'Active (Electricity & Water)'
            WHERE unique_id = ?
        `;

        await db.query(updateQuery, [mobile]);
        console.log("✅ User " + mobile + " populated with Identity Vault data.");
        process.exit();

    } catch (err) {
        console.error("❌ Failed:", err);
        process.exit(1);
    }
}
seedCitizen();
