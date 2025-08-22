const express = require("express");
const multer = require("multer");
const {
  uploadService,
  getServices,
  updateService,
  deleteService,
  getServiceById
} = require("../controllers/serviceController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add", upload.single("image"), uploadService);
router.get("/get-all", getServices);
router.get("/get-one/:id", getServiceById);
router.put("/update/:id", upload.single("image"), updateService);
router.delete("/delete/:id", deleteService);

module.exports = router;
