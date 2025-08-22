const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { string } = require("joi");

const ROLE = {
  ADMIN: 1,
  JOB_POSTER: 2,
  JOB_SEEKER: 3,
};

const userSchema = new mongoose.Schema(
  {
    roleId: {
      type: Number,
      enum: [ROLE.ADMIN, ROLE.JOB_SEEKER, ROLE.JOB_POSTER],
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    mobile: {
      type: String,
    },
    password: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
    },
    city: String,
    state: String,
    country: String,
    address: String,
    pincode: String,
    profilePhotoUrl: String,
    resume: String,
    workStatus: {
      type: String,
      enum: ["experience", "fresher"],
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    skills: [String],
    education: [
      {
        degree: String,
        institution: String,
        graduationYear: Number,
      },
    ],
    experience: [
      {
        companyName: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    preferences: {
      jobTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: "JobType" }],
      department: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
      salary_range: String,
      preffered_locations: [String],
    },
    status: {
      type: Boolean,
      default: true,
    },
    companyName: String,
    companySize: String,
    companyDescription: String, //about us company
    companyLogo: String,
    companyVerified: {
      type: Boolean,
      default: false,
    },
    acceptTerms: {
      type: Boolean,
      default: false,
    },
    companyAccountType: String,
    companyDesignation: String,
    companyWebsite: String,
    certifiedTags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medal",
      },
    ],
    tagline: String,
    recruitments: String,
    people: String,
    companyField: String,
    memberSince: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = {
  User: mongoose.models.User || mongoose.model("User", userSchema),
  ROLE,
};
