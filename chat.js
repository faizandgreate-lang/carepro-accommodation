/**
 * Care-Pro AI Chatbot - VERCEL BRIDGE EDITION
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
            // Calling our secure Vercel Bridge
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: `You are Care-Pro AI. Help the user: ${text}`,
                    type: 'chat'
                })
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
        addMsg("Care-Pro AI is thinking...", true);
        const response = await getAiResponse(text);
        chatMessages.lastChild.innerText = response;
    };

    if (sendChat) sendChat.onclick = handleChat;
    if (chatInput) chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleChat(); };
}

window.onload = initChat;
