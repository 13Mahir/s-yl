const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateExplanation = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY_MISSING");
    }

    try {
        console.log("Generating content with prompt:", prompt.substring(0, 100) + "...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.1, // Deterministic
            },
        });

        const response = await result.response;
        const text = response.text();
        console.log("Raw Gemini Response:", text);
        return text;
    } catch (error) {
        console.error("AI Service Error (Gemini):", error);
        throw error;
    }
};

module.exports = { generateExplanation };
