(async () => {
    const user = await renderNav();
    if (!user) return;

    async function loadBeneficiaries() {
        try {
            const data = await apiRequest('/beneficiaries');
            const list = document.getElementById('benList');
            if (!data.beneficiaries || data.beneficiaries.length === 0) {
                list.innerHTML = '<p>No beneficiaries yet.</p>';
                return;
            }
            list.innerHTML = '<ul class="ben-list">' + data.beneficiaries.map(b => `
                <li>
                    <strong>${b.name}</strong> <small>${b.account_number}</small>
                    <button data-id="${b.id}" class="deleteBtn">Delete</button>
                </li>
            `).join('') + '</ul>';

            document.querySelectorAll('.deleteBtn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await apiRequest(`/beneficiaries/${id}`, { method: 'DELETE' });
                        loadBeneficiaries();
                    } catch (err) {
                        alert(err.message);
                    }
                });
            });
        } catch (err) {
            document.getElementById('benList').innerHTML = '<p class="error">Failed to load.</p>';
        }
    }

    document.getElementById('beneficiaryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('formError').style.display = 'none';
        const name = document.getElementById('benName').value;
        const account = document.getElementById('benAccount').value;
        const ifsc = document.getElementById('benIfsc').value;
        try {
            await apiRequest('/beneficiaries', {
                method: 'POST',
                body: JSON.stringify({ name, account_number: account, ifsc }),
            });
            document.getElementById('beneficiaryForm').reset();
            loadBeneficiaries();
        } catch (err) {
            const fe = document.getElementById('formError');
            fe.textContent = err.message;
            fe.style.display = 'block';
        }
    });

    loadBeneficiaries();
})();
