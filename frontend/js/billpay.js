(async () => {
    const user = await renderNav();
    if (!user) return;

    const accountData = await apiRequest("/accounts");
    const billerData = await apiRequest("/billers");

    document.getElementById("accountSelect").innerHTML = accountData.accounts.map(a =>
        `<option value="${a.id}">${a.account_type} - ${a.account_number} (Rs. ${a.balance.toFixed(2)})</option>`
    ).join("");

    document.getElementById("billerSelect").innerHTML = billerData.billers.map(b =>
        `<option value="${b.id}">${b.name} (${b.category})</option>`
    ).join("");

    document.getElementById("billpayForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        document.getElementById("error").style.display = "none";

        try {
            await apiRequest("/billpay", {
                method: "POST",
                body: JSON.stringify({
                    account_id: document.getElementById("accountSelect").value,
                    biller_id: document.getElementById("billerSelect").value,
                    amount: document.getElementById("amount").value,
                }),
            });
            window.location.href = "dashboard.html";
        } catch (err) {
            showError("error", err.message);
        }
    });
})();
