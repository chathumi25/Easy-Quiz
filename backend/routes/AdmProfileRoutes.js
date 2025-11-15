// backend/routes/AdmProfileRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { auth, adminOnly } = require('../middlewere/authMiddleware');
const adminProfileController = require('../controllers/adminProfileController');

// Multer setup (saves to backend/uploads)
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // preserve extension
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// GET /api/adm/profile
router.get('/', auth, adminOnly, adminProfileController.getAdminProfile);

// PUT /api/adm/profile/update  (form-data: name, profileImage optional)
router.put('/update', auth, adminOnly, upload.single('profileImage'), adminProfileController.updateAdminProfile);

// PUT /api/adm/profile/update-image (form-data: profileImage)
router.put('/update-image', auth, adminOnly, upload.single('profileImage'), adminProfileController.updateProfileImage);

// PUT /api/adm/profile/remove-image
router.put('/remove-image', auth, adminOnly, adminProfileController.removeProfileImage);

// PUT /api/adm/profile/change-password
router.put('/change-password', auth, adminOnly, adminProfileController.changeAdminPassword);

// DELETE /api/adm/profile/delete-account
router.delete('/delete-account', auth, adminOnly, adminProfileController.deleteAdminAccount);

module.exports = router;
