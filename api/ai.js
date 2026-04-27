export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, type } = req.body;
    
    // 4-KEY ROTATION SYSTEM
    const KEYS = [
        "AIzaSyABTBMptobpZJtYIH8Td8GLlJ9E1Kf02Vo", // Key 1
        "AIzaSyAI_4CQ6hUZd36x6AvYyHT6Z-nb2t4pyaw", // Key 3 (CV)
        "AIzaSyDzwIMYiobXxE2CUnzbZl0-vULlk8qa5fM", // Key 4 (New)
        "AIzaSyAzZEkBhqPijdUsDksKRskVqfRTHoaPJuc"  // Key 2
    ];

    // Distribute load based on type
    let activeKey;
    if (type === 'cv') {
        activeKey = KEYS[1]; // Key 3 for CV
    } else {
        activeKey = KEYS[2]; // Key 4 for Chat (Newest & Strongest)
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${activeKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'AI Bridge Error' });
    }
}
