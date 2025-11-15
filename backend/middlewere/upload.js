// backend/middlewere/upload.js
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.originalname.toLowerCase().replace(/\s+/g, "_")
    );
  },
});

// Allow only image files
const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|gif/;
  const isValidExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowed.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed!"));
  }
};

module.exports = multer({ storage, fileFilter });
