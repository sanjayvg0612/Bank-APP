(async () => {
    const user = await renderNav();
    if (!user) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const data = await apiRequest(`/accounts/${id}`);
    const txnData = await apiRequest(`/accounts/${id}/transactions?limit=20`);

    document.getElementById("accountTitle").textContent =
        `${capitalize(data.account.account_type)} account · ${data.account.account_number}`;
    document.getElementById("accountBalance").textContent = `Rs. ${data.account.balance.toFixed(2)}`;
    document.getElementById("accountIfsc").textContent = `IFSC: ${data.account.ifsc}`;
    document.getElementById("statementLink").href = `statement.html?id=${id}`;

    const tbody = document.getElementById("txnBody");
    if (txnData.transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No transactions yet.</td></tr>`;
    } else {
        tbody.innerHTML = txnData.transactions.map(t => `
            <tr>
                <td>${new Date(t.timestamp).toLocaleString()}</td>
                <td>${t.description}</td>
                <td class="${t.type}">${t.type}</td>
                <td class="${t.type}">${t.type === "credit" ? "+" : "-"}Rs. ${t.amount.toFixed(2)}</td>
                <td>Rs. ${t.balance_after.toFixed(2)}</td>
            </tr>
        `).join("");
    }
})();

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
