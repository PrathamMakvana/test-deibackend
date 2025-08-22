const express = require("express");
const multer = require("multer");
const {
  uploadChooseUs,
  getChooseUs,
  getChooseUsById,
  updateChooseUs,
  deleteChooseUs,
} = require("../controllers/chooseUsController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Add Choose Us
router.post("/add", upload.single("image"), uploadChooseUs);

// Get all Choose Us entries
router.get("/get-all", getChooseUs);

// Get single Choose Us entry by ID
router.get("/get-one/:id", getChooseUsById);

// Update Choose Us entry
router.put("/update/:id", upload.single("image"), updateChooseUs);

// Delete Choose Us entry
router.delete("/delete/:id", deleteChooseUs);

module.exports = router;
