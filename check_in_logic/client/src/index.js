/* -------------------------------------------------
 *  index.js  –  Front-end logic for Reconomy Time-Clock
 * ------------------------------------------------- */

/* ---------- Global constants / state ---------- */
import { baseUrl, adminUrl } from "./config.js";

/* DOM references – filled on DOMContentLoaded */
let adminLoginForm, userName, password;
let statusRadios, checkInForm;
let successPopup, successLabel, closePopupButton;
let alphabet, employeeSelect, btnFind, idInput;
let logEventIn, logEventOut, logEventComment;

/* Runtime state */
let pageNum = 1;
let alphabetQuery = "";
let selectedEmployeeId = null;

/* ---------- On page ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  /* Cache elements */
  statusRadios        = document.getElementsByName("status");
  checkInForm         = document.getElementById("check_in_form");
  successPopup        = document.getElementById("success_popup");
  successLabel        = document.getElementById("success_label");
  closePopupButton    = document.getElementById("close_popup");
  userName            = document.getElementById("input_username");
  password            = document.getElementById("input_password");
  btnFind             = document.getElementById("btn_find");
  adminLoginForm      = document.getElementById("admin_login_form");
  idInput             = document.getElementById("id_number");
  logEventIn          = document.getElementById("log_event_in");
  logEventOut         = document.getElementById("log_event_out");
  logEventComment     = document.getElementById("log_event_comment");
  employeeSelect      = document.getElementById("participant");
  alphabet            = document.getElementsByClassName("alphabet");

  /* Init employee dropdown with a default option */
  addLabelOption("employees");

  /* --- Event wiring --- */
  adminLoginForm.addEventListener("submit", logIn);
  checkInForm.addEventListener("submit", onCheckInSubmit);
  closePopupButton.addEventListener("click", () => (successPopup.style.display = "none"));
  btnFind.addEventListener("click", employeeById);
  Array.from(alphabet).forEach(el =>
    el.addEventListener("click", e => {
      console.log("Letter clicked:", e.currentTarget.innerText);
      alphabetQuery = e.currentTarget.innerHTML.trim();
      fetchByLastName(alphabetQuery);
    })
  );

  employeeSelect.addEventListener("change", (e) => {
    // Use string employee_id instead of numeric id
    selectedEmployeeId = e.target.value === "label" ? null : e.target.value;
    console.log("Selected Employee ID:", selectedEmployeeId);
  });
});

/* ---------- Admin login logic ---------- */
async function logIn(e) {
  e.preventDefault();
  console.log("@client logIn");

  const payload = {
    username: userName.value.trim(),
    password: password.value.trim()
  };

  if (!payload.username || !payload.password) {
    alert("Please fill in username and password.");
    return;
  }

  try {
    const res = await fetch(`${adminUrl}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("@client logIn data:", data);

    if (res.ok && data.user) {
      const adminUser = {
        id:       data.user.id,
        userName: data.user.user_name
      };
      alert(`Welcome, ${adminUser.userName}!`);
      window.location.href = "./admin.html";
    } else {
      alert(data.message || "Invalid username or password.");
    }
  } catch (err) {
    console.error("@client logIn error:", err);
    alert("Server error – please try again later.");
  }
}

/* ---------- Employee search helpers ---------- */
async function getEmployeeById(empId) {
  try {
    const res = await fetch(`${baseUrl}/id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Use employee_id key instead of id
      body: JSON.stringify({ employee_id: empId })
    });
    return await res.json();
  } catch (err) {
    console.error("getEmployeeById error:", err);
    return [];
  }
}

function loadEmployeesDropdown(list, showOptions) {
  // ✅ Guard: handle non-array results
  if (!Array.isArray(list)) {
    console.error("Expected an array but got:", list);
    alert("Unexpected response from server.");
    return;
  }

  employeeSelect.innerHTML = "";
  if (showOptions) addLabelOption("choose...");

  list.forEach(emp => {
    const opt = document.createElement("option");
    // Use employee_id string as value
    opt.value = emp.employee_id;
    opt.textContent = `${emp.first_name} ${emp.last_name}`;
    employeeSelect.appendChild(opt);
  });

  if (showOptions) addLabelOption("more...");

  // Auto-select if only one employee found
  if (list.length === 1) {
    employeeSelect.value = list[0].employee_id;
    selectedEmployeeId = list[0].employee_id;
    console.log("Auto-selected employee:", selectedEmployeeId);
  } else {
    selectedEmployeeId = null;
  }
}

