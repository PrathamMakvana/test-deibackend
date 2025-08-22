const express = require("express");
const multer = require("multer");
const {
  uploadMedal,
  getMedals,
  getMedalById,
  updateMedal,
  deleteMedal,
} = require("../../controllers/master/medalController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Add Medal
router.post("/add", upload.single("image"), uploadMedal);

// Get all Medals
router.get("/get-all", getMedals);

// Get single Medal by ID
router.get("/get-one/:id", getMedalById);

// Update Medal
router.put("/update/:id", upload.single("image"), updateMedal);

// Delete Medal
router.delete("/delete/:id", deleteMedal);

module.exports = router;
