// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCaUC9ihg9rwmvILYxnYYC9dUYjhD7b4Ww",
    authDomain: "mymessenger-4124d.firebaseapp.com",
    databaseURL: "https://mymessenger-4124d-default-rtdb.firebaseio.com/",
    projectId: "mymessenger-4124d",
    storageBucket: "mymessenger-4124d.firebasestorage.app"
};

// تهيئة Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

// ربط المتغيرات بـ window لاستخدامها في الملفات الأخرى
window.auth = firebase.auth();
window.db = firebase.database().ref('final_perfect_v12');
window.storage = firebase.storage();