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

    const activeKey = type === 'cv' ? KEYS[1] : KEYS[2];

    // UPDATED TO LATEST MODEL STRING
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${activeKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Bridge Connection Error. Please retry.' });
    }
}
