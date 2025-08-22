const Education = require('../../models/master/education'); 

// Create Education
exports.createEducation = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Case-insensitive check if name already exists
    const existing = await Education.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Education with this name already exists',
      });
    }

    const education = await Education.create({
      name: name.trim(),
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Education created successfully',
      data: education,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating Education',
      error: error.message,
    });
  }
};


// Get All Educations
exports.getEducations = async (req, res) => {
  try {
    const educations = await Education.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Educations fetched successfully',
      data: educations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Educations',
      error: error.message,
    });
  }
};

// Get Single Education
exports.getEducationById = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await Education.findById(id);

    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Education fetched successfully',
      data: education,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Education',
      error: error.message,
    });
  }
};

// Update Education
exports.updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.name) {
      const name = req.body.name.trim();

      const existing = await Education.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another Education with this name already exists',
        });
      }

      updates.name = name;
    }

    if (req.body.status) {
      updates.status = req.body.status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided to update',
      });
    }

    const updatedEducation = await Education.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedEducation) {
      return res.status(404).json({
        success: false,
        message: 'Education not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      data: updatedEducation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating Education',
      error: error.message,
    });
  }
};


// Delete Education
exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Education.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Education not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Education deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting Education',
      error: error.message,
    });
  }
};
