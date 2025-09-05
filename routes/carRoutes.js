const express = require("express");
const router = express.Router();
const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAvailableCars,
  searchCars,
  deleteCarImage,
  getSimilarCars,
} = require("../controllers/carController");
const { uploadCarImages, handleUploadError } = require("../middleware/upload");

// @route   GET /api/cars
// @desc    Get all cars
// @access  Public
router.get("/", getAllCars);

// @route   GET /api/cars/:id/similar
// @desc    Get similar cars
// @access  Public
router.get("/:id/similar", getSimilarCars);

// @route   GET /api/cars/available
// @desc    Get all available cars
// @access  Public
router.get("/available", getAvailableCars);

// @route   GET /api/cars/search
// @desc    Search cars by criteria
// @access  Public
router.get("/search", searchCars);

// @route   GET /api/cars/:id
// @desc    Get single car by ID
// @access  Public
router.get("/:id", getCarById);

// @route   POST /api/cars
// @desc    Create new car
// @access  Private (Admin only)
router.post("/", uploadCarImages, createCar);

// @route   PUT /api/cars/:id
// @desc    Update car
// @access  Private (Admin only)
router.put("/:id", uploadCarImages, updateCar);

// @route   DELETE /api/cars/:id
// @desc    Delete car
// @access  Private (Admin only)
router.delete("/:id", deleteCar);

// @route   DELETE /api/cars/:carId/images/:imageIndex
// @desc    Delete specific image from car
// @access  Private (Admin only)
router.delete("/:carId/images/:imageIndex", deleteCarImage);

// Error handling middleware for upload errors
router.use(handleUploadError);

module.exports = router;
