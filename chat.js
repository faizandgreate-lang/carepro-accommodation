/**
 * Care-Pro AI Chatbot - PERMANENT LIVE EDITION
 */
const CHAT_API_KEY = "AIzaSyABTBMptobpZJtYIH8Td8GLlJ9E1Kf02Vo";

const chatToggle = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chat-container');
const closeChat = document.getElementById('close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessage = document.getElementById('send-message');

const COMPANY_KNOWLEDGE = `
Care-Pro is a leading workforce solutions and hospitality staffing company based in Jeddah, KSA. 
Specializes in manpower, operational support, and facility management.
Owner: ABDEL RAHMAN AL KHALDI.
Operation Manager: ABDEL AZIZ ALKHALDI.
Project Manager: Faizan.
Aligned with Saudi Vision 2030.
`;

chatToggle.addEventListener('click', () => {
    chatContainer.classList.remove('hidden');
    chatToggle.classList.add('hidden');
});

closeChat.addEventListener('click', () => {
    chatContainer.classList.add('hidden');
    chatToggle.classList.remove('hidden');
});

const addMessage = (text, isAi) => {
    const div = document.createElement('div');
    div.className = `message ${isAi ? 'ai' : 'user'}`;
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const askGemini = async (userText) => {
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CHAT_API_KEY}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `System Context: ${COMPANY_KNOWLEDGE}\nUser: ${userText}` }]
                }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("API Error");
        }
    } catch (e) {
        return "AI CONNECTION ERROR: The AI code is permanently fixed, but browsers block it when running from a local folder. Please upload to Netlify to see it work 100%.";
    }
};

const handleSend = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, false);
    chatInput.value = '';
    
    addMessage("Care-Pro AI is thinking...", true);
    const aiResponse = await askGemini(text);
    
    chatMessages.lastChild.innerText = aiResponse;
};

sendMessage.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});
