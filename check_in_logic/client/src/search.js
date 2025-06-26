import { baseUrl } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("[INFO] Document loaded");

  // Use the same pageSize and currentPage as admin page
  const pageSize = 44;
  let currentPage = 1;

const searchFields = {
  first_name: document.getElementById("searchName"),
  employee_id: document.getElementById("searchID"),
  start_date: document.getElementById("searchStartDate"),
  end_date: document.getElementById("searchEndDate")
};

  /**
   * Build query string for API request based on search fields and pagination.
   * This is used in loadEmployees(), but if needed here you can keep it.
   * We won't fetch here; will call loadEmployees() instead.
   * @param {number} page - Page number (default 1)
   * @returns {string} URL query string
   */
  function getQueryParams(page = 1) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("size", pageSize);

    // Use global searchFields defined in admin script
    for (const key in searchFields) {
      if (Object.prototype.hasOwnProperty.call(searchFields, key)) {
        const value = searchFields[key].value.trim();
        if (value) {
          console.log(`[DEBUG] Adding search param: ${key} = ${value}`);
          params.append(key, value);
        }
      }
    }

    const queryString = params.toString();
    console.log(`[DEBUG] Generated query params: ${queryString}`);
    return queryString;
  }

  /**
   * Render pagination buttons compatible with admin page loadEmployees function.
   * @param {number} totalPages
   * @param {number} currentPage
   */
  function renderPaginationUI(totalPages, currentPage) {
    const pagination = document.getElementById("paginationControls");
    if (!pagination) {
      console.warn("[WARN] Pagination container not found");
      return;
    }

    pagination.innerHTML = "";
    console.log(`[INFO] Rendering pagination UI: totalPages=${totalPages}, currentPage=${currentPage}`);

    const createButton = (text, disabled, onClick, isActive = false) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.disabled = disabled;
      if (isActive) btn.classList.add("active");
      btn.addEventListener("click", onClick);
      return btn;
    };

    // Previous button
    const prevBtn = createButton(
      "Previous",
      currentPage <= 1,
      () => {
        if (currentPage > 1) {
          currentPage--;
          console.log(`[INFO] Previous page clicked, new page: ${currentPage}`);
          window.loadEmployees(currentPage);  // Use admin's loadEmployees
        }
      }
    );
    pagination.appendChild(prevBtn);

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = createButton(
        i.toString(),
        false,
        () => {
          currentPage = i;
          console.log(`[INFO] Page button clicked: ${currentPage}`);
          window.loadEmployees(currentPage);  // Use admin's loadEmployees
        },
        i === currentPage
      );
      pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = createButton(
      "Next",
      currentPage >= totalPages,
      () => {
        if (currentPage < totalPages) {
          currentPage++;
          console.log(`[INFO] Next page clicked, new page: ${currentPage}`);
          window.loadEmployees(currentPage);  // Use admin's loadEmployees
        }
      }
    );
    pagination.appendChild(nextBtn);
  }

  /**
   * Hook up search inputs to reload employee list on input change.
   * This triggers loadEmployees with page 1.
   */
  Object.values(searchFields).forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        currentPage = 1;
        console.log(`[INFO] Search input changed, reloading page ${currentPage}`);
        window.loadEmployees(currentPage);
      });
    }
  });

  // Initial load
  window.loadEmployees(currentPage);
});
