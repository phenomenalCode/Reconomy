const express = require('express');
const router = express.Router({ mergeParams: true });

const loginController = require('../controllers/login_controller');

// Authentication routes
router.post('/login', loginController.logIn);
router.post('/logout', loginController.logOut);

// Management routes (not implemented yet)
router.put('/edit', loginController.updateLogin);
router.delete('/edit', loginController.deleteLogin);

module.exports = router;
