/**
 * Care-Pro AI Chatbot - FINAL STABLE VERSION
 */
const CHAT_API_KEY = "AIzaSyABTBMptobpZJtYIH8Td8GLlJ9E1Kf02Vo";

const COMPANY_KNOWLEDGE = "Care-Pro is a leading KSA workforce solutions provider specialized in hospitality and manpower. Founded by Abdel Rahman Al Khaldi.";

function initChat() {
    const chatBubble = document.querySelector('.chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.querySelector('.chat-header button');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');

    if (chatBubble) {
        chatBubble.onclick = () => chatWindow.classList.toggle('hidden');
    }

    const addMsg = (text, isBot) => {
        const div = document.createElement('div');
        div.className = `msg ${isBot ? 'bot' : 'user'}`;
        div.innerText = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const getAiResponse = async (text) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CHAT_API_KEY}`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `Context: ${COMPANY_KNOWLEDGE}\nUser: ${text}` }] }] })
            });
            const data = await res.json();
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            return "I am here to help. How can I assist you with Care-Pro workforce services?";
        }
    };

    const handleChat = async () => {
        const text = chatInput.value.trim();
        if (!text) return;
        addMsg(text, false);
        chatInput.value = '';
        addMsg("Thinking...", true);
        const response = await getAiResponse(text);
        chatMessages.lastChild.innerText = response;
    };

    if (sendChat) sendChat.onclick = handleChat;
    if (chatInput) chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleChat(); };
}

window.onload = initChat;
