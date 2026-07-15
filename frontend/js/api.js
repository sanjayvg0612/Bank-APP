// Use a code-level proxy path by default so the frontend always sends requests
// to the same origin (`/api`) which the Node server or Nginx can proxy to Flask.
// If `window.API_BASE` is injected by the server, prefer that value.
const API_BASE = window.API_BASE || '/api';

async function apiRequest(path, options = {}) {
    try {
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
    } catch (error) {
        if (error instanceof TypeError || error.message === "Failed to fetch") {
            throw new Error("Backend is not reachable. Start the Python API server first.");
        }
        throw error;
    }
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
