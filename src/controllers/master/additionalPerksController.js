const AdditionalPerk = require('../../models/master/additionalPerks');

// Create Additional Perk
exports.createAdditionalPerk = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Additional Perk name is required",
      });
    }

    // Case-insensitive check for existing name
    const existing = await AdditionalPerk.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Additional Perk with this name already exists",
      });
    }

    const perk = await AdditionalPerk.create({
      name: name.trim(),
      status: status || "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Additional Perk created successfully",
      data: perk,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating Additional Perk",
      error: error.message,
    });
  }
};


// Get All Additional Perks
exports.getAdditionalPerks = async (req, res) => {
  try {
    const perks = await AdditionalPerk.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Additional Perks fetched successfully',
      data: perks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Additional Perks',
      error: error.message,
    });
  }
};

// Get Single Additional Perk
exports.getAdditionalPerkById = async (req, res) => {
  try {
    const { id } = req.params;
    const perk = await AdditionalPerk.findById(id);

    if (!perk) {
      return res.status(404).json({
        success: false,
        message: 'Additional Perk not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Additional Perk fetched successfully',
      data: perk,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Additional Perk',
      error: error.message,
    });
  }
};

// Update Additional Perk
exports.updateAdditionalPerk = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.name) {
      const name = req.body.name.trim();

      const existing = await AdditionalPerk.findOne({
        name: { $regex: `^${name}$`, $options: "i" }, 
        _id: { $ne: id }, 
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Another Additional Perk with this name already exists",
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
        message: "No valid fields provided to update",
      });
    }

    const updatedPerk = await AdditionalPerk.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedPerk) {
      return res.status(404).json({
        success: false,
        message: "Additional Perk not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Additional Perk updated successfully",
      data: updatedPerk,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating Additional Perk",
      error: error.message,
    });
  }
};


// Delete Additional Perk
exports.deleteAdditionalPerk = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AdditionalPerk.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Additional Perk not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Additional Perk deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting Additional Perk',
      error: error.message,
    });
  }
};
