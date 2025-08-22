const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    category: {
      type: String,
    },
    image: {
      type: String, 
      default: null,
    },
    description: {
      type: String,
    },
    authorImage: {
      type: String,
      default: null,
    },
    authorName: {
      type: String,
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Blog", blogSchema);
