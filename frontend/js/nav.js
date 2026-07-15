async function renderNav() {
    const user = await requireAuth();
    if (!user) return null;

    document.getElementById("navbar").innerHTML = `
        <div class="topbar">
            <div class="topbar-inner">
                <a class="brand" href="dashboard.html">SecureBank</a>
                <nav class="nav">
                    <a href="dashboard.html">Dashboard</a>
                    <a href="transfer.html">Transfer</a>
                    <a href="billpay.html">Pay bills</a>
                    <span class="nav-user">${user.full_name}</span>
                    <a href="#" id="logoutLink">Logout</a>
                </nav>
            </div>
        </div>`;

    document.getElementById("logoutLink").addEventListener("click", async (e) => {
        e.preventDefault();
        await apiRequest("/logout", { method: "POST" });
        window.location.href = "index.html";
    });

    return user;
}
