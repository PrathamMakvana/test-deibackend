// routes/jobRoutes.js
const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { authMiddleware, authorizeRoles, ROLE } = require("../middleware/auth");

const router = express.Router();

// Create Job -> only Job Poster
router.post("/", authMiddleware, authorizeRoles(ROLE.JOB_POSTER), createJob);

// Get all jobs -> Admin, Job Poster, Job Seeker
router.get(
  "/get-all/",
  authMiddleware,
  authorizeRoles(ROLE.ADMIN, ROLE.JOB_POSTER, ROLE.JOB_SEEKER),
  getJobs
);

// Get single job -> Admin, Job Poster, Job Seeker
router.get(
  "/get-one/:id",
  authMiddleware,
  authorizeRoles(ROLE.ADMIN, ROLE.JOB_POSTER, ROLE.JOB_SEEKER),
  getJobById
);

// Update Job -> only the one who posted it OR Admin
router.post(
  "/update/:id",
  authMiddleware,
  authorizeRoles(ROLE.JOB_POSTER, ROLE.ADMIN),
  updateJob
);

// Delete Job -> only the one who posted it OR Admin
router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRoles(ROLE.JOB_POSTER, ROLE.ADMIN),
  deleteJob
);

module.exports = router;
