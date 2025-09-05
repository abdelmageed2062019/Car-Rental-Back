const Rental = require("../models/Rental");
const Car = require("../models/Car");
const User = require("../models/User");

const createRental = async (req, res) => {
  try {
    const {
      carId,
      startDate,
      endDate,
      pickup,
      return: returnDetails,
      driverInfo,
      insurance,
      specialRequests,
      payment,
    } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    if (!car.isAvailable) {
      return res.status(400).json({
        success: false,
        error: "Car is not available for rental",
      });
    }

    const existingRental = await Rental.findOne({
      carId,
      status: { $in: ["pending", "confirmed", "active"] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (existingRental) {
      return res.status(400).json({
        success: false,
        error: "Car is not available for the selected dates",
      });
    }

    const pricePerDay = car.pricePerDay;

    const rentalData = {
      userId: req.user.id,
      carId,
      startDate,
      endDate,
      pricePerDay,
      pickup,
      return: returnDetails,
      driverInfo,
      insurance,
      specialRequests,
      payment,
    };

    if (car.technicalSpecs && car.technicalSpecs.mileage) {
      rentalData.carCondition = {
        pickup: {
          mileage: car.technicalSpecs.mileage,
        },
      };
    }

    const rental = new Rental(rentalData);
    await rental.save();

    // Update user's rental history
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          rentalHistory: {
            rentalId: rental._id,
            carId: carId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            totalCost: rental.finalAmount,
            status: "ongoing"
          }
        }
      }
    );

    await Car.findByIdAndUpdate(carId, { isAvailable: false });

    await rental.populate([
      { path: "carId", select: "name brand model year images" },
      { path: "userId", select: "firstName lastName email" },
      { path: "pickup.branch", select: "name address city" },
      { path: "return.branch", select: "name address city" },
    ]);

    res.status(201).json({
      success: true,
      message: "Rental created successfully",
      data: rental,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getAllRentals = async (req, res) => {
  try {
    const {
      status,
      userId,
      carId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (carId) query.carId = carId;
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const rentals = await Rental.find(query)
      .populate("userId", "firstName lastName email")
      .populate("carId", "name brand model year")
      .populate("pickup.branch", "name address city")
      .populate("return.branch", "name address city")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getMyRentals = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { userId: req.user.id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const rentals = await Rental.find(query)
      .populate("carId", "name brand model year images pricePerDay")
      .populate("pickup.branch", "name address city")
      .populate("return.branch", "name address city")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("userId", "firstName lastName email phone")
      .populate(
        "carId",
        "name brand model year images pricePerDay technicalSpecs"
      )
      .populate("pickup.branch", "name address city")
      .populate("return.branch", "name address city");

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      rental.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: rental,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid rental ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const updateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      rental.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (["completed", "cancelled"].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        error: "Cannot update completed or cancelled rental",
      });
    }

    const updateData = { ...req.body };

    delete updateData.userId;
    delete updateData.carId;
    delete updateData.status;
    delete updateData.totalPrice;
    delete updateData.finalAmount;

    const updatedRental = await Rental.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate([
      { path: "userId", select: "firstName lastName email" },
      { path: "carId", select: "name brand model year" },
    ]);

    res.status(200).json({
      success: true,
      message: "Rental updated successfully",
      data: updatedRental,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid rental ID format",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const confirmRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    if (rental.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Rental can only be confirmed if status is pending",
      });
    }

    rental.status = "confirmed";
    rental.confirmedAt = Date.now();
    await rental.save();

    // Update user's rental history status
    await User.findByIdAndUpdate(
      rental.userId,
      {
        $set: {
          "rentalHistory.$[elem].status": "ongoing"
        }
      },
      {
        arrayFilters: [{ "elem.rentalId": rental._id }]
      }
    );

    await rental.populate([
      { path: "userId", select: "firstName lastName email" },
      { path: "carId", select: "name brand model year" },
    ]);

    res.status(200).json({
      success: true,
      message: "Rental confirmed successfully",
      data: rental,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid rental ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const activateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    if (rental.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        error: "Rental can only be activated if status is confirmed",
      });
    }

    const now = new Date();
    if (now < rental.startDate) {
      return res.status(400).json({
        success: false,
        error: "Cannot activate rental before start date",
      });
    }

    rental.status = "active";
    rental.activatedAt = Date.now();
    await rental.save();

    await rental.populate([
      { path: "userId", select: "firstName lastName email" },
      { path: "carId", select: "name brand model year" },
    ]);

    res.status(200).json({
      success: true,
      message: "Rental activated successfully",
      data: rental,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid rental ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const completeRental = async (req, res) => {
  try {
    const { carCondition, actualReturnTime } = req.body;

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    if (rental.status !== "active") {
      return res.status(400).json({
        success: false,
        error: "Rental can only be completed if status is active",
      });
    }

    // Update car condition on return
    if (carCondition && carCondition.return) {
      rental.carCondition.return = {
        ...rental.carCondition.return,
        ...carCondition.return,
      };
    }

    rental.return.actualReturnTime = actualReturnTime || new Date();
    rental.status = "completed";
    rental.completedAt = Date.now();

    await rental.save();

    // Update user's rental history status to completed
    await User.findByIdAndUpdate(
      rental.userId,
      {
        $set: {
          "rentalHistory.$[elem].status": "completed"
        }
      },
      {
        arrayFilters: [{ "elem.rentalId": rental._id }]
      }
    );

    await Car.findByIdAndUpdate(rental.carId, { isAvailable: true });

    await rental.populate([
      { path: "userId", select: "firstName lastName email" },
      { path: "carId", select: "name brand model year" },
    ]);

    res.status(200).json({
      success: true,
      message: "Rental completed successfully",
      data: rental,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid rental ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      rental.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    if (!rental.canCancel) {
      return res.status(400).json({
        success: false,
        error: "Rental cannot be cancelled",
      });
    }

    if (["completed", "cancelled"].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        error: "Rental is already completed or cancelled",
      });
    }

    rental.status = "cancelled";
    rental.cancelledAt = Date.now();
    await rental.save();

    // Update user's rental history status to cancelled
    await User.findByIdAndUpdate(
      rental.userId,
      {
        $set: {
          "rentalHistory.$[elem].status": "cancelled"
        }
      },
      {
        arrayFilters: [{ "elem.rentalId": rental._id }]
      }
    );

    if (["confirmed", "active"].includes(rental.status)) {
      await Car.findByIdAndUpdate(rental.carId, { isAvailable: true });
    }

    const refundAmount = rental.calculateRefund();

    await rental.populate([
      { path: "userId", select: "firstName lastName email" },
      { path: "carId", select: "name brand model year" },
    ]);

    res.status(200).json({
      success: true,
      message: "Rental cancelled successfully",
      refundAmount,
      data: rental,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid rental ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    if (!["pending", "cancelled"].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete active, completed, or confirmed rentals",
      });
    }

    await Rental.findByIdAndDelete(req.params.id);

    if (rental.status === "confirmed") {
      await Car.findByIdAndUpdate(rental.carId, { isAvailable: true });
    }

    res.status(200).json({
      success: true,
      message: "Rental deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid rental ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getRentalStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalRentals,
      pendingRentals,
      confirmedRentals,
      activeRentals,
      completedRentals,
      cancelledRentals,
      totalRevenue,
    ] = await Promise.all([
      Rental.countDocuments(dateFilter),
      Rental.countDocuments({ ...dateFilter, status: "pending" }),
      Rental.countDocuments({ ...dateFilter, status: "confirmed" }),
      Rental.countDocuments({ ...dateFilter, status: "active" }),
      Rental.countDocuments({ ...dateFilter, status: "completed" }),
      Rental.countDocuments({ ...dateFilter, status: "cancelled" }),
      Rental.aggregate([
        { $match: { ...dateFilter, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRentals,
        pendingRentals,
        confirmedRentals,
        activeRentals,
        completedRentals,
        cancelledRentals,
        totalRevenue: revenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const searchRentals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      carId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    let query = {};

    if (status) query.status = status;
    
    if (userId) query.userId = userId;
    
    if (carId) query.carId = carId;
    
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      query.finalAmount = {};
      if (minAmount) query.finalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.finalAmount.$lte = parseFloat(maxAmount);
    }

    const sortObj = {};
    const validSortFields = ['createdAt', 'startDate', 'endDate', 'finalAmount', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    sortObj[sortField] = sortDirection;

    const skip = (page - 1) * limit;

    const rentals = await Rental.find(query)
      .populate("userId", "firstName lastName email")
      .populate("carId", "name brand model year")
      .populate("pickup.branch", "name address city")
      .populate("return.branch", "name address city")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      sortBy: sortField,
      sortOrder: sortOrder,
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

module.exports = {
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
};
