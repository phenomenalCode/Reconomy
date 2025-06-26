const employeeDb = require('../models/employee_model')
// server/controllers/employee_controller.js

const handleError = (res, err, context) => {
  console.error(`${context} error:`, err);
  res.status(500).json({ error: `Failed to ${context.toLowerCase()}` });
};


/**
 * GET /api/employees
 * Query params: page, size, first_name, employee_id, start_date, end_date
 */
exports.getAllEmployees = async (req, res) => {
  const {
    page = 1,
    size = 10,
    first_name,
    employee_id,
    start_date,
    end_date
  } = req.query;

  const pageInt = parseInt(page, 10);
  const sizeInt = parseInt(size, 10);
  const offset = (pageInt - 1) * sizeInt;

  try {
    const filters = { first_name, employee_id, start_date, end_date };

    // Fetch paginated & filtered employees from DB
    const { employees, total } = await employeeDb.getFilteredEmployees(filters, offset, sizeInt);

    // Return data expected by frontend
    res.json({
      employees,
      totalCount: total,
      currentPage: pageInt
    });
  } catch (err) {
    handleError(res, err, "getAllEmployees");
  }
};


exports.getEmployeesByLastName = async (req, res) => {
  try {
    console.log("@getEmployeesByLastName");
    const { first_letter } = req.body;
    console.log(`employeeController.getEmployeesByLastName request url:${req.url}, request body: ${JSON.stringify(req.body)}`);
    console.log(`employeeController.getEmployeesByLastName data.first_letter:  ${first_letter}`);

    if (!first_letter || first_letter.length !== 1) {
      return res.status(400).json({ error: "Invalid first_letter parameter" });
    }

    const employees = await employeeDb.getEmployeesByLastName(first_letter);
    console.log("@getEmployeesByLastName returning json");
    res.json(employees);
  } catch (err) {
    handleError(res, err, "getEmployeesByLastName");
  }
};

exports.getNextEmployeesByLastName = async (req, res) => {
  try {
    console.log("@getNextEmployeesByLastName");
    const { first_letter, page_num } = req.body;
    console.log(`request url:${req.url}, request body: ${JSON.stringify(req.body)}`);
    
    if (!first_letter || first_letter.length !== 1 || !page_num || isNaN(page_num)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const employees = await employeeDb.getNextEmployeesByLastName(first_letter, Number(page_num));
    console.log("@getNextEmployeesByLastName returning json");
    res.json(employees);
  } catch (err) {
    handleError(res, err, "getNextEmployeesByLastName");
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    console.log("@getEmployeeById");
    const { employee_id } = req.body;
    console.log(`@getEmployeeById data.employee_id: ${employee_id}`);

    if (!employee_id) {
      return res.status(400).json({ error: "Missing employee_id" });
    }

    const employee = await employeeDb.getEmployeeById(employee_id);
    console.log("@getEmployeeById returning json");
    res.json(employee);
  } catch (err) {
    handleError(res, err, "getEmployeeById");
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const newEmployee = req.body;
    const result = await employeeDb.createEmployee(newEmployee);
    res.json({ message: 'Employee created successfully', result });
  } catch (err) {
    handleError(res, err, "createEmployee");
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const updatedEmployee = req.body;
    const employeeId = req.params.id;
    const result = await employeeDb.updateEmployee(employeeId, updatedEmployee);
    res.json({ message: 'Employee updated successfully', result });
  } catch (err) {
    handleError(res, err, "updateEmployee");
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const result = await employeeDb.deleteEmployee(employeeId);
    res.json({ message: 'Employee deleted successfully', result });
  } catch (err) {
    handleError(res, err, "deleteEmployee");
  }
};