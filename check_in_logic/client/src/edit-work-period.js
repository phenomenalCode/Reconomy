import { baseUrl } from "./config.js";
import { closeModal } from "./modal.js"; // Only if not globally exposed

// Function to update employee start/end dates
function updateEmployeeDates(employeeId) {
  console.log("Updating employee with ID:", employeeId);

  const startDateInput = document.getElementById('updateStartDateInput');
  const endDateInput = document.getElementById('updateEndDateInput');
  const nameInput = document.getElementById('updateNamnInput');  // If you want to send first+last name update
  const locationInput = document.getElementById('updateWorkCommitmentInput'); // optional if needed

  if (!startDateInput || !endDateInput) {
    console.error("Missing input fields.");
    alert("Missing input fields.");
    return;
  }

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  const fullName = nameInput?.value || '';
  const locationName = locationInput?.value || '';

  if (!startDate) {
    alert("Start date is required.");
    return;
  }

  // Optional: parse full name into first and last if needed (or just send fullName if backend expects)
  let first_name = null, last_name = null;
  if (fullName) {
    const parts = fullName.trim().split(' ');
    first_name = parts.shift() || null;
    last_name = parts.join(' ') || null;
  }

  const payload = {
    start_date: startDate,
    end_date: endDate || null,
  };

  // Optionally include these if your backend supports updating these:
  if (first_name) payload.first_name = first_name;
  if (last_name) payload.last_name = last_name;
  if (locationName) payload.location_name = locationName;

  console.log("Sending payload:", payload);

  fetch(`${baseUrl}/${employeeId}`, {
    method: 'PUT',
  credentials: "include",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      console.log("Server responded with status:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response:", text);
        throw new Error(`Update failed: ${res.status} - ${text}`);
      }

      alert("Employee dates updated successfully.");
      closeModal("updateEmployeeModal");

      // Call loadEmployees globally if available to refresh UI
      if (typeof loadEmployees === "function") {
        console.log("Reloading employee table...");
        loadEmployees();
      }
    })
    .catch((err) => {
      console.error("Failed to update employee:", err);
      alert("Could not update employee.");
    });
}

// Attach event handler when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const updateBtn = document.getElementById("updateEmployeeSaveButton") 

  if (!updateBtn) {
    console.warn("Update save button not found in DOM.");
    return;
  }

  updateBtn.addEventListener("click", () => {
    const employeeId = updateBtn.dataset.employeeId;
    console.log("Clicked update button. Employee ID:", employeeId);

    if (!employeeId) {
      alert("Missing employee ID.");
      return;
    }

    updateEmployeeDates(employeeId);
  });
});
