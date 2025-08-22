const Compensation = require('../../models/master/compensation');

// Create Compensation
exports.createCompensation = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Check if name already exists
    const existing = await Compensation.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Compensation with this name already exists',
      });
    }

    const compensation = await Compensation.create({
      name: name.trim(),
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Compensation created successfully',
      data: compensation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating Compensation',
      error: error.message,
    });
  }
};

// Get All Compensations
exports.getCompensations = async (req, res) => {
  try {
    const compensations = await Compensation.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Compensations fetched successfully',
      data: compensations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Compensations',
      error: error.message,
    });
  }
};

// Get Single Compensation
exports.getCompensationById = async (req, res) => {
  try {
    const { id } = req.params;
    const compensation = await Compensation.findById(id);

    if (!compensation) {
      return res.status(404).json({
        success: false,
        message: 'Compensation not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Compensation fetched successfully',
      data: compensation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Compensation',
      error: error.message,
    });
  }
};

// Update Compensation
exports.updateCompensation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    // If name is provided, check uniqueness and prepare for update
    if (req.body.name) {
      const name = req.body.name.trim();

      const existing = await Compensation.findOne({
        name: name,
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another Compensation with this name already exists',
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

    const updatedCompensation = await Compensation.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedCompensation) {
      return res.status(404).json({
        success: false,
        message: 'Compensation not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Compensation updated successfully',
      data: updatedCompensation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating Compensation',
      error: error.message,
    });
  }
};

// Delete Compensation
exports.deleteCompensation = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Compensation.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Compensation not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Compensation deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting Compensation',
      error: error.message,
    });
  }
};
