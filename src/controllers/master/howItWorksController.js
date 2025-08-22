const HowItWorks = require("../../models/master/howItWorks");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add How It Works Item
const uploadHowItWorks = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "how-it-works",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const howItWorks = await HowItWorks.create({
      title: req.body.title,
      description: req.body.description,
      image: imageUrl,
      status: req.body.status || "Active",
    });

    res.status(201).json(howItWorks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all How It Works Items
const getHowItWorksItems = async (req, res) => {
  try {
    const items = await HowItWorks.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get How It Works Item by ID
const getHowItWorksById = async (req, res) => {
  try {
    const item = await HowItWorks.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "How It Works item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update How It Works Item
const updateHowItWorks = async (req, res) => {
  try {
    const item = await HowItWorks.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "How It Works item not found" });

    let imageUrl = item.image;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "how-it-works",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    item.title = req.body.title || item.title;
    item.description = req.body.description || item.description;
    item.image = imageUrl;
    item.status = req.body.status || item.status;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete How It Works Item
const deleteHowItWorks = async (req, res) => {
  try {
    const item = await HowItWorks.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "How It Works item not found" });
    res.json({ message: "How It Works item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadHowItWorks,
  getHowItWorksItems,
  getHowItWorksById,
  updateHowItWorks,
  deleteHowItWorks,
};
