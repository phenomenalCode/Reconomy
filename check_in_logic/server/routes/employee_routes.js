const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee_controller');


// List all employees
router.get('/', employeeController.getAllEmployees);


// Search by last name (POST expects JSON body with { first_letter })
router.post('/last_name', employeeController.getEmployeesByLastName);

// Next page for last name search (POST expects { first_letter, page_num })
router.post('/last_name/next', employeeController.getNextEmployeesByLastName);

// Get employee by ID (POST expects { employee_id })
router.post('/id', employeeController.getEmployeeById);

// CRUD operations
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
