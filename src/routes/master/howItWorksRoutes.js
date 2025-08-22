const express = require("express");
const multer = require("multer");
const {
  uploadHowItWorks,
  getHowItWorksItems,
  getHowItWorksById,
  updateHowItWorks,
  deleteHowItWorks,
} = require("../../controllers/master/howItWorksController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Add How It Works Item
router.post("/add", upload.single("image"), uploadHowItWorks);

// Get all How It Works Items
router.get("/get-all", getHowItWorksItems);

// Get single How It Works Item by ID
router.get("/get-one/:id", getHowItWorksById);

// Update How It Works Item
router.put("/update/:id", upload.single("image"), updateHowItWorks);

// Delete How It Works Item
router.delete("/delete/:id", deleteHowItWorks);

module.exports = router;
