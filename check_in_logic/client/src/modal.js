// src/modal-utils.js

export const openModal = (id) => {
  const modal = document.getElementById(id);
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
};

export const closeModal = (id) => {
  const modal = document.getElementById(id);
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
};

export function initModalHandlers() {
  // Close modal when clicking on elements with class "close"
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal?.id) closeModal(modal.id);
    });
  });

  // Close modal on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal && modal.id) {
        closeModal(modal.id);
      }
    });
  });

  // Close any open modals on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal[aria-hidden="false"]').forEach(modal => {
        modal.setAttribute('aria-hidden', 'true');
      });
    }
  });
}

// Opens the update modal with pre-filled employee data
export function openUpdateModal(emp) {
  if (!emp || !emp.employee_id) {
    console.error("Invalid employee data:", emp);
    return;
  }

  const startInput = document.getElementById('updateStartDateInput');
  const endInput = document.getElementById('updateEndDateInput');
  const saveBtn = document.getElementById('updateEmployeeSaveButton');

  if (!startInput || !endInput || !saveBtn) {
    console.error("Missing modal input(s).");
    return;
  }

  startInput.value = emp.start_date || "";
  endInput.value = emp.end_date || "";
  saveBtn.dataset.employeeId = emp.employee_id;

  openModal('updateEmployeeModal');
}
