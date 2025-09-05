const Branch = require("../models/Branch");

const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid branch ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const createBranch = async (req, res) => {
  try {
    const { name, address, city, country, latitude, longitude, location } = req.body;

    let coordinates;
    
    if (latitude && longitude) {
      coordinates = [parseFloat(longitude), parseFloat(latitude)];
    } else if (location && location.coordinates && location.coordinates.length === 2) {
      coordinates = [parseFloat(location.coordinates[0]), parseFloat(location.coordinates[1])];
    } else {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required (either as separate fields or in location.coordinates array)",
      });
    }

    const branch = new Branch({
      name,
      address,
      city,
      country,
      location: {
        type: "Point",
        coordinates: coordinates,
      },
    });

    await branch.save();

    res.status(201).json({
      success: true,
      data: branch,
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

const updateBranch = async (req, res) => {
  try {
    const { name, address, city, country, latitude, longitude, location } = req.body;

    const updateData = { name, address, city, country };

    let coordinates;
    
    // Handle both formats: separate lat/lng or location object
    if (latitude && longitude) {
      coordinates = [parseFloat(longitude), parseFloat(latitude)];
    } else if (location && location.coordinates && location.coordinates.length === 2) {
      coordinates = [parseFloat(location.coordinates[0]), parseFloat(location.coordinates[1])];
    }

    if (coordinates) {
      updateData.location = {
        type: "Point",
        coordinates: coordinates,
      };
    }

    const branch = await Branch.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid branch ID format",
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

const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        error: "Branch not found",
      });
    }

    await Branch.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid branch ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getBranchesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const branches = await Branch.find({
      city: { $regex: city, $options: "i" },
    });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getNearbyBranches = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in kilometers

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    const branches = await Branch.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radius * 1000,
        },
      },
    }).limit(10);

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const searchBranches = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const branches = await Branch.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ],
    });

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchesByCity,
  getNearbyBranches,
  searchBranches,
};
