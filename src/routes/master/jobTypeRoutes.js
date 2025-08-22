const express = require('express');
const router = express.Router();
const jobTypeController = require('../../controllers/master/jobTypeController');
const {authmiddleware,  authorizeRoles, ROLE} = require("../../middleware/auth")

// Create Job Type
router.post('/add',  jobTypeController.createJobType);

// Get All Job Types
router.get('/get-all', jobTypeController.getJobTypes);

// Get Single Job Type by ID
router.get('/get-one/:id', jobTypeController.getJobTypeById);

// Update Job Type
router.put('/update/:id', jobTypeController.updateJobType);

// Delete Job Type
router.delete('/delete/:id', jobTypeController.deleteJobType);

module.exports = router;
