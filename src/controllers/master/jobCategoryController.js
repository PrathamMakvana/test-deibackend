const JobCategory = require("../../models/master/jobCategory");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Job Category
const uploadJobCategory = async (req, res) => {
  try {
    // Case-insensitive duplicate check
    const existingCategory = await JobCategory.findOne({
      title: { $regex: `^${req.body.title.trim()}$`, $options: "i" },
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Job category with the same name already exists" });
    }

    let imageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "job-categories",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const category = await JobCategory.create({
      title: req.body.title.trim(),
      desc: req.body.desc,
      image: imageUrl,
      status: req.body.status || "Active",
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get all Job Categories
const getJobCategories = async (req, res) => {
  try {
    const categories = await JobCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Job Category by ID
const getJobCategoryById = async (req, res) => {
  try {
    const category = await JobCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Job category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Job Category
const updateJobCategory = async (req, res) => {
  try {
    const category = await JobCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Job category not found" });

    if (req.body.title) {
      const existingCategory = await JobCategory.findOne({
        title: { $regex: `^${req.body.title.trim()}$`, $options: "i" }, 
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({ message: "Job category with the same name already exists" });
      }
    }

    let imageUrl = category.image;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "job-categories",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    category.title = req.body.title || category.title;
    category.desc = req.body.desc || category.desc;
    category.image = imageUrl;
    category.status = req.body.status || category.status;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Job Category
const deleteJobCategory = async (req, res) => {
  try {
    const category = await JobCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Job category not found" });
    res.json({ message: "Job category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadJobCategory,
  getJobCategories,
  getJobCategoryById,
  updateJobCategory,
  deleteJobCategory,
};
