(async () => {
    const user = await renderNav();
    if (!user) return;

    const data = await apiRequest("/accounts");
    const select = document.getElementById("fromAccount");
    select.innerHTML = data.accounts.map(a =>
        `<option value="${a.id}">${a.account_type} - ${a.account_number} (Rs. ${a.balance.toFixed(2)})</option>`
    ).join("");

    document.getElementById("transferForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("error").style.display = "none";

        try {
            await apiRequest("/transfer", {
                method: "POST",
                body: JSON.stringify({
                    from_account: select.value,
                    to_account_number: document.getElementById("toAccount").value,
                    amount: document.getElementById("amount").value,
                    description: document.getElementById("description").value,
                }),
            });
            window.location.href = "dashboard.html";
        } catch (err) {
            showError("error", err.message);
        }
    });
})();
