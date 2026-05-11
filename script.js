function takeSnapshot() {
    const v = document.getElementById('video');
    const canvas = document.createElement('canvas');
    
    // ضبط أبعاد اللوحة لتطابق أبعاد الفيديو الحقيقية
    canvas.width = v.videoWidth; 
    canvas.height = v.videoHeight;
    
    // رسم الصورة من الفيديو
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    
    // تحويل الصورة لصيغة خفيفة للإرسال
    const imageData = canvas.toDataURL('image/jpeg', 0.5);
    const msg = { type: 'image', content: imageData };

    // التأكد من أن الاتصال مفتوح قبل الإرسال
    if (conn && conn.open) {
        conn.send(msg);
        display(msg, 'from-phone'); // عرضها في شاشة الهاتف أيضاً
        stopCamera(); // إغلاق الكاميرا بعد الإرسال بنجاح
    } else {
        alert("فشل الإرسال: الاتصال مقطوع. جاري إعادة الاتصال...");
        connect(); 
    }
}
