<script>
    const btn = document.getElementById('micBtn');
    const chat = document.getElementById('chat');
    let mediaRecorder;
    let audioChunks = [];

    btn.onclick = async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // استخدام تنسيق mp4 أو webm لأنه الأكثر توافقاً مع أندرويد
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                
                mediaRecorder.onstop = () => {
                    const blob = new Blob(audioChunks, { type: 'audio/mp4' });
                    const url = URL.createObjectURL(blob);
                    const div = document.createElement('div');
                    div.className = 'msg';
                    div.innerHTML = `<audio src="${url}" controls></audio>`;
                    chat.appendChild(div);
                    
                    // تصفير البيانات للمرة القادمة
                    audioChunks = [];
                    stream.getTracks().forEach(t => t.stop());
                };

                mediaRecorder.start();
                btn.classList.add('recording');
                btn.innerText = "🛑";
            } catch (e) { alert("تأكد من إذن الميكروفون"); }
        } else {
            mediaRecorder.stop();
            btn.classList.remove('recording');
            btn.innerText = "🎤";
            chat.scrollTop = chat.scrollHeight;
        }
    };
</script>
