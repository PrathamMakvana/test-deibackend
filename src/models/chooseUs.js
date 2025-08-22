const mongoose = require('mongoose');

const chooseUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    content: {
      type: String,
    },
    image: {
      type: String, 
    },
    status: {
      type: String,
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChooseUs', chooseUsSchema);
