document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("error").style.display = "none";

    try {
        await apiRequest("/register", {
            method: "POST",
            body: JSON.stringify({
                full_name: document.getElementById("fullName").value,
                email: document.getElementById("email").value,
                username: document.getElementById("username").value,
                password: document.getElementById("password").value,
            }),
        });
        window.location.href = "dashboard.html";
    } catch (err) {
        showError("error", err.message);
    }
});
