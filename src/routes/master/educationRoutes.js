const express = require('express');
const router = express.Router();
const educationController = require('../../controllers/master/educationController');
const { authmiddleware, authorizeRoles, ROLE } = require("../../middleware/auth");

// Create Education
router.post('/add', educationController.createEducation);

// Get All Educations
router.get('/get-all', educationController.getEducations);

// Get Single Education by ID
router.get('/get-one/:id', educationController.getEducationById);

// Update Education
router.put('/update/:id', educationController.updateEducation);

// Delete Education
router.delete('/delete/:id', educationController.deleteEducation);

module.exports = router;
