(async () => {
    const user = await renderNav();
    if (!user) return;

    const data = await apiRequest("/accounts");
    const select = document.getElementById("fromAccount");
    select.innerHTML = data.accounts.map(a =>
        `<option value="${a.id}">${a.account_type} - ${a.account_number} (Rs. ${a.balance.toFixed(2)})</option>`
    ).join("");

    // Load beneficiaries and populate select
    async function loadBeneficiaries() {
        try {
            const res = await apiRequest('/beneficiaries');
            const benSelect = document.getElementById('beneficiarySelect');
            benSelect.innerHTML = '<option value="">-- Select beneficiary --</option>' +
                res.beneficiaries.map(b => `<option value="${b.id}" data-account="${b.account_number}">${b.name} - ${b.account_number}</option>`).join('');

            benSelect.addEventListener('change', (e) => {
                const opt = e.target.selectedOptions[0];
                if (opt && opt.dataset && opt.dataset.account) {
                    document.getElementById('toAccount').value = opt.dataset.account;
                }
            });
        } catch (err) {
            // ignore if beneficiaries endpoint fails
        }
    }

    await loadBeneficiaries();

    document.getElementById("transferForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("error").style.display = "none";

        try {
            const beneficiaryId = document.getElementById('beneficiarySelect').value || null;
            const payload = {
                from_account: select.value,
                amount: document.getElementById("amount").value,
                description: document.getElementById("description").value,
            };
            if (beneficiaryId) payload.beneficiary_id = beneficiaryId;
            else payload.to_account_number = document.getElementById("toAccount").value;

            await apiRequest("/transfer", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            window.location.href = "dashboard.html";
        } catch (err) {
            showError("error", err.message);
        }
    });

    // Show QR code for receiving payments: generate QR with account info of the first account
    document.getElementById('showQrBtn').addEventListener('click', () => {
        const account = data.accounts[0];
        if (!account) return alert('No account available');
        const payload = `account_number:${account.account_number};ifsc:${account.ifsc};name:${user.full_name}`;

        // Show a simple modal
        let modal = document.getElementById('qrModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'qrModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-inner">
                    <button id="closeQr">Close</button>
                    <h3>Scan to pay ${user.full_name.split(' ')[0]}</h3>
                    <div id="qrcode"></div>
                </div>`;
            document.body.appendChild(modal);
            document.getElementById('closeQr').addEventListener('click', () => modal.remove());
        }
        // generate QR
        const qrEl = document.getElementById('qrcode');
        qrEl.innerHTML = '';
        // eslint-disable-next-line no-undef
        new QRCode(qrEl, { text: payload, width: 200, height: 200 });
    });

    // QR scan button to fill beneficiary account
    const scanBtn = document.createElement('button');
    scanBtn.type = 'button';
    scanBtn.className = 'btn-secondary';
    scanBtn.textContent = 'Scan QR to pay';
    document.getElementById('showQrBtn').insertAdjacentElement('afterend', scanBtn);
    scanBtn.addEventListener('click', () => {
        openScanner((dataStr) => {
            // parse payload if we encoded as account_number:...;ifsc:...;
            const m = dataStr.match(/account_number:([^;]+)/);
            if (m) document.getElementById('toAccount').value = m[1];
            else document.getElementById('toAccount').value = dataStr;
        });
    });
})();
