const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
  employeeRegister,
  employeeLogin,
  employerRegister,
  verifyOtp,
  getOneUser,
  jobPosterUpdateProfile,
  updateProfile,
} = require("../controllers/userController");
const { authMiddleware, authorizeRoles, ROLE } = require("../middleware/auth");

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/employee/register", employeeRegister);
router.post("/employer/register", employerRegister);
router.post("/employee/login", employeeLogin);
router.post("/employee/verify-otp", verifyOtp);

// Protected
router.get("/current-user", authMiddleware, getCurrentUser);
router.put("/update/:id", authMiddleware, updateUser);

// Admin routes
router.get(
  "/all-users",
  authMiddleware,
  authorizeRoles(ROLE.ADMIN),
  getAllUsers
);
router.get("/get-one/:id", getOneUser);

router.delete(
  "/delete-user/:id",
  authMiddleware,
  authorizeRoles(ROLE.ADMIN),
  deleteUser
);

router.put("/update-profile", authMiddleware, updateProfilee);
router.post(
  "/employers-update-profile",
  authMiddleware,
  jobPosterUpdateProfile
);

module.exports = router;
