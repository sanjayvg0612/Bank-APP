(async () => {
    const user = await renderNav();
    if (!user) return;

    document.getElementById("greeting").textContent = `Welcome, ${user.full_name.split(" ")[0]}`;

    const data = await apiRequest("/accounts");
    document.getElementById("totalBalance").textContent = `Rs. ${data.total_balance.toFixed(2)}`;

    const grid = document.getElementById("accountGrid");
    grid.innerHTML = data.accounts.map(a => `
        <a class="account-card" href="account.html?id=${a.id}">
            <span class="account-type">${a.account_type} account</span>
            <span class="account-number">${a.account_number}</span>
            <span class="account-balance">Rs. ${a.balance.toFixed(2)}</span>
        </a>
    `).join("");

    // Merge the most recent transactions across all accounts
    let allTxns = [];
    for (const account of data.accounts) {
        const t = await apiRequest(`/accounts/${account.id}/transactions?limit=5`);
        allTxns = allTxns.concat(t.transactions);
    }
    allTxns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    allTxns = allTxns.slice(0, 5);

    const tbody = document.getElementById("recentBody");
    if (allTxns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No transactions yet.</td></tr>`;
    } else {
        tbody.innerHTML = allTxns.map(t => `
            <tr>
                <td>${new Date(t.timestamp).toLocaleString()}</td>
                <td>${t.description}</td>
                <td class="${t.type}">${t.type}</td>
                <td class="${t.type}">${t.type === "credit" ? "+" : "-"}Rs. ${t.amount.toFixed(2)}</td>
            </tr>
        `).join("");
    }
})();
