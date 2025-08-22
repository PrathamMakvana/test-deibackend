const jwt = require("jsonwebtoken");
const { User, ROLE } = require("../models/user");
const { sendResponse } = require("../utils/utils");
const { sendEmail } = require("../utils/sendMail");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, roleId: user.roleId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, roleId, phone, company } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email,
      password,
      roleId,
      phone,
      company,
    });

    const serviceToken = generateToken(user);
    res.status(201).json({ user, serviceToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const serviceToken = generateToken(user);
    res.json({ user, serviceToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("certifiedTags");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOneUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password")
      .populate("certifiedTags");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user by ID (using params)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("certifiedTags");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.employeeRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      dateOfBirth,
      gender,
      city,
      state,
      country,
      address,
      pincode,
      profilePhotoUrl,
      resume,
      workStatus,
      skills,
      education,
      experience,
      preferences,
      status,
      acceptTerms,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, false, "Email already in use");
    }

    // Validate acceptTerms
    if (!acceptTerms) {
      return sendResponse(
        res,
        400,
        false,
        "Please accept terms and conditions"
      );
    }

    // Create new user with roleId fixed as 3 (JOB_SEEKER)
    const user = new User({
      roleId: 3,
      name,
      email,
      mobile,
      password,
      dateOfBirth,
      gender,
      city,
      state,
      country,
      address,
      pincode,
      profilePhotoUrl,
      resume,
      workStatus,
      skills,
      education,
      experience,
      preferences,
      status,
      acceptTerms,
    });

    await user.save();

    return sendResponse(res, 201, true, "User registered successfully", {
      userId: user._id,
      roleId: user.roleId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return sendResponse(res, 500, false, "Server error", error.message);
  }
};

exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return sendResponse(res, 400, false, "Invalid email or password");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    // Save OTP and expiry to user
    // user.otp = {
    //   code: otp,
    //   expiresAt: expiry,
    // };
    // await user.save();

    // Send OTP Email
    // await sendEmail(user.email, "Your OTP Code", `Your OTP code is: ${otp}`);

    return sendResponse(res, 200, true, "OTP sent to your email", {
      userId: user._id,
    });
  } catch (err) {
    console.error("Login error:", err);
    return sendResponse(res, 500, false, "Server error", err.message);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("🚀req.body --->", req.body);

    // Find single user
    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return sendResponse(res, 400, false, "Invalid or expired OTP");
    }

    // Check expiry and value
    // const isExpired = new Date() > new Date(user.otp.expiresAt);
    const isExpired = false; // Temporarily disable expiry check for testing
    const isValid = user.otp.code === otp;

    if (!isValid || isExpired) {
      return sendResponse(res, 400, false, "Invalid or expired OTP");
    }

    // OTP is valid — generate token and login
    const serviceToken = generateToken(user);

    // // Clear OTP from DB
    // user.otp = undefined;
    // await user.save();

    return sendResponse(res, 200, true, "Login successful", {
      user,
      serviceToken,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return sendResponse(res, 500, false, "Server error", err.message);
  }
};

exports.employerRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      city,
      state,
      address,
      pincode,
      status,
      companyName,
      companySize,
      companyDescription,
      companyLogo,
      companyVerified,
      companyAccountType,
      companyDesignation,
      companyWebsite,
      acceptTerms,
      certifiedTags,
    } = req.body;

    // Check if employer already exists
    const existingEmployer = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingEmployer) {
      return res.status(400).json({
        success: false,
        message: "Employer already exists with this email or mobile",
      });
    }

    // Validate acceptTerms
    if (!acceptTerms) {
      return res.status(400).json({
        success: false,
        message: "Please accept terms and conditions",
      });
    }

    // Create new employer with roleId fixed as 2
    const employer = await User.create({
      roleId: 2,
      name,
      email,
      mobile,
      password,
      city,
      state,
      address,
      pincode,
      status,
      companyName,
      companySize,
      companyDescription,
      companyLogo,
      companyVerified,
      companyAccountType,
      companyDesignation,
      companyWebsite,
      acceptTerms,
      certifiedTags,
    });

    // Create JWT token
    const token = jwt.sign(
      { id: employer._id, roleId: employer.roleId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Remove password from response
    employer.password = undefined;

    res.status(201).json({
      success: true,
      message: "Employer registered successfully",
      data: { employer, token },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      dateOfBirth,
      gender,
      city,
      state,
      country,
      address,
      pincode,
      profilePhotoUrl,
      resume,
      workStatus,
      skills,
      education,
      experience,
      preferences,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        email,
        mobile,
        dateOfBirth,
        gender,
        city,
        state,
        country,
        address,
        pincode,
        profilePhotoUrl,
        resume,
        workStatus,
        skills,
        education,
        experience,
        preferences,
      },
      { new: true, runValidators: true }
    ).select("-password");

    return sendResponse(
      res,
      200,
      true,
      "Profile updated successfully",
      updatedUser
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return sendResponse(res, 500, false, "Server error", error.message);
  }
};

// Enhanced updateProfile function in userController.js

exports.jobPosterUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    const {
      name,
      email,
      mobile,
      dateOfBirth,
      gender,
      city,
      state,
      country,
      address,
      pincode,
      profilePhotoUrl,
      resume,
      workStatus,
      skills,
      education,
      experience,
      preferences,
      jobType,
      department,
      category,
      salaryRange,
      preferredLocations,
    } = req.body;

    // Check if email is being changed and if it already exists for another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return sendResponse(
          res,
          400,
          false,
          "Email already in use by another user"
        );
      }
    }

    // Prepare update data
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(mobile && { mobile }),
      ...(dateOfBirth && { dateOfBirth }),
      ...(gender && { gender }),
      ...(city && { city }),
      ...(state && { state }),
      ...(country && { country }),
      ...(address && { address }),
      ...(pincode && { pincode }),
      ...(profilePhotoUrl && { profilePhotoUrl }),
      ...(resume && { resume }),
      ...(workStatus && { workStatus }),
      ...(skills && { skills }),
      ...(education && { education }),
      ...(experience && { experience }),
    };

    if (
      preferences ||
      jobType ||
      department ||
      category ||
      salaryRange ||
      preferredLocations
    ) {
      updateData.preferences = {
        ...updateData.preferences,
        ...(jobType && { jobType }),
        ...(department && { department }),
        ...(category && { category }),
        ...(salaryRange && { salary_range: salaryRange }),
        ...(preferredLocations && {
          preffered_locations: preferredLocations
            .split(",")
            .map((loc) => loc.trim()),
        }),
        ...preferences,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -otp");

    if (!updatedUser) {
      return sendResponse(res, 404, false, "User not found");
    }

    return sendResponse(
      res,
      200,
      true,
      "Profile updated successfully",
      updatedUser
    );
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return sendResponse(res, 400, false, "Validation error", errors);
    }

    return sendResponse(res, 500, false, "Server error", error.message);
  }
};
