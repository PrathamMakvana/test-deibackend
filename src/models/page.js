const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    heading: {
      type: String,
    },
    description: {
      type: String, 
    },
    image: {
      type: String, 
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Page", pageSchema);
