const mongoose = require('mongoose');

const jobCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String, 
      required: false,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'InActive'],
      default: 'Active',
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('JobCategory', jobCategorySchema);
