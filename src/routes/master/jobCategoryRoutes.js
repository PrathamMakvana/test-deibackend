const express = require("express");
const multer = require("multer");
const {
  uploadJobCategory,
  getJobCategories,
  getJobCategoryById,
  updateJobCategory,
  deleteJobCategory,
} = require("../../controllers/master/jobCategoryController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Add Job Category
router.post("/add", upload.single("image"), uploadJobCategory);

// Get all Job Categories
router.get("/get-all", getJobCategories);

// Get single Job Category by ID
router.get("/get-one/:id", getJobCategoryById);

// Update Job Category
router.put("/update/:id", upload.single("image"), updateJobCategory);

// Delete Job Category
router.delete("/delete/:id", deleteJobCategory);

module.exports = router;
