require('dotenv').config();

async function testRawGeneration() {
    console.log("Testing Raw HTTP Generation for gemini-pro-latest...");
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello, are you there?" }]
                }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Success! Response:", JSON.stringify(data, null, 2));
        } else {
            console.error("Failed:", response.status, response.statusText);
            console.error("Error Body:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

testRawGeneration();
