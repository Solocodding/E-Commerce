const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const fs = require('fs');
const path = require('path');
const upload = require('../middlewares/multer');
const { uploadUserPhoto } = require("../controller/productController");
const bcrypt = require("bcrypt");
const User = require("../model/User");
const Product = require("../model/Product");

router.get("/", verifyToken, async (req, res) => {
  try {
    const products = await Product.find({isDeleted: false});
    res.render("./products/index", { user: req.user, products: products, isAuthenticated: req.isAuthenticated });
  } catch (err) {
    // console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


router.get('/profile', verifyToken, (req, res) => {
  if (!req.isAuthenticated) return res.redirect('/auth/login');

  const userId = req.user._id;
  const userImagePath = path.join(__dirname, '..', 'uploads/user', `${userId}.jpg`);

  // Check if the file exists
  fs.access(userImagePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, use default image
      req.user.profilePicture = '/uploads/user/default-profile.jpg';
    } else {
      // Use the uploaded profile picture
      req.user.profilePicture = `/uploads/user/${userId}.jpg`;
    }
    // Render the profile with either the uploaded image or the default one
    res.render('products/profile', { isAuthenticated: req.isAuthenticated, user: req.user });
  });
});

router.post('/uploadPhoto/:userId', upload.single('image'), uploadUserPhoto);

router.post('/changePassword', async (req, res) => {
  const { currentPassword, newPassword, userId } = req.body;

  // console.log(currentPassword, newPassword, userId);

  try {
    // Fetch the user from the database by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;