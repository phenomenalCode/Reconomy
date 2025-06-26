// adminEnhancements.js
import { adminUrl } from "./config.js";
import { adminLogout } from "./logout.js";

let currentLogEvents = [];
let currentEditingEmployeeId = null;

// Open/close modal helpers
const openModal = id => document.getElementById(id).style.display = "block";
const closeModal = id => document.getElementById(id).style.display = "none";

// Fetch and render log events for editing
async function fetchAndRenderLogEvents(employeeId) {
  try {
    const res = await fetch(`${adminUrl}/log_events/${employeeId}`);
    if (!res.ok) throw new Error("Failed to fetch log events");
    const events = await res.json();
    currentLogEvents = events;
    currentEditingEmployeeId = employeeId;
    renderLogEventsForEdit(events);
    openModal("editLogEventsModal");
  } catch (err) {
    console.error("Error fetching log events:", err);
    alert("Could not load log events for editing.");
  }
}

// Render editable log events UI
function renderLogEventsForEdit(events) {
  const container = document.getElementById("editLogEventsContainer");
  container.innerHTML = "";

  if (!events.length) {
    container.textContent = "No log events to edit.";
    return;
  }

  events.forEach((event, idx) => {
    const div = document.createElement("div");
    div.className = "log-event-edit";
    div.innerHTML = `
      <div><strong>Type:</strong> ${event.event_type === 1 ? "Check-in" : "Check-out"}</div>
      <div><strong>Time:</strong> ${new Date(event.date_time).toLocaleString()}</div>
      <label>
        Comment:
        <input type="text" data-index="${idx}" class="comment-input" value="${event.comment || ""}" />
      </label>
      <hr>
    `;
    container.appendChild(div);
  });
}

// Save edited comments to server
async function saveLogEventEdits() {
  const inputs = document.querySelectorAll("#editLogEventsContainer .comment-input");
  inputs.forEach(input => {
    const idx = input.dataset.index;
    currentLogEvents[idx].comment = input.value.trim();
  });

  try {
    for (const event of currentLogEvents) {
      await fetch(`${adminUrl}/log_events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: event.comment }),
      });
    }
    alert("Log events updated successfully.");
    closeModal("editLogEventsModal");
  } catch (err) {
    console.error("Error saving log event edits:", err);
    alert("Failed to save log event comments.");
  }
}

// Attach event listeners to update buttons in the employee table
function attachUpdateButtons() {
  const employeeTable = document.getElementById("employeeTableBody");
  if (!employeeTable) return;

  employeeTable.querySelectorAll(".updateButton").forEach(button => {
    button.onclick = async () => {
      const row = button.closest("tr");
      const employeeId = row?.children[0]?.textContent;
      if (!employeeId) return;
      await fetchAndRenderLogEvents(employeeId);
    };
  });
}

// ✅ CORRECT logout handler
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutButton");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    adminLogout();
  });
}

// Main init function to export and call from main script
export function initAdminEnhancements() {
  attachUpdateButtons();
  setupLogoutButton();

  const saveBtn = document.getElementById("saveLogEventsButton");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveLogEventEdits);
  }

  document.querySelectorAll(".modal .close").forEach(el =>
    el.addEventListener("click", () => closeModal(el.closest(".modal").id))
  );
}
