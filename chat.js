// chat.js - онлайн чат поддержки

let chatMessages = [];

function initChat() {
    const storedChat = localStorage.getItem('coolmaster_chat');
    if(storedChat) {
        chatMessages = JSON.parse(storedChat);
        renderChatMessages();
    }
}

function saveChat() {
    localStorage.setItem('coolmaster_chat', JSON.stringify(chatMessages));
    renderChatMessages();
}

function addChatMessage(sender, text, isUser = true) {
    const message = {
        id: Date.now(),
        sender: sender,
        text: text,
        time: new Date().toLocaleTimeString(),
        isUser: isUser
    };
    chatMessages.push(message);
    saveChat();
    
    // Автоответ бота
    if(isUser) {
        setTimeout(() => {
            let reply = "Спасибо за сообщение! Наш специалист свяжется с вами в ближайшее время.";
            if(text.toLowerCase().includes('цена') || text.toLowerCase().includes('стоимость')) {
                reply = "Стоимость услуг зависит от сложности. Диагностика - 500₽, чистка - от 1500₽, заправка - от 2000₽. Точную цену назовёт мастер после осмотра.";
            } else if(text.toLowerCase().includes('срочно')) {
                reply = "Срочный выезд возможен в течение 1-2 часов. Доплата 30% от стоимости работ.";
            } else if(text.toLowerCase().includes('гарантия')) {
                reply = "На все работы даём гарантию 1 год!";
            }
            addChatMessage("CoolMaster Бот", reply, false);
        }, 1000);
    }
}

function renderChatMessages() {
    const container = document.getElementById('chatMessages');
    if(!container) return;
    
    container.innerHTML = chatMessages.slice(-20).map(msg => `
        <div class="chat-message ${msg.isUser ? 'user' : 'bot'}">
            <strong>${msg.sender}:</strong> ${msg.text}
            <div class="chat-time">${msg.time}</div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

function toggleChat() {
    const widget = document.getElementById('chatWidget');
    const openBtn = document.getElementById('openChat');
    if(widget.style.display === 'none' || !widget.style.display) {
        widget.style.display = 'flex';
        openBtn.style.display = 'none';
    } else {
        widget.style.display = 'none';
        openBtn.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChat();
    
    const openBtn = document.getElementById('openChat');
    const closeBtn = document.getElementById('closeChat');
    const sendBtn = document.getElementById('sendChat');
    const chatInput = document.getElementById('chatInput');
    
    openBtn.onclick = () => toggleChat();
    closeBtn.onclick = () => toggleChat();
    
    sendBtn.onclick = () => {
        const text = chatInput.value.trim();
        if(text) {
            addChatMessage(currentUser ? currentUser.fullname : "Гость", text, true);
            chatInput.value = '';
        }
    };
    
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendBtn.click();
    });
});