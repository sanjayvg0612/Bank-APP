async function openScanner(onResult) {
    // create modal
    let modal = document.getElementById('scanModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'scanModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-inner">
                <button id="closeScan">Close</button>
                <h3>Scan QR</h3>
                <video id="qrVideo" autoplay playsinline width="300" height="300"></video>
                <canvas id="qrCanvas" style="display:none"></canvas>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('closeScan').addEventListener('click', () => stopScanner());
    }

    const video = document.getElementById('qrVideo');
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    let stream = null;
    let rafId = null;

    async function start() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            await video.play();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            tick();
        } catch (err) {
            alert('Camera access denied or not available.');
            stopScanner();
        }
    }

    function tick() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            try {
                // eslint-disable-next-line no-undef
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    stopScanner();
                    onResult(code.data);
                    return;
                }
            } catch (e) {}
        }
        rafId = requestAnimationFrame(tick);
    }

    function stopScanner() {
        if (rafId) cancelAnimationFrame(rafId);
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        const m = document.getElementById('scanModal');
        if (m) m.remove();
    }

    await start();
}
