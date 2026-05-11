const peer = new Peer(); 
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const status = document.getElementById('status');

// عند فتح الصفحة، يعطيك المعرف الخاص بك
peer.on('open', (id) => {
    console.log('معرفك هو: ' + id);
});

// وظيفة إرسال الرسالة عند الضغط على السهم
sendBtn.onclick = () => {
    const msg = messageInput.value;
    if (msg) {
        const div = document.createElement('div');
        div.textContent = "أنا: " + msg;
        div.style.background = "#dcf8c6";
        div.style.padding = "8px";
        div.style.margin = "5px";
        div.style.borderRadius = "10px";
        div.style.alignSelf = "flex-end";
        messagesDiv.appendChild(div);
        messageInput.value = "";
    }
};

// تنبيه عند الضغط على الكاميرا أو الميكروفون (مؤقتاً)
document.querySelector('.fa-camera').onclick = () => alert("سيتم تفعيل الكاميرا قريباً");
document.querySelector('.fa-microphone').onclick = () => alert("سيتم تفعيل تسجيل الصوت قريباً");
