import { adminUrl } from "./config.js";

export async function adminLogout() {
  try {
    const response = await fetch(`${adminUrl}/admin/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Logout failed");
      } else {
        const text = await response.text();
        console.error("Logout returned non-JSON:", text);
        throw new Error("Logout failed: unexpected server response");
      }
    }

    window.location.href = "/check_in_logic/client/index.html"; // Use leading slash for absolute path

  } catch (err) {
    console.error("Logout error:", err.message);
    alert("Failed to log out. Please try again.");
  }
}

// Attach logout function
document.getElementById('open-logout-window')?.addEventListener('click', () => {
  adminLogout();
});
