const express = require('express');
const router = express.Router();
const modeController = require('../../controllers/master/modeController');
const { authmiddleware, authorizeRoles, ROLE } = require('../../middleware/auth');

// Create Mode
router.post('/add', modeController.createMode);

// Get All Modes
router.get('/get-all', modeController.getModes);

// Get Single Mode by ID
router.get('/get-one/:id', modeController.getModeById);

// Update Mode
router.put('/update/:id', modeController.updateMode);

// Delete Mode
router.delete('/delete/:id', modeController.deleteMode);

module.exports = router;
