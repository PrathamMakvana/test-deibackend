const mongoose = require('mongoose');

const medalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
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

module.exports = mongoose.model('Medal', medalSchema);
