const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
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

module.exports = mongoose.model('Department', departmentSchema);
