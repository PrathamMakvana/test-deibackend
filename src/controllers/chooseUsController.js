const ChooseUs = require("../models/chooseUs");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Choose Us
const uploadChooseUs = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "choose-us",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const chooseUs = await ChooseUs.create({
      name: req.body.name,
      content: req.body.content,
      image: imageUrl,
      status: req.body.status || "Active",
    });

    res.status(201).json(chooseUs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Choose Us
const getChooseUs = async (req, res) => {
  try {
    const items = await ChooseUs.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Choose Us by ID
const getChooseUsById = async (req, res) => {
  try {
    const item = await ChooseUs.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Choose Us
const updateChooseUs = async (req, res) => {
  try {
    const item = await ChooseUs.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Entry not found" });

    let imageUrl = item.image;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "choose-us",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    item.name = req.body.name || item.name;
    item.content = req.body.content || item.content;
    item.image = imageUrl;
    item.status = req.body.status || item.status;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Choose Us
const deleteChooseUs = async (req, res) => {
  try {
    const item = await ChooseUs.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Entry not found" });
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadChooseUs,
  getChooseUs,
  getChooseUsById,
  updateChooseUs,
  deleteChooseUs,
};