function addLabelOption(txt) {
  const opt = document.createElement("option");
  opt.value = "label";
  opt.textContent = txt;
  opt.disabled = true;
  opt.selected = true;
  employeeSelect.appendChild(opt);
}

// Helper to fetch employees by letter (with optional pagination)
async function _fetchByLastName(url, body) {
  console.log("Sending request to:", url);
  console.log("Request body:", JSON.stringify(body));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      return [];
    }

    const data = await res.json();
    console.log("Response from _fetchByLastName:", data);
    return Array.isArray(data) ? data : data.employees || [];
  } catch (err) {
    console.error("_fetchByLastName error:", err);
    return [];
  }
}

// Fetch initial list of employees by last name first letter
async function fetchByLastName(letter) {
  console.log("Fetching employees by last name:", letter);
  pageNum = 1;

  const employees = await _fetchByLastName(`${baseUrl}/last_name`, {
    first_letter: letter
  });

  loadEmployeesDropdown(employees, true);
}

// Fetch the next page of employees by last name
async function fetchNextByLastName(letter) {
  const employees = await _fetchByLastName(`${baseUrl}/last_name/next`, {
    first_letter: letter,
    page_num: ++pageNum
  });

  loadEmployeesDropdown(employees, true);
}

/* ID search */
function employeeById() {
  const idVal = idInput.value.trim();
  if (!idVal) return;

    getEmployeeById(idVal).then(list => {
      if (list.length) {
        loadEmployeesDropdown(list, false);
        // Set selectedEmployeeId with employee_id string
        selectedEmployeeId = list[0].employee_id;
        employeeSelect.value = selectedEmployeeId;
        console.log("Selected Employee ID by ID search:", selectedEmployeeId);
      } else {
        alert("No employee found with that ID.");
        selectedEmployeeId = null;
      }
    });
  }


/* ---------- Check-in / Check-out ---------- */
async function onCheckInSubmit(e) {
  e.preventDefault();
  console.log("@checkInForm submit");

  if (!selectedEmployeeId) {
    alert("Please select or find an employee first.");
    return;
  }

  const eventType = logEventIn.checked ? 1 : logEventOut.checked ? 0 : null;
  if (eventType === null) {
    alert("Please choose Kom (Check-in) or Gick (Check-out).");
    return;
  }
  // will add if checked in === active, if checked out === inactive
  // Send employee_id as string, not numeric id
  const logEvent = {
    employee_id: selectedEmployeeId,
    event_type: eventType,
    date_time: new Date().toISOString().slice(0, 19).replace("T", " "),
    comment: logEventComment.value.trim(),
  };

  console.log("Submitting log event:", logEvent);

  try {
    const res = await fetch(
      `${adminUrl}/log_events/${eventType === 1 ? "in" : "out"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logEvent)
      }
    );

    if (!res.ok) throw new Error(`Request failed. Status: ${res.status}`);

    const data = await res.json();
    console.log("Log event saved:", data);

    if (data.insertId) {
      successLabel.textContent = eventType === 1
        ? "Du har checkat in"
        : "Du har checkat ut";
      successPopup.style.display = "flex";
      resetForm();
    } else {
      alert("Failed to log the event.");
    }
  } catch (err) {
    console.error("_postLogEvent error:", err);
    alert(`Server error – ${err.message || "please try again."}`);
  }
}

/* ---------- Helpers ---------- */
function resetForm() {
  employeeSelect.innerHTML = "";
  addLabelOption("employees");
  selectedEmployeeId = null;
  logEventIn.checked = logEventOut.checked = false;
  logEventComment.value = "";
  idInput.value = "";
}
