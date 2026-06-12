// ============= الإشعارات =============
window.playNotificationSound = function() {
    const sound = document.getElementById('notifSound');
    if (sound) { sound.currentTime = 0; sound.play().catch(() => {}); }
};

window.showBrowserNotification = function(roomName, sender, message) {
    if (!window.notificationPermission) return;
    new Notification('📢 Zeine Messenger', {
        body: `رسالة جديدة من ${sender} في غرفة ${roomName}: ${message.substring(0, 50)}`,
        tag: roomName
    });
};

window.updateUnreadBadge = function() {
    const popup = document.getElementById('roomsPopup');
    if (popup && popup.style.display === 'block') {
        document.querySelectorAll('.popup-item').forEach(item => {
            const roomId = item.getAttribute('data-room');
            if (roomId && window.unreadCounts?.[roomId] > 0) {
                let badge = item.querySelector('.unread-badge-small');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'unread-badge-small';
                    item.appendChild(badge);
                }
                badge.innerText = window.unreadCounts[roomId] > 99 ? '99+' : window.unreadCounts[roomId];
            }
        });
    }
};

// ============= تسجيل الصوت =============
let mediaRecorder, audioChunks = [], isRecording = false, recordingStream = null;
document.getElementById('micBtn').onclick = async function() {
    const btn = this;
    if (isRecording) {
        if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
        isRecording = false;
        btn.classList.remove('rec-active');
        if (recordingStream) { recordingStream.getTracks().forEach(t => t.stop()); recordingStream = null; }
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordingStream = stream;
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunks = [];
        mediaRecorder.ondataavailable = e => { if(e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = async () => {
            if (audioChunks.length === 0) return;
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            const audioUrl = await window.uploadAudio(audioBlob);
            if (audioUrl) window.sendToCurrentRoom({ body: audioUrl, time: Date.now(), sender: window.myName, type: 'audio' });
            audioChunks = [];
            if (recordingStream) { recordingStream.getTracks().forEach(t => t.stop()); recordingStream = null; }
        };
        mediaRecorder.start();
        isRecording = true;
        btn.classList.add('rec-active');
        setTimeout(() => {
            if (isRecording && mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                isRecording = false;
                btn.classList.remove('rec-active');
                if (recordingStream) { recordingStream.getTracks().forEach(t => t.stop()); recordingStream = null; }
            }
        }, 30000);
    } catch(err) { alert("تعذر الوصول للميكروفون"); if (recordingStream) { recordingStream.getTracks().forEach(t => t.stop()); recordingStream = null; } }
};

// ============= الحذف التلقائي للرسائل القديمة =============
window.autoClearOldMessages = function() {
    const lastClearKey = `last_clear_${window.currentRoom}`;
    const lastClear = localStorage.getItem(lastClearKey);
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    if (!lastClear || (now - parseInt(lastClear)) >= oneWeek) {
        const oneWeekAgo = now - oneWeek;
        window.db.child(window.currentRoom).once('value', (snap) => {
            const updates = {};
            let deleteCount = 0;
            snap.forEach(child => {
                const msg = child.val();
                if (msg.time && msg.time < oneWeekAgo) {
                    updates[child.key] = null;
                    deleteCount++;
                }
            });
            if (deleteCount > 0) {
                window.db.child(window.currentRoom).update(updates);
                console.log(`تم حذف ${deleteCount} رسالة قديمة`);
            }
        });
        localStorage.setItem(lastClearKey, now.toString());
    }
};

// ============= طلب الإذن للإشعارات =============
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then(perm => window.notificationPermission = (perm === 'granted'));
    } else if ('Notification' in window && Notification.permission === 'granted') {
        window.notificationPermission = true;
    }
}

// ============= دوال إضافية =============
window.makeVoiceCall = () => window.location.href = `tel:+22237454444`;
window.makeVideoCall = () => window.location.href = `tel:+22237454444`;

window.logout = function() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
};

// ============= تشغيل التطبيق =============
window.startApp = function() {
    requestNotificationPermission();
    window.initChat();
    window.autoClearOldMessages();
    
    // التحقق من صلاحيات المالك بعد تسجيل الدخول
    window.auth.onAuthStateChanged(async (user) => {
        const clearIcon = document.getElementById('clearIcon');
        const deleteButtons = document.querySelectorAll('.delete-btn');
        
        if (!user) return;
        
        try {
            const idTokenResult = await user.getIdTokenResult();
            const isOwnerFlag = idTokenResult.claims.role === 'owner';
            
            if (clearIcon) clearIcon.style.display = isOwnerFlag ? 'inline-block' : 'none';
            deleteButtons.forEach(btn => btn.style.display = isOwnerFlag ? 'inline-block' : 'none');
        } catch (error) {
            console.error("خطأ في جلب الصلاحيات:", error);
        }
    });
    
    // ربط الأحداث
    document.getElementById('clipBtn').onclick = (e) => {
        e.stopPropagation();
        const m = document.getElementById('attachMenu');
        m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
    };
    document.getElementById('msgInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') window.sendMsg(); });
};
