const express = require('express');
const router = express.Router();
const compensationController = require('../../controllers/master/compensationController');
const { authmiddleware, authorizeRoles, ROLE } = require("../../middleware/auth");

// Create Compensation
router.post('/add', compensationController.createCompensation);

// Get All Compensations
router.get('/get-all', compensationController.getCompensations);

// Get Single Compensation by ID
router.get('/get-one/:id', compensationController.getCompensationById);

// Update Compensation
router.put('/update/:id', compensationController.updateCompensation);

// Delete Compensation
router.delete('/delete/:id', compensationController.deleteCompensation);

module.exports = router;
