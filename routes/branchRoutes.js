const express = require("express");
const router = express.Router();
const {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchesByCity,
  getNearbyBranches,
  searchBranches,
} = require("../controllers/branchController");
const { protect, admin } = require("../middleware/auth");

// @route   GET /api/branches
// @desc    Get all branches
// @access  Public
router.get("/", getAllBranches);

// @route   GET /api/branches/search
// @desc    Search branches
// @access  Public
router.get("/search", searchBranches);

// @route   GET /api/branches/nearby
// @desc    Find nearby branches within radius
// @access  Public
router.get("/nearby", getNearbyBranches);

// @route   GET /api/branches/city/:city
// @desc    Get branches by city
// @access  Public
router.get("/city/:city", getBranchesByCity);

// @route   GET /api/branches/:id
// @desc    Get single branch by ID
// @access  Public
router.get("/:id", getBranchById);

// @route   POST /api/branches
// @desc    Create new branch
// @access  Private (Admin only)
router.post("/", protect, admin, createBranch);

// @route   PUT /api/branches/:id
// @desc    Update branch
// @access  Private (Admin only)
router.put("/:id", protect, admin, updateBranch);

// @route   DELETE /api/branches/:id
// @desc    Delete branch
// @access  Private (Admin only)
router.delete("/:id", protect, admin, deleteBranch);

module.exports = router;
