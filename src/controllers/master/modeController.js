const Mode = require('../../models/master/mode');

// Create Mode
exports.createMode = async (req, res) => {
  try {
    const { name, status } = req.body;

    const existing = await Mode.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Mode with this name already exists',
      });
    }

    const mode = await Mode.create({
      name: name.trim(),
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Mode created successfully',
      data: mode,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating Mode',
      error: error.message,
    });
  }
};

// Get All Modes
exports.getModes = async (req, res) => {
  try {
    const modes = await Mode.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Modes fetched successfully',
      data: modes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Modes',
      error: error.message,
    });
  }
};

// Get Single Mode by ID
exports.getModeById = async (req, res) => {
  try {
    const { id } = req.params;
    const mode = await Mode.findById(id);

    if (!mode) {
      return res.status(404).json({
        success: false,
        message: 'Mode not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mode fetched successfully',
      data: mode,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Mode',
      error: error.message,
    });
  }
};

// Update Mode
exports.updateMode = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.name) {
      const name = req.body.name.trim();

      const existing = await Mode.findOne({
        name,
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another Mode with this name already exists',
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

    const updatedMode = await Mode.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedMode) {
      return res.status(404).json({
        success: false,
        message: 'Mode not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mode updated successfully',
      data: updatedMode,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating Mode',
      error: error.message,
    });
  }
};

// Delete Mode
exports.deleteMode = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Mode.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Mode not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mode deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting Mode',
      error: error.message,
    });
  }
};
