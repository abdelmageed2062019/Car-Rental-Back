const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUser,
  searchUsers,
} = require("../controllers/userController");
const { protect, admin, managerOrAdmin } = require("../middleware/auth");

// Public routes (no authentication required)
// @route   POST /api/users/register
// @desc    Register new user
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post("/login", loginUser);

// Private routes (authentication required)
// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, updateUserProfile);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put("/change-password", protect, changePassword);

// Admin routes (admin role required)
// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get("/", protect, admin, getAllUsers);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private/Admin
router.get("/search", protect, admin, searchUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get("/:id", protect, admin, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Private/Admin
router.put("/:id", protect, admin, updateUserById);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
