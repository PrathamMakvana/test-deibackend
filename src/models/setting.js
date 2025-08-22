const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    site_name: {
      type: String,
      required: true,
      trim: true,
    },
    footer_description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String, 
    },
    twitter_link: {
      type: String,
      trim: true,
    },
    instagram_link: {
      type: String,
      trim: true,
    },
    facebook_link: {
      type: String,
      trim: true,
    },
    linkedin_link: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    mobile_number: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    quick_links: [
      {
        label: {
          type: String,
        },
        path: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
