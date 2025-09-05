const express = require("express");
const router = express.Router();
const {
  createRental,
  getAllRentals,
  getMyRentals,
  getRentalById,
  updateRental,
  confirmRental,
  activateRental,
  completeRental,
  cancelRental,
  deleteRental,
  getRentalStats,
  searchRentals,
} = require("../controllers/rentalController");
const { protect, admin, managerOrAdmin } = require("../middleware/auth");

// User routes (authentication required)
// @route   POST /api/rentals
// @desc    Create new rental
// @access  Private
router.post("/", protect, createRental);

// @route   GET /api/rentals/my-rentals
// @desc    Get user's rentals
// @access  Private
router.get("/my-rentals", protect, getMyRentals);

// @route   GET /api/rentals/:id
// @desc    Get rental by ID
// @access  Private
router.get("/:id", protect, getRentalById);

// @route   PUT /api/rentals/:id
// @desc    Update rental
// @access  Private
router.put("/:id", protect, updateRental);

// @route   PUT /api/rentals/:id/cancel
// @desc    Cancel rental
// @access  Private
router.put("/:id/cancel", protect, cancelRental);

// Admin/Manager routes
// @route   GET /api/rentals
// @desc    Get all rentals
// @access  Private/Admin
router.get("/", protect, managerOrAdmin, getAllRentals);

// @route   GET /api/rentals/search
// @desc    Search rentals
// @access  Private/Admin
router.get("/search", protect, managerOrAdmin, searchRentals);

// @route   GET /api/rentals/admin
// @desc    Admin route for all rentals (alias for /)
// @access  Private/Admin
router.get("/admin", protect, managerOrAdmin, getAllRentals);

// @route   GET /api/rentals/stats/overview
// @desc    Get rental statistics
// @access  Private/Admin
router.get("/stats/overview", protect, managerOrAdmin, getRentalStats);

// @route   PUT /api/rentals/:id/confirm
// @desc    Confirm rental
// @access  Private/Admin
router.put("/:id/confirm", protect, managerOrAdmin, confirmRental);

// @route   PUT /api/rentals/:id/activate
// @desc    Activate rental
// @access  Private/Admin
router.put("/:id/activate", protect, managerOrAdmin, activateRental);

// @route   PUT /api/rentals/:id/complete
// @desc    Complete rental
// @access  Private/Admin
router.put("/:id/complete", protect, managerOrAdmin, completeRental);

// @route   DELETE /api/rentals/:id
// @desc    Delete rental
// @access  Private/Admin
router.delete("/:id", protect, admin, deleteRental);

module.exports = router;
