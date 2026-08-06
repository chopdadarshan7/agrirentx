const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// Create Upload Directory
// ==========================================
const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// ==========================================
// Storage Configuration
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/misc";

    if (req.uploadFolder) {
      folder = `uploads/${req.uploadFolder}`;
    }

    createFolder(folder);

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ==========================================
// File Filter
// ==========================================
const fileFilter = (req, file, cb) => {
  let allowedTypes = [];

  // Default upload type
  const uploadType = req.uploadType || "image";

  if (uploadType === "image") {
    allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
  }

  if (uploadType === "document") {
    allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];
  }

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      `Invalid file type for ${uploadType} upload.`
    ),
    false
  );
};
// ==========================================
// Multer Upload
// ==========================================
const upload = multer({
  storage,
  fileFilter,


  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

})
  ;


module.exports = upload;