const JobType = require('../../models/master/jobType'); 

// Create Job Type
exports.createJobType = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Case-insensitive check if name already exists
    const existing = await JobType.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Job Type with this name already exists',
      });
    }

    const jobType = await JobType.create({
      name: name.trim(),
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Job Type created successfully',
      data: jobType,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating Job Type',
      error: error.message,
    });
  }
};


// Get All Job Types
exports.getJobTypes = async (req, res) => {
  try {
    const jobTypes = await JobType.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Job Types fetched successfully',
      data: jobTypes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Job Types',
      error: error.message,
    });
  }
};

// Get Single Job Type
exports.getJobTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobType = await JobType.findById(id);

    if (!jobType) {
      return res.status(404).json({
        success: false,
        message: 'Job Type not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job Type fetched successfully',
      data: jobType,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Job Type',
      error: error.message,
    });
  }
};

// Update Job Type
exports.updateJobType = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.name) {
      const name = req.body.name.trim();

      const existing = await JobType.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another Job Type with this name already exists',
        });
      }

      updates.name = name;
    }

    // If status is provided, update status
    if (req.body.status) {
      updates.status = req.body.status;
    }

    // Prevent empty update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided to update',
      });
    }

    const updatedJobType = await JobType.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedJobType) {
      return res.status(404).json({
        success: false,
        message: 'Job Type not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job Type updated successfully',
      data: updatedJobType,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating Job Type',
      error: error.message,
    });
  }
};



// Delete Job Type
exports.deleteJobType = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await JobType.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Job Type not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job Type deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting Job Type',
      error: error.message,
    });
  }
};
