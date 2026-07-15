// Change this if your backend runs on a different host/port.
const API_BASE = "http://localhost:5000/api";

async function apiRequest(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    let data = {};
    try {
        data = await res.json();
    } catch (e) {
        // Non-JSON response (shouldn't normally happen)
    }

    if (!res.ok) {
        throw new Error(data.error || "Request failed");
    }
    return data;
}

// Ensures the user is logged in; redirects to login page if not.
// Returns the user object on success.
async function requireAuth() {
    try {
        const data = await apiRequest("/me");
        return data.user;
    } catch (e) {
        window.location.href = "index.html";
        return null;
    }
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = "block";
}
