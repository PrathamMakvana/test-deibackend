const Department = require('../../models/master/department'); 

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Case-insensitive check if name already exists
    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    const department = await Department.create({
      name: name.trim(),
      status: status || 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating Department',
      error: error.message,
    });
  }
};


// Get All Departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Departments fetched successfully',
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Departments',
      error: error.message,
    });
  }
};

// Get Single Department
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department fetched successfully',
      data: department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching Department',
      error: error.message,
    });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.name) {
      const name = req.body.name.trim();

      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another Department with this name already exists',
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

    const updatedDepartment = await Department.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating Department',
      error: error.message,
    });
  }
};


// Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting Department',
      error: error.message,
    });
  }
};
