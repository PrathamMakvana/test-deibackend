const Medal = require("../../models/master/medal");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Medal
const uploadMedal = async (req, res) => {
  try {
    // Case-insensitive duplicate check
    const existingMedal = await Medal.findOne({
      name: { $regex: `^${req.body.name.trim()}$`, $options: "i" },
    });

    if (existingMedal) {
      return res
        .status(400)
        .json({ message: "Medal with the same name already exists" });
    }

    let imageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "medals",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const medal = await Medal.create({
      name: req.body.name.trim(),
      image: imageUrl,
      status: req.body.status || "Active",
    });

    res.status(201).json(medal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Medals
const getMedals = async (req, res) => {
  try {
    const medals = await Medal.find().sort({ createdAt: -1 });
    res.json(medals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Medal by ID
const getMedalById = async (req, res) => {
  try {
    const medal = await Medal.findById(req.params.id);
    if (!medal) {
      return res.status(404).json({ message: "Medal not found" });
    }
    res.json(medal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Medal
const updateMedal = async (req, res) => {
  try {
    const medal = await Medal.findById(req.params.id);
    if (!medal) return res.status(404).json({ message: "Medal not found" });

    if (req.body.name) {
      const existingMedal = await Medal.findOne({
        name: { $regex: `^${req.body.name.trim()}$`, $options: "i" },
        _id: { $ne: req.params.id },
      });

      if (existingMedal) {
        return res
          .status(400)
          .json({ message: "Medal with the same name already exists" });
      }
    }

    let imageUrl = medal.image;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "medals",
      });
      imageUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    medal.name = req.body.name || medal.name;
    medal.image = imageUrl;
    medal.status = req.body.status || medal.status;

    await medal.save();
    res.json(medal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Medal
const deleteMedal = async (req, res) => {
  try {
    const medal = await Medal.findByIdAndDelete(req.params.id);
    if (!medal) return res.status(404).json({ message: "Medal not found" });
    res.json({ message: "Medal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadMedal,
  getMedals,
  getMedalById,
  updateMedal,
  deleteMedal,
};
