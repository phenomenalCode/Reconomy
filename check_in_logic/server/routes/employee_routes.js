const express = require('express');
const cors = require('cors');
const router = express.Router();
const employeeController = require('../controllers/employee_controller');

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware to all routes in this router
router.use(cors(corsOptions));

// Handle OPTIONS preflight requests for all routes
router.options('*', cors(corsOptions));

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
