const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const resumeRoutes = require("./resumeRoutes");
const jobTypeRoutes = require("../routes/master/jobTypeRoutes");
const departmentRoutes = require("../routes/master/departmentRoutes");
const additionalPerksRoutes = require("../routes/master/additionalPerksRoutes");
const educationRoutes = require("../routes/master/educationRoutes");
const compensationRoutes = require("../routes/master/compensationRoutes");
const modeRoutes = require("../routes/master/modeRoutes");
const serviceRoutes = require("../routes/serviceRoutes");
const pageRoutes = require("../routes/pageRoutes");
const chooseUsRoutes = require("../routes/chooseUsRoutes");
const jobCategoryRoutes = require("../routes/master/jobCategoryRoutes");
const howItWorksRoutes = require("../routes/master/howItWorksRoutes");
const blogRoutes = require("../routes/blogRoutes");
const settingRoutes = require("../routes/settingRoutes");
const jobRoutes = require("../routes/jobRoutes");
const medalRoutes = require("../routes/master/medalRoutes")

router.use("/users", userRoutes);
router.use("/resumes", resumeRoutes);
router.use("/jobType", jobTypeRoutes);
router.use("/department", departmentRoutes);
router.use("/additionalPerk", additionalPerksRoutes);
router.use("/education", educationRoutes);
router.use("/compensation", compensationRoutes);
router.use("/mode", modeRoutes);
router.use("/service", serviceRoutes);
router.use("/page", pageRoutes);
router.use("/choose-us", chooseUsRoutes);
router.use("/job-categories", jobCategoryRoutes);
router.use("/howItWorks", howItWorksRoutes);
router.use("/blog", blogRoutes);
router.use("/setting", settingRoutes);
router.use("/job", jobRoutes);
router.use("/medal",medalRoutes)

module.exports = router;
