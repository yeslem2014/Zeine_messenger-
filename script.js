// ربط العناصر من صفحة الـ HTML
const messageInput = document.querySelector('input');
const sendBtn = document.querySelector('.fa-paper-plane');
const cameraBtn = document.querySelector('.fa-camera');
const voiceBtn = document.querySelector('.fa-microphone');

// 1. وظيفة إرسال رسالة نصية (تجريبية)
sendBtn.onclick = () => {
    const text = messageInput.value;
    if (text) {
        alert("تم إرسال رسالتك: " + text);
        messageInput.value = ""; // تنظيف الخانة بعد الإرسال
    } else {
        alert("يرجى كتابة رسالة أولاً");
    }
};

// 2. وظيفة فتح الكاميرا (طلب الإذن)
cameraBtn.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        alert("تم تفعيل الكاميرا بنجاح!");
        // سنقوم لاحقاً بإظهار الفيديو في مربع صغير
        stream.getTracks().forEach(track => track.stop()); // إغلاقها بعد الفحص
    } catch (err) {
        alert("خطأ: يرجى السماح للمتصفح بالوصول للكاميرا");
    }
};

// 3. وظيفة الميكروفون (طلب الإذن)
voiceBtn.onclick = async () => {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        alert("الميكروفون جاهز لتسجيل الصوت!");
    } catch (err) {
        alert("خطأ: يرجى السماح للمتصفح بالوصول للميكروفون");
    }
};
