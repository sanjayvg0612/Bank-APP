(async () => {
    const user = await renderNav();
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const days = params.get("days") || 30;

    document.getElementById("backLink").href = `account.html?id=${id}`;

    const data = await apiRequest(`/accounts/${id}/statement?days=${days}`);
    document.getElementById("statementTitle").textContent = `Statement · ${data.account.account_number}`;
    document.getElementById("daysSelect").value = days;
    document.getElementById("csvLink").href = `${API_BASE}/accounts/${id}/statement?days=${days}&format=csv`;

    document.getElementById("daysSelect").addEventListener("change", (e) => {
        window.location.href = `statement.html?id=${id}&days=${e.target.value}`;
    });

    const tbody = document.getElementById("stmtBody");
    if (data.transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No transactions in this period.</td></tr>`;
    } else {
        tbody.innerHTML = data.transactions.map(t => `
            <tr>
                <td>${new Date(t.timestamp).toLocaleString()}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td class="${t.type}">${t.type}</td>
                <td class="${t.type}">${t.type === "credit" ? "+" : "-"}Rs. ${t.amount.toFixed(2)}</td>
                <td>Rs. ${t.balance_after.toFixed(2)}</td>
            </tr>
        `).join("");
    }
})();
