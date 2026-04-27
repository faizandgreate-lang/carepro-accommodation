export async function onRequestPost(context) {
    const { request } = context;
    const body = await request.json();
    const { prompt, type } = body;
    
    const KEYS = [
        "AIzaSyABTBMptobpZJtYIH8Td8GLlJ9E1Kf02Vo",
        "AIzaSyAI_4CQ6hUZd36x6AvYyHT6Z-nb2t4pyaw",
        "AIzaSyDzwIMYiobXxE2CUnzbZl0-vULlk8qa5fM",
        "AIzaSyAzZEkBhqPijdUsDksKRskVqfRTHoaPJuc"
    ];

    const activeKey = type === 'cv' ? KEYS[1] : KEYS[2];
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
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'AI Bridge Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
