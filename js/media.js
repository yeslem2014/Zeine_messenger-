// ============= رفع الصور =============
window.uploadImage = async function(file) {
    if (!file) return null;
    const timestamp = Date.now();
    const fileName = `images/${window.currentRoom}/${timestamp}_${file.name}`;
    try {
        const snapshot = await window.storage.ref(fileName).put(file);
        return await snapshot.ref.getDownloadURL();
    } catch (error) { return null; }
};

window.handleImageUpload = async function(input) {
    if (input.files && input.files[0]) {
        const url = await window.uploadImage(input.files[0]);
        if (url) window.sendToCurrentRoom({ body: url, time: Date.now(), sender: window.myName, type: 'image' });
    }
    input.value = '';
};

// ============= رفع الصوت =============
window.uploadAudio = async function(blob) {
    const timestamp = Date.now();
    const fileName = `audios/${window.currentRoom}/${timestamp}.webm`;
    try {
        const snapshot = await window.storage.ref(fileName).put(blob);
        return await snapshot.ref.getDownloadURL();
    } catch (error) { return null; }
};

// ============= مشاركة الموقع =============
window.sendLocation = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
            const url = `https://www.google.com/maps/search/?api=1&query=${p.coords.latitude},${p.coords.longitude}`;
            window.sendToCurrentRoom({ body: url, time: Date.now(), sender: window.myName, type: 'location' });
            window.open(url, '_blank');
        }, () => alert("فشل تحديد الموقع"));
    } else { alert("المتصفح لا يدعم مشاركة الموقع"); }
    document.getElementById('attachMenu').style.display = 'none';
};

// ============= مشاركة الدردشة =============
window.shareChat = function() {
    if (navigator.share) {
        navigator.share({
            title: 'Zeine Messenger',
            text: 'انضم إلى دردشتي على Zeine Messenger',
            url: window.location.href
        }).catch(() => {});
    } else {
        alert("المتصفح لا يدعم المشاركة");
    }
    document.getElementById('attachMenu').style.display = 'none';
};

// ============= فتح الكاميرا والمعرض =============
window.openCamera = () => document.getElementById('cameraFile').click();
window.uploadImageFromGallery = () => document.getElementById('galleryFile').click();
