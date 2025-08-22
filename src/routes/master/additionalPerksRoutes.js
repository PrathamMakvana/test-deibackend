const express = require('express');
const router = express.Router();
const additionalPerkController = require('../../controllers/master/additionalPerksController');
const { authmiddleware, authorizeRoles, ROLE } = require("../../middleware/auth");

// Create Additional Perk
router.post('/add', additionalPerkController.createAdditionalPerk);

// Get All Additional Perks
router.get('/get-all', additionalPerkController.getAdditionalPerks);

// Get Single Additional Perk by ID
router.get('/get-one/:id', additionalPerkController.getAdditionalPerkById);

// Update Additional Perk
router.put('/update/:id', additionalPerkController.updateAdditionalPerk);

// Delete Additional Perk
router.delete('/delete/:id', additionalPerkController.deleteAdditionalPerk);

module.exports = router;
