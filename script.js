<script src="https://cdnjs.cloudflare.com/ajax/libs/RecordRTC/5.6.2/RecordRTC.js"></script>
<script>
    const btn = document.getElementById('micBtn');
    const chat = document.getElementById('chat');
    let recorder;

    btn.onclick = async () => {
        if (!recorder || recorder.getState() === "inactive") {
            try {
                // إجبار المتصفح على تفعيل نظام الصوت
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') { await audioCtx.resume(); }

                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: { 
                        echoCancellation: true, 
                        noiseSuppression: true 
                    } 
                });

                recorder = new RecordRTC(stream, {
                    type: 'audio',
                    mimeType: 'audio/wav',
                    recorderType: StereoAudioRecorder,
                    numberOfAudioChannels: 1,
                    desiredSampRate: 16000
                });

                recorder.startRecording();
                btn.classList.add('recording');
                btn.innerText = "🛑";
            } catch (e) {
                alert("تأكد من منح الإذن للميكروفون في المتصفح");
            }
        } else {
            recorder.stopRecording(() => {
                const blob = recorder.getBlob();
                const url = URL.createObjectURL(blob);
                const div = document.createElement('div');
                div.className = 'msg';
                div.innerHTML = `<audio src="${url}" controls preload="auto"></audio>`;
                chat.appendChild(div);
                
                // تحرير الميكروفون فوراً
                recorder.getInternalRecorder().stream.getTracks().forEach(t => t.stop());
                
                btn.classList.remove('recording');
                btn.innerText = "🎤";
                chat.scrollTop = chat.scrollHeight;
            });
        }
    };
</script>
