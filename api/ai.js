export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, type } = req.body;
    
    const KEYS = [
        "AIzaSyABTBMptobpZJtYIH8Td8GLlJ9E1Kf02Vo",
        "AIzaSyAI_4CQ6hUZd36x6AvYyHT6Z-nb2t4pyaw",
        "AIzaSyDzwIMYiobXxE2CUnzbZl0-vULlk8qa5fM",
        "AIzaSyAzZEkBhqPijdUsDksKRskVqfRTHoaPJuc"
    ];

    // Use the newest Key 4 as the main engine
    const activeKey = type === 'cv' ? KEYS[1] : KEYS[2];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`;

    try {
        console.log(`AI Request Type: ${type} using Key ending in ...${activeKey.slice(-4)}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Bridge Connection Error:", error);
        res.status(500).json({ error: 'The Bridge is active but cannot reach Google.' });
    }
}
