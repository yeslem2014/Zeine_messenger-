// script.js - المسؤول عن بدء تشغيل التطبيق والتحقق من المستخدم

window.addEventListener('DOMContentLoaded', () => {
    // التأكد من تحميل Firebase أولاً
    if (!window.auth || !window.db) {
        console.error("Firebase not initialized yet!");
        return;
    }
    
    // تسجيل الدخول المجهول
    window.auth.signInAnonymously()
        .then(async (userCredential) => {
            const uid = userCredential.user.uid;
            const isOwner = localStorage.getItem('zeine_owner') === 'true';
            const storedUser = JSON.parse(localStorage.getItem('zeine_user') || '{}');
            
            // تأكد من وجود window.registerUidInFirebase
            if (typeof window.registerUidInFirebase !== 'function') {
                console.error("registerUidInFirebase not loaded!");
                return;
            }
            
            await window.registerUidInFirebase(uid, isOwner, storedUser);
            console.log("تم تسجيل الدخول المجهول و uid مسجل");
            
            // التحقق من الجلسة
            const isAuth = sessionStorage.getItem('zeine_auth') || localStorage.getItem('zeine_owner');
            if (!isAuth) {
                window.location.href = 'index.html';
                return;
            }
            
            // إعداد بيانات المستخدم
            const storedUserData = JSON.parse(localStorage.getItem('zeine_user') || '{}');
            const userRole = sessionStorage.getItem('zeine_role') || storedUserData.role;
            window.myName = storedUserData.name || localStorage.getItem('zeine_user_name') || 'zeine';
            window.currentRoom = (userRole === 'member' && storedUserData.room) ? storedUserData.room : 'general';
            window.userRole = userRole;
            window.unreadCounts = { general: 0, family: 0, friends: 0, private: 0 };
            
            // تحديث واجهة المالك
            if (userRole === 'owner' || localStorage.getItem('zeine_owner')) {
                const clearIcon = document.getElementById('clearIcon');
                if (clearIcon) clearIcon.style.display = 'inline-block';
            }
            
            // بدء التطبيق بعد التأكد من وجود window.startApp
            if (typeof window.startApp === 'function') {
                window.startApp();
            } else {
                console.error("startApp not loaded!");
            }
        })
        .catch((error) => {
            console.error("فشل تسجيل الدخول المجهول:", error);
            alert("حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت.\n" + error.message);
        });
});