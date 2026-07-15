document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("error").style.display = "none";

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        window.location.href = "dashboard.html";
    } catch (err) {
        showError("error", err.message);
    }
});
