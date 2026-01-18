const db = require('./config/db');

async function populateHealthcare() {
    try {
        console.log("💉  Populating Rich Healthcare Data...");

        const CITIZEN_ID = '987654321012'; // Aarav Mehta

        const HEALTH_DATA = {
            last_verification_date: '2025-12-15',
            past_major_illnesses: "Dengue Fever (2019)",
            allergies: "Peanuts, Penicillin",
            current_medications: JSON.stringify([
                { name: "Albuterol Inhaler", dosage: "90mcg as needed", prescriber: "Dr. A. Patel" },
                { name: "Montelukast", dosage: "10mg Daily", prescriber: "Dr. A. Patel" }
            ]),
            clinical_height: "175 cm",
            clinical_weight: "70 kg",
            clinical_vitals_date: "2025-12-20",
            life_threatening_conditions: "Severe Anaphylaxis to Peanuts"
        };

        await db.query(`UPDATE users SET ? WHERE unique_id = ?`, [HEALTH_DATA, CITIZEN_ID]);

        console.log("✅ Data Populated for Aarav Mehta.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Population Failed:", err);
        process.exit(1);
    }
}

populateHealthcare();
