import { baseUrl, adminUrl } from "./config.js";
import { calculateDailyHours } from "./calc.js";
import { initAdminEnhancements } from "./page-essentials.js";
import { openModal, closeModal, initModalHandlers } from './modal.js'; // just importing is enough

const searchFields = {
  first_name: document.getElementById("searchName"),
  employee_id: document.getElementById("searchID"),
  start_date: document.getElementById("searchStartDate"),
  end_date: document.getElementById("searchEndDate")
};

let currentPage = 1;
let totalPages = 1;

const pageSize = 44;
let currentEmployeeId = null;


// Make fetchEmployeeLogEvents global
window.fetchEmployeeLogEvents = function fetchEmployeeLogEvents(employeeId, employeeData = null) {
  fetch(`${adminUrl}/log_events/${employeeId}`)
    .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch log events"))
    .then(events => {
      renderEvents(events, employeeId);

      const dailyHours = calculateDailyHours(events);
      if (employeeData) {
        updateEmployeeHoursInTable(employeeData.employee_id, dailyHours);
      }
    })
    .catch(err => {
      console.error("Log fetch error:", err);
      alert("Could not load log events.");
    });
}

// Move renderPaginationControls to top-level scope
async function renderPaginationControls(totalPages, currentPage) {
  const container = document.getElementById("paginationControls");
  if (!container) {
    console.warn("Pagination container not found.");
    return;
  }

  container.innerHTML = "";
  console.log(`Rendering pagination: totalPages=${totalPages}, currentPage=${currentPage}`);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = async () => {
      console.log(`Pagination button clicked: page ${i}`);
      await loadEmployees(i); // Ensures employee data is fully loaded before updating UI
    };
    container.appendChild(btn);
  }
}function addRowToTable(emp) {
  const employeeTable = document.getElementById('employeeTableBody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${emp.employee_id}</td>
    <td>${emp.first_name} ${emp.last_name}</td>
    <td>${emp.location_name || '-'}</td>
    <td>${emp.start_date || '-'}</td>
    <td>${emp.end_date || '-'}</td>
    <td>—</td>
    <td>
      <button class="updateButton">Update</button>
      <button class="historyButton">Logged Events</button>
      <button class="deleteButton" style="background-color: red;">Delete</button>
    </td>
  `;

  // History button
  row.querySelector('.historyButton').onclick = () => {
    fetchEmployeeLogEvents(emp.employee_id, emp);
    document.getElementById("logEventHistory").textContent =
      `Log History for ${emp.first_name} ${emp.last_name} (ID: ${emp.employee_id})`;
  };

  // Update button
  row.querySelector('.updateButton').onclick = () => {
    currentEmployeeId = emp.employee_id;

    const nameInput = document.getElementById('updateNamnInput');
    const startDateInput = document.getElementById('updateStartDateInput');
    const endDateInput = document.getElementById('updateEndDateInput');
    const locationInput = document.getElementById('updateWorkCommitmentInput');
    const saveButton = document.getElementById('updateEmployeeSaveButton');

    if (!nameInput || !startDateInput || !endDateInput || !locationInput || !saveButton) {
      console.error("Missing update input elements.");
      return alert("Update form not properly loaded.");
    }

    nameInput.value = `${emp.first_name} ${emp.last_name}`;
    startDateInput.value = emp.start_date || '';
    endDateInput.value = emp.end_date || '';
    locationInput.value = emp.location_name || '';
    saveButton.dataset.employeeId = emp.employee_id;

    openModal('updateEmployeeModal');
  };

  // Delete button
  row.querySelector('.deleteButton').onclick = async () => {
    const confirmed = confirm(`Delete employee ${emp.first_name} ${emp.last_name} (ID: ${emp.employee_id})?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`${baseUrl}/${emp.employee_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete employee");

      alert("Employee deleted.");
      // Remove row immediately from the table:
      employeeTable.removeChild(row);

      // Optionally update pagination or reload employees if needed
      // await loadEmployees(currentPage);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete employee.");
    }
  };

  employeeTable.appendChild(row);
}



// function addEmployeeToRemoveList(emp) {
//   const employeeListToRemove = document.getElementById('employeeListToRemove');
//   const li = document.createElement('li');
//   li.innerHTML = `
//     <input type="radio" name="employee" value="${emp.employee_id}" />
//     <label>${emp.first_name} ${emp.last_name}</label>
//   `;
//   employeeListToRemove.appendChild(li);
// }

window.loadEmployees = async function (page = 1) {
  const employeeTable = document.getElementById('employeeTableBody');
  const employeeListToRemove = document.getElementById('employeeListToRemove');

  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", pageSize);

  if (searchFields) {
    for (const key in searchFields) {
      const value = searchFields[key]?.value?.trim();
      if (value) {
        console.log(`Adding search param: ${key} = "${value}"`);
        params.append(key, value);
      }
    }
  }

  const url = `${baseUrl}?${params.toString()}`;
  console.log("Fetching URL:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);

    const data = await response.json();
    employeeTable.innerHTML = "";
    employeeListToRemove.innerHTML = "";

    const employees = data.employees || data;
    // Deduplicate by first_name|last_name|start_date|end_date
    const uniqueEmployees = [...new Map(employees.map(emp => [
      `${emp.first_name}|${emp.last_name}|${emp.start_date}|${emp.end_date}`, emp
    ])).values()];

    const todayStr = new Date().toISOString().split('T')[0]; // e.g., "2025-06-12"

    uniqueEmployees.forEach(emp => {
      addRowToTable(emp);
    });

    // Pagination
    const totalEmployees = data.totalCount || employees.length;
    totalPages = Math.ceil(totalEmployees / pageSize); // ← updates the global one

    renderPaginationControls(totalPages, page);
    currentPage = page;

    // Fetch today's logs only for those with logs today
    await Promise.all(
      uniqueEmployees.map(async emp => {
        try {
          if (!emp.latest_log_date || !emp.latest_log_date.startsWith(todayStr)) return;

          const res = await fetch(`${adminUrl}/log_events/${emp.employee_id}`);
          if (!res.ok) throw new Error("Failed to fetch log events");

          const events = await res.json();
          const dailyHours = calculateDailyHours(events);
          updateEmployeeHoursInTable(emp.employee_id, dailyHours);
        } catch (err) {
          console.error(`Failed to fetch log events for employee ${emp.employee_id}`, err);
        }
      })
    );
  } catch (err) {
    console.error("Failed to load employees:", err);
    alert("Could not load employees.");
  }
};

function updateEmployeeHoursInTable(id, dailyHoursArray) {
  const employeeTable = document.getElementById("employeeTableBody");
  const rows = employeeTable.querySelectorAll("tr");
  const totalHours = dailyHoursArray.reduce((sum, day) => sum + day.hours, 0);

  for (const row of rows) {
    if (row.children[0].textContent === String(id)) {
      row.children[5].textContent = totalHours.toFixed(2);
      break;
    }
  }
}

function renderEvents(events, employeeId) {


  const container = document.getElementById("logEventsContainer");
  container.innerHTML = "";

  if (!events || events.length === 0) {
    container.textContent = "No log events found.";
    return;
  }

  // Sort and group as before
  events.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
  const grouped = events.reduce((acc, e) => {
    const dateKey = new Date(e.date_time).toISOString().split("T")[0];
    (acc[dateKey] = acc[dateKey] || []).push(e);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([date, dayEvents], dayIndex) => {
    const dayDiv = document.createElement("div");
    dayDiv.innerHTML = `<strong>Day ${dayIndex + 1} - ${date}</strong><br>`;
    container.appendChild(dayDiv);

    const checkIns = dayEvents.filter(e => e.event_type === 1);
    const checkOuts = dayEvents.filter(e => e.event_type === 0);

    const earliestCheckIn = checkIns.length
      ? checkIns.reduce((a, b) => new Date(a.date_time) < new Date(b.date_time) ? a : b)
      : null;
    const latestCheckOut = checkOuts.length
      ? checkOuts.reduce((a, b) => new Date(a.date_time) > new Date(b.date_time) ? a : b)
      : null;

    const summaryDiv = document.createElement("div");
    summaryDiv.style.marginBottom = "10px";
    summaryDiv.innerHTML = `
      ${earliestCheckIn ? `Earliest Check-in: ${new Date(earliestCheckIn.date_time).toLocaleTimeString()} (${earliestCheckIn.comment || '—'})<br>` : '<em>No Check-in</em><br>'}
      ${latestCheckOut ? `Latest Check-out: ${new Date(latestCheckOut.date_time).toLocaleTimeString()} (${latestCheckOut.comment || '—'})<br>` : '<em>No Check-out</em><br>'}
    `;
    container.appendChild(summaryDiv);

    dayEvents.forEach((e, index) => {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "15px";
      wrapper.innerHTML = `
        <strong>Event #${index + 1}</strong><br>
        <label>Type:
          <select data-event-id="${e.id || ''}" class="log-type">
            <option value="1" ${e.event_type === 1 ? "selected" : ""}>Check-in</option>
            <option value="0" ${e.event_type === 0 ? "selected" : ""}>Check-out</option>
          </select>
        </label><br>
        <label>Time:
          <input type="datetime-local" data-event-id="${e.id || ''}" class="log-time" value="${new Date(e.date_time).toISOString().slice(0, 16)}">
        </label><br>
        <label>Comment:
          <input type="text" data-event-id="${e.id || ''}" class="log-comment" value="${e.comment || ''}">
        </label>
        <hr>
      `;
      container.appendChild(wrapper);
    });
  });

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Changes";
  saveBtn.addEventListener("click", () => {
    if (employeeId) updateLogEvents(employeeId);
    else alert("Employee ID is missing; cannot save changes.");
  });
  container.appendChild(saveBtn);

  openModal("logHistoryModal");
}


function updateLogEvents(employeeId) {
  const types = document.querySelectorAll(".log-type");
  const times = document.querySelectorAll(".log-time");
  const comments = document.querySelectorAll(".log-comment");

  if (!types.length || !times.length || !comments.length) {
    alert("Missing event input elements.");
    return;
  }

  const updatedEvents = Array.from(types).map((select, i) => {
    const eventIdRaw = select.dataset.eventId;
    const eventId = Number.isFinite(+eventIdRaw) ? +eventIdRaw : null;

    const eventType = parseInt(select.value, 10);
    const dateTime = formatDateTime(times[i].value);
    const comment = (comments[i].value || "").slice(0, 45);
    const empId = parseInt(employeeId, 10);

    return {
      id: eventId,
      employee_id: empId,
      event_type: eventType,
      date_time: dateTime,
      comment
    };
  }).filter(event => event.id !== null && event.date_time !== "");

  console.log("Sending sanitized log events:", updatedEvents);

  fetch(`${adminUrl}/log_events/${employeeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: updatedEvents }),
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => {
          console.error("Server responded with error:", text);
          throw new Error(`Update failed: ${res.status} - ${text}`);
        });
      }
      alert("Log events updated.");
      fetchEmployeeLogEvents(employeeId);
    })
    .catch(err => {
      console.error("Log update failed", err);
      alert("Could not update log events.");
    });
}


function formatDateTime(input) {
  const date = new Date(input);
  return isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 19).replace("T", " ");
}


document.addEventListener('DOMContentLoaded', () => {
  // Initialize core features
  loadEmployees();
  initAdminEnhancements();
  initModalHandlers();

  // Register modal openers
  setupModalTriggers([
    { btnId: "openAddEmployee", modalId: "addEmployeeModal" },
    { btnId: "openUpdateEmployee", modalId: "updateEmployeeModal" },
  ]);

  setupAddEmployeeHandler();
});

function setupModalTriggers(triggerList) {
  triggerList.forEach(({ btnId, modalId }) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener("click", () => openModal(modalId));
    }
  });
}

function setupAddEmployeeHandler() {
  const addBtn = document.getElementById("addEmployeeButton");
  if (!addBtn) return;

  addBtn.addEventListener("click", async () => {
    const nameInput = document.getElementById("addNamnInput");
    const name = nameInput?.value?.trim();

    if (!name || !name.includes(" ")) {
      alert("Please enter full name (First Last)");
      return;
    }

    const [first_name, ...rest] = name.split(" ");
    const last_name = rest.join(" ");

    try {
      const res = await fetch(`${baseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name }),
      });

      if (!res.ok) throw new Error("Failed to create employee");

      nameInput.value = "";
      closeModal("addEmployeeModal");
      await loadEmployees(currentPage);
    } catch (err) {
      console.error("Add failed:", err);
      alert("Could not add employee.");
    }
  });
}
