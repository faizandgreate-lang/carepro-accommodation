/**
 * Care-Pro AI Chatbot - BULLETPROOF EDITION
 */
const CHAT_API_KEY = "AIzaSyABTBMptobpZJtYIH8Td8GLlJ9E1Kf02Vo";

// Wrap everything in an init function to ensure the DOM is ready
function initChat() {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChat = document.getElementById('send-chat');

    if (!chatBubble || !chatWindow) {
        console.error("Chat elements not found");
        return;
    }

    // Toggle Chat Window
    chatBubble.addEventListener('click', (e) => {
        e.preventDefault();
        chatWindow.classList.toggle('hidden');
        console.log("Chat toggled");
    });

    if (closeChat) {
        closeChat.addEventListener('click', () => {
            chatWindow.classList.add('hidden');
        });
    }

    const addMsg = (text, isBot) => {
        const div = document.createElement('div');
        div.className = `msg ${isBot ? 'bot' : 'user'}`;
        div.innerText = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const getAiResponse = async (text) => {
        const payload = { contents: [{ parts: [{ text: `System: You are Care-Pro AI Assistant.\nUser: ${text}` }] }] };
        const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CHAT_API_KEY}`;
        
        try {
            // Attempt 1: Direct Fetch (Best for Vercel)
            const res = await fetch(directUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            try {
                // Attempt 2: Proxy Fallback (Best for Desktop)
                const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(directUrl);
                const res = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                return data.candidates[0].content.parts[0].text;
            } catch (err) {
                return "I'm experiencing a high volume of requests. Please try again in a moment.";
            }
        }
    };

    const handleChat = async () => {
        const text = chatInput.value.trim();
        if (!text) return;
        
        addMsg(text, false);
        chatInput.value = '';
        
        addMsg("Care-Pro AI is thinking...", true);
        const response = await getAiResponse(text);
        
        // Update the last "thinking" message
        if (chatMessages.lastChild) {
            chatMessages.lastChild.innerText = response;
        }
    };

    if (sendChat) sendChat.addEventListener('click', handleChat);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });
}

// Start Chat on Load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
} else {
    initChat();
}
