// ============= دوال الدردشة الأساسية =============
window.formatMessage = function(msg) {
    if (msg.type === 'image') return `<img src="${msg.body}">`;
    if (msg.type === 'audio') return `<audio controls src="${msg.body}"></audio>`;
    if (msg.type === 'location') return `<a href="${msg.body}" target="_blank">📍 عرض الموقع</a>`;
    return msg.body;
};

window.addMessageToChat = function(msg, roomName) {
    if (roomName !== window.currentRoom) return;
    const chatDiv = document.getElementById('chat');
    const isMe = (msg.sender === window.myName && !msg.isOwner);
    const nameHtml = msg.isOwner ? '<span class="sender-name">zeine</span>' : (msg.sender !== window.myName ? `<span class="sender-name">${msg.sender}</span>` : '');
    const body = window.formatMessage(msg);
    const msgDiv = document.createElement('div');
    msgDiv.setAttribute('data-key', msg.key);
    msgDiv.className = `msg ${isMe ? 'me' : 'other'}`;
    msgDiv.innerHTML = `${nameHtml}<div>${body}</div><span class="t">${new Date(msg.time).toLocaleTimeString()}</span>${(window.userRole === 'owner' || localStorage.getItem('zeine_owner')) && !msg.isOwner ? `<button class="delete-btn" onclick="window.deleteMessage('${msg.key}')">✖</button>` : ''}`;
    chatDiv.appendChild(msgDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    
    if (msg.sender !== window.myName && window.unreadCounts && roomName !== window.currentRoom) {
        window.unreadCounts[roomName]++;
        window.playNotificationSound?.();
        window.showBrowserNotification?.(roomName, msg.sender, msg.body);
        window.updateUnreadBadge?.();
    }
};

window.initChat = function() {
    window.db.child(window.currentRoom).off();
    window.db.child(window.currentRoom).on('child_added', (snap) => {
        const msg = snap.val();
        msg.key = snap.key;
        window.addMessageToChat(msg, window.currentRoom);
    });
    window.db.child(window.currentRoom).on('child_removed', (snap) => {
        const msgElement = document.querySelector(`[data-key="${snap.key}"]`);
        if (msgElement) msgElement.remove();
    });
    window.db.child(window.currentRoom).once('value', (snap) => {
        const chatDiv = document.getElementById('chat');
        chatDiv.innerHTML = '';
        const msgs = [];
        snap.forEach(c => msgs.push({ key: c.key, ...c.val() }));
        msgs.sort((a,b) => a.time - b.time);
        msgs.forEach(msg => window.addMessageToChat(msg, window.currentRoom));
    });
};

window.sendToCurrentRoom = function(data) { window.db.child(window.currentRoom).push(data); };

window.sendMsg = function() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if (!text) return;
    window.sendToCurrentRoom({ body: text, time: Date.now(), sender: window.myName, type: 'text' });
    input.value = '';
};

window.deleteMessage = function(msgId) {
    if (confirm("🗑️ هل تريد حذف هذه الرسالة نهائياً؟")) {
        window.db.child(window.currentRoom).child(msgId).remove();
    }
};

window.clearAll = function() {
    if (confirm("🗑️ هل تريد حذف جميع رسائل هذه الغرفة نهائياً؟")) {
        window.db.child(window.currentRoom).set(null);
        document.getElementById('chat').innerHTML = '';
    }
};

window.exportChat = function() {
    const messages = [];
    window.db.child(window.currentRoom).once('value', (snap) => {
        snap.forEach(c => messages.push(c.val()));
        if (messages.length === 0) {
            alert("لا توجد رسائل لحفظها");
            return;
        }
        let content = `Zeine Messenger - محادثة ${window.currentRoom}\n`;
        content += `تاريخ التصدير: ${new Date().toLocaleString()}\n`;
        content += `عدد الرسائل: ${messages.length}\n`;
        content += "─".repeat(40) + "\n\n";
        messages.sort((a,b) => a.time - b.time);
        messages.forEach(msg => {
            content += `[${new Date(msg.time).toLocaleTimeString()}] ${msg.sender}: ${msg.body}\n`;
        });
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `chat_${window.currentRoom}_${new Date().toISOString().slice(0,10)}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
        alert("✅ تم حفظ المحادثة");
    });
};

window.switchRoom = function(roomId) {
    if (window.currentRoom === roomId) {
        document.getElementById('roomsPopup').style.display = 'none';
        return;
    }
    window.db.child(window.currentRoom).off();
    window.currentRoom = roomId;
    document.getElementById('roomsPopup').style.display = 'none';
    document.getElementById('chat').innerHTML = '';
    if (window.unreadCounts) window.unreadCounts[window.currentRoom] = 0;
    window.initChat();
};

window.toggleRoomsPopup = function() {
    if (window.userRole !== 'owner' && !localStorage.getItem('zeine_owner')) {
        alert("غير مسموح لك بفتح قائمة الغرف");
        return;
    }
    const popup = document.getElementById('roomsPopup');
    if (popup.style.display === 'block') {
        popup.style.display = 'none';
    } else {
        const ROOM_NAMES = { general: "الرئيسة العامة", family: "العائلة", friends: "الأصدقاء", private: "الغرفة الخاصة" };
        const ROOM_LIST = ["general", "family", "friends", "private"];
        popup.innerHTML = ROOM_LIST.map(roomId => `
            <div class="popup-item" data-room="${roomId}" onclick="window.switchRoom('${roomId}')">
                <i class="fas ${roomId === 'general' ? 'fa-globe' : roomId === 'family' ? 'fa-home' : roomId === 'friends' ? 'fa-users' : 'fa-lock'}"></i>
                <span>${ROOM_NAMES[roomId]}</span>
                ${window.unreadCounts?.[roomId] > 0 ? `<span class="unread-badge-small">${window.unreadCounts[roomId] > 99 ? '99+' : window.unreadCounts[roomId]}</span>` : ''}
            </div>
        `).join('');
        popup.style.display = 'block';
    }
};

window.toggleSettingsPopup = function() {
    alert(`👤 الحساب: ${window.myName}\n🔒 الخصوصية: مشفرة\n🌐 اللغة: العربية\n📱 الإصدار: 2.0`);
};