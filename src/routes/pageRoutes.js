const express = require("express");
const multer = require("multer");
const {
  uploadPage,
  getPages,
  getPageById,
  updatePage,
  deletePage,
} = require("../controllers/pageController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Add Page
router.post("/add", upload.single("image"), uploadPage);

// Get all Pages
router.get("/get-all", getPages);

// Get single Page by ID
router.get("/get-one/:id", getPageById);

// Update Page
router.put("/update/:id", upload.single("image"), updatePage);

// Delete Page
router.delete("/delete/:id", deletePage);

module.exports = router;
