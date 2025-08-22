const Setting = require("../models/setting");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Setting
const uploadSetting = async (req, res) => {
  try {
    let logoUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "settings",
      });
      logoUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Parse quick_links if it's sent as JSON string
    let quickLinks = [];
    if (req.body.quick_links) {
      quickLinks = typeof req.body.quick_links === "string"
        ? JSON.parse(req.body.quick_links)
        : req.body.quick_links;
    }

    const setting = await Setting.create({
      site_name: req.body.site_name,
      footer_description: req.body.footer_description,
      logo: logoUrl,
      twitter_link: req.body.twitter_link,
      instagram_link: req.body.instagram_link,
      facebook_link: req.body.facebook_link,
      linkedin_link: req.body.linkedin_link,
      address: req.body.address,
      mobile_number: req.body.mobile_number,
      email: req.body.email,
      quick_links: quickLinks,
    });

    res.status(201).json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort({ createdAt: -1 });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Setting by ID
const getSettingById = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Setting
const updateSetting = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.id);
    if (!setting) return res.status(404).json({ message: "Setting not found" });

    let logoUrl = setting.logo;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "settings",
      });
      logoUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Parse quick_links if it's sent as JSON string
    let quickLinks = setting.quick_links;
    if (req.body.quick_links) {
      quickLinks = typeof req.body.quick_links === "string"
        ? JSON.parse(req.body.quick_links)
        : req.body.quick_links;
    }

    setting.site_name = req.body.site_name || setting.site_name;
    setting.footer_description = req.body.footer_description || setting.footer_description;
    setting.logo = logoUrl;
    setting.twitter_link = req.body.twitter_link || setting.twitter_link;
    setting.instagram_link = req.body.instagram_link || setting.instagram_link;
    setting.facebook_link = req.body.facebook_link || setting.facebook_link;
    setting.linkedin_link = req.body.linkedin_link || setting.linkedin_link;
    setting.address = req.body.address || setting.address;
    setting.mobile_number = req.body.mobile_number || setting.mobile_number;
    setting.email = req.body.email || setting.email;
    setting.quick_links = quickLinks;

    await setting.save();
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Setting
const deleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findByIdAndDelete(req.params.id);
    if (!setting) return res.status(404).json({ message: "Setting not found" });
    res.json({ message: "Setting deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadSetting,
  getSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
};
