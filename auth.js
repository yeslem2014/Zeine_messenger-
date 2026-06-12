// تسجيل الدخول المجهول + تسجيل uid في قاعدة البيانات
async function registerUidInFirebase(uid, isOwner, storedUser) {
    const ownerRef = firebase.database().ref('owners/' + uid);
    const userRef = firebase.database().ref('users/' + uid);
    const [ownerSnap, userSnap] = await Promise.all([ownerRef.once('value'), userRef.once('value')]);

    if (isOwner && !ownerSnap.exists()) {
        await ownerRef.set({ name: 'zeine', role: 'owner', isAdmin: true });
    } else if (!isOwner && !userSnap.exists() && storedUser && storedUser.name) {
        await userRef.set({
            name: storedUser.name,
            allowed_rooms: { [storedUser.room || 'general']: true }
        });
    }
}

window.registerUidInFirebase = registerUidInFirebase;