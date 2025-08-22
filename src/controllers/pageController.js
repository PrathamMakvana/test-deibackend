const Page = require("../models/page");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Page
const uploadPage = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "pages",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const page = await Page.create({
      title: req.body.title,
      heading: req.body.heading,
      description: req.body.description,
      image: imageUrl,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      status: req.body.status || "Active",
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Pages
const getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Page by ID
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Page
const updatePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });

    let imageUrl = page.image;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "pages",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    page.title = req.body.title || page.title;
    page.heading = req.body.heading || page.heading;
    page.description = req.body.description || page.description;
    page.image = imageUrl;
    page.metaTitle = req.body.metaTitle || page.metaTitle;
    page.metaDescription = req.body.metaDescription || page.metaDescription;
    page.status = req.body.status || page.status;

    await page.save();
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Page
const deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadPage,
  getPages,
  getPageById,
  updatePage,
  deletePage,
};
