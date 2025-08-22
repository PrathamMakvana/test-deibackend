const express = require("express");
const multer = require("multer");
const {
  uploadBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Add Blog (two image uploads: image & authorImage)
router.post(
  "/add",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "authorImage", maxCount: 1 },
  ]),
  uploadBlog
);

// Get all Blogs
router.get("/get-all", getBlogs);

// Get single Blog by ID
router.get("/get-one/:id", getBlogById);

// Update Blog
router.put(
  "/update/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "authorImage", maxCount: 1 },
  ]),
  updateBlog
);

// Delete Blog
router.delete("/delete/:id", deleteBlog);

module.exports = router;
