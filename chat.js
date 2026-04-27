/**
 * Care-Pro AI Chatbot - DETECTIVE EDITION
 */
function initChat() {
    const chatBubble = document.querySelector('.chat-bubble');
    const chatWindow = document.getElementById('chat-window');
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
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: `User says: ${text}`,
                    type: 'chat'
                })
            });

            if (res.status === 404) {
                return "ERROR: The 'api' folder was not found on Vercel. Please make sure you uploaded the 'api' folder.";
            }

            const data = await res.json();
            
            if (data.error) {
                return `API ERROR: ${data.error}`;
            }

            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            return "CONNECTION ERROR: I cannot reach the AI Bridge. Are you sure you are viewing the live Vercel URL?";
        }
    };

    const handleChat = async () => {
        const text = chatInput.value.trim();
        if (!text) return;
        addMsg(text, false);
        chatInput.value = '';
        addMsg("Care-Pro AI is thinking...", true);
        const response = await getAiResponse(text);
        chatMessages.lastChild.innerText = response;
    };

    if (sendChat) sendChat.onclick = handleChat;
    if (chatInput) chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleChat(); };
}

window.onload = initChat;
