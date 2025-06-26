const pool = require('../db/db_mysql');

// Simple helper to run a query
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Apply optional filters and pagination.
 * @param {{first_name?:string, employee_id?:string, start_date?:string, end_date?:string, last_name?:string}} filters
 * @param {number} offset
 * @param {number} limit
 * @returns {Promise<{employees: Array, total: number}>}
 */
async function getFilteredEmployees(filters, offset, limit) {
  offset = Number(offset);
  limit = Number(limit);

  if (isNaN(offset) || isNaN(limit)) {
    throw new Error("Invalid offset or limit in getFilteredEmployees");
  }

  if (offset < 0) offset = 0;
  if (limit <= 0) limit = 10; // default page size

  const clauses = [];
  const params = [];

  if (filters.first_name) {
    clauses.push("first_name LIKE ?");
    params.push(`%${filters.first_name}%`);
  }
  if (filters.employee_id) {
    clauses.push("employee_id LIKE ?");
    params.push(`%${filters.employee_id}%`);
  }
  if (filters.start_date) {
    clauses.push("start_date >= ?");
    params.push(filters.start_date);
  }
  if (filters.end_date) {
    clauses.push("end_date <= ?");
    params.push(filters.end_date);
  }
  if (filters.last_name) {
    clauses.push("last_name LIKE ? COLLATE utf8mb4_general_ci");
    params.push(`${filters.last_name}%`);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  // 1) Get paginated rows with inline LIMIT
  const dataSql = `
    SELECT
      first_name,
      last_name,
      start_date,
      end_date,
      employee_id
    FROM employees
    ${whereSql}
    ORDER BY id
    LIMIT ${offset}, ${limit}
  `;
  const employees = await query(dataSql, params);

  // 2) Total count (no LIMIT/OFFSET)
  const countSql = `
    SELECT COUNT(*) AS total
    FROM employees
    ${whereSql}
  `;
  const countRows = await query(countSql, params);
  const total = countRows[0].total;

  return { employees, total };
}

/**
 * Simple unfiltered pagination helper.
 */
async function getEmployeesPaginated(offset, limit) {
  offset = Number(offset);
  limit = Number(limit);

  if (isNaN(offset) || isNaN(limit)) {
    throw new Error("Invalid offset or limit in getEmployeesPaginated");
  }
  if (offset < 0) offset = 0;
  if (limit <= 0) limit = 10;

  const sql = `
    SELECT
      first_name,
      last_name,
      start_date,
      end_date,
      employee_id
    FROM employees
    ORDER BY id
    LIMIT ${offset}, ${limit}
  `;
  return query(sql);
}

/**
 * Search employees by last name starting with a specific letter (case-insensitive).
 * @param {string} firstLetter
 */
async function getEmployeesByLastName(firstLetter) {
  if (!firstLetter || firstLetter.length !== 1) {
    throw new Error("Invalid firstLetter parameter for getEmployeesByLastName");
  }
  return query(
    `SELECT employee_id, first_name, last_name
     FROM employees
     WHERE last_name LIKE ? COLLATE utf8mb4_general_ci`,
    [`${firstLetter}%`]
  );
}

async function getEmployeeById(employee_id) {
  return query(
    `SELECT * FROM employees WHERE employee_id = ?`,
    [employee_id]
  );
}

async function createEmployee(employee) {
  const sql = `INSERT INTO employees SET ?`;
  const [result] = await pool.query(sql, employee);
  return result;
}

async function updateEmployee(employee_id, employee) {
  const sql = `UPDATE employees SET ? WHERE employee_id = ?`;
  const [result] = await pool.query(sql, [employee, employee_id]);
  return result;
}

async function deleteEmployee(employee_id) {
  const sql = `DELETE FROM employees WHERE employee_id = ?`;
  const [result] = await pool.query(sql, [employee_id]);
  return result;
}

module.exports = {
  getFilteredEmployees,
  getEmployeesPaginated,
  getEmployeesByLastName,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
