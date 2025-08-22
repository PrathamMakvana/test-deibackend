const express = require('express');
const router = express.Router();
const departmentController = require('../../controllers/master/departmentController');
const { authmiddleware, authorizeRoles, ROLE } = require("../../middleware/auth");

// Create Department
router.post('/add', departmentController.createDepartment);

// Get All Departments
router.get('/get-all', departmentController.getDepartments);

// Get Single Department by ID
router.get('/get-one/:id', departmentController.getDepartmentById);

// Update Department
router.put('/update/:id', departmentController.updateDepartment);

// Delete Department
router.delete('/delete/:id', departmentController.deleteDepartment);

module.exports = router;
