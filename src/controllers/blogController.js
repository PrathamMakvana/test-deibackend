const Blog = require("../models/blog");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Blog
const uploadBlog = async (req, res) => {
  try {
    let imageUrl = null;
    let authorImageUrl = null;

    // Upload blog image
    if (req.files && req.files.image) {
      const uploadResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "blogs",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.image[0].path);
    }

    // Upload author image
    if (req.files && req.files.authorImage) {
      const uploadResult = await cloudinary.uploader.upload(req.files.authorImage[0].path, {
        folder: "blogs/authors",
      });
      authorImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.authorImage[0].path);
    }

    const blog = await Blog.create({
      title: req.body.title,
      category: req.body.category,
      image: imageUrl,
      description: req.body.description,
      authorImage: authorImageUrl,
      authorName: req.body.authorName,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      status: req.body.status || "Active",
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Blog
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    let imageUrl = blog.image;
    let authorImageUrl = blog.authorImage;

    // Update blog image
    if (req.files && req.files.image) {
      const uploadResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "blogs",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.image[0].path);
    }

    // Update author image
    if (req.files && req.files.authorImage) {
      const uploadResult = await cloudinary.uploader.upload(req.files.authorImage[0].path, {
        folder: "blogs/authors",
      });
      authorImageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.authorImage[0].path);
    }

    blog.title = req.body.title || blog.title;
    blog.category = req.body.category || blog.category;
    blog.image = imageUrl;
    blog.description = req.body.description || blog.description;
    blog.authorImage = authorImageUrl;
    blog.authorName = req.body.authorName || blog.authorName;
    blog.metaTitle = req.body.metaTitle || blog.metaTitle;
    blog.metaDescription = req.body.metaDescription || blog.metaDescription;
    blog.status = req.body.status || blog.status;

    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
