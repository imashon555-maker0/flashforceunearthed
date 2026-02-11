const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Language mapping
const LANGUAGE_MAP = {
    en: 'English',
    kk: 'Kazakh',
    ru: 'Russian'
};

// Fallback if API fails
const getMockFallback = (topic) => ({
    summary: `We couldn't generate content for "${topic}" at this moment. Please check your internet connection or try again later.`,
    flashcards: [
        { front: `What is the user trying to learn?`, back: topic },
    ],
    quiz: [
        {
            question: `Is the API Working?`,
            options: ["Yes", "No", "Maybe", "Loading"],
            answer: "No",
            explanation: "The connection to Gemini failed."
        }
    ]
});

export const generateContent = async (topic, language = 'en') => {
    if (!API_KEY) {
        console.error("Gemini API Key is missing!");
        return getMockFallback(topic);
    }

    const targetLanguage = LANGUAGE_MAP[language] || 'English';

    try {
        const prompt = `
            You are an expert tutor. Create a JSON object with educational content about the topic: "${topic}".
            
            IMPORTANT: All content (summary, flashcards, quiz questions, options, answers, explanations) MUST be written in ${targetLanguage}.
            
            The JSON must strictly follow this schema:
            {
                "summary": "A concise, engaging paragraph explaining the topic (approx 100 words) in ${targetLanguage}.",
                "flashcards": [
                    { "front": "Question or Term in ${targetLanguage}", "back": "Answer or Definition in ${targetLanguage}" }
                ],
                "quiz": [
                    {
                        "question": "A conceptual multiple-choice question in ${targetLanguage}",
                        "options": ["Option 1 in ${targetLanguage}", "Option 2 in ${targetLanguage}", "Option 3 in ${targetLanguage}", "Option 4 in ${targetLanguage}"],
                        "answer": "The exact string of the correct option in ${targetLanguage}",
                        "explanation": "Why this answer is correct, in ${targetLanguage}"
                    }
                ]
            }

            Requirements:
            - Create exactly 5 flashcards.
            - Create exactly 3 quiz questions.
            - ALL text content must be in ${targetLanguage}.
            - Return ONLY the raw JSON string. Do not wrap it in markdown code blocks (e.g., no \`\`\`json).
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) throw new Error("Gemini API Error");

        const result = await response.json();
        let text = result.candidates[0].content.parts[0].text;

        // Clean up markdown if present (despite prompt instruction, it often persists)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);
        return data;

    } catch (error) {
        console.error("Gemini Generation Failed:", error);
        return getMockFallback(topic);
    }
};

