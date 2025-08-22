const express = require("express");
const multer = require("multer");
const {
  uploadSetting,
  getSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
} = require("../controllers/settingController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Create Setting
router.post("/add", upload.single("logo"), uploadSetting);

// Get all Settings
router.get("/get-all", getSettings);

// Get Setting by ID
router.get("/get-one/:id", getSettingById);

// Update Setting
router.put("/update/:id", upload.single("logo"), updateSetting);

// Delete Setting
router.delete("/delete/:id", deleteSetting);

module.exports = router;
