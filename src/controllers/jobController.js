// controllers/jobController.js
const Job = require("../models/Job");
const { ROLE } = require("../models/user");

// Helper to populate all foreign keys
const jobPopulate = [
  { path: "category" },
  { path: "jobType" },
  { path: "postedBy" },
  { path: "applicants" },
  { path: "savedBy" },
];

exports.createJob = async (req, res) => {
  try {
    if (req.user.roleId !== ROLE.JOB_POSTER) {
      return res
        .status(403)
        .json({ success: false, error: "Only Job Posters can create jobs" });
    }

    const jobData = {
      ...req.body,
      postedBy: req.user._id,
    };

    const job = new Job(jobData);
    await job.save();

    const populatedJob = await job.populate(jobPopulate);

    res.status(201).json({ success: true, data: populatedJob });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ Get all Jobs
exports.getJobs = async (req, res) => {
  try {
    let query = {};

    if (req.user.roleId === ROLE.JOB_POSTER) {
      query.postedBy = req.user._id;
    }

    const jobs = await Job.find(query).populate(jobPopulate);

    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get Job By ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(jobPopulate);

    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (
      req.user.roleId === ROLE.JOB_POSTER &&
      job.postedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Update Job
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (
      req.user.roleId !== ROLE.ADMIN &&
      job.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate(jobPopulate);

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ✅ Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (
      req.user.roleId !== ROLE.ADMIN &&
      job.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    await job.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
