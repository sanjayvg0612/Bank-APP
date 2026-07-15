// Use the current origin by default so the app works on localhost, EC2, or a domain.
// If the API is served through a reverse proxy under the same host, this will work automatically.
const API_BASE = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? "http://localhost:5000/api"
    : "/api";

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
