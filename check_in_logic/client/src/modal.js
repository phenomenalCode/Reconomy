// src/modal-utils.js

export const openModal = (id) => {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "flex"; // use "flex" for centered modals
};

export const closeModal = (id) => {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
};

export function initModalHandlers() {
  // Automatically wire up all close buttons
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal?.id) closeModal(modal.id);
    });
  });

  // Optional: background click closes modal
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = "none";
    });
  });

  // Optional: ESC key closes all modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }
  });
}

// Optional: for updating employee
export function openUpdateModal(emp) {
  console.log("Opening update modal with employee:", emp);

  const startInput = document.getElementById('updateStartDateInput');
  const endInput = document.getElementById('updateEndDateInput');
  const saveBtn = document.getElementById('updateEmployeeSaveButton');

  if (!emp || !emp.employee_id) {
    console.error("Invalid employee data:", emp);
    return;
  }

  if (!startInput || !endInput || !saveBtn) {
    console.error("One or more update modal elements are missing.");
    return;
  }

  startInput.value = emp.start_date || "";
  endInput.value = emp.end_date || "";
  saveBtn.dataset.employeeId = emp.employee_id;

  openModal('updateEmployeeModal');
}
