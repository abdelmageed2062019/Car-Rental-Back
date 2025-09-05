const Car = require("../models/Car");
const { deleteImageFiles } = require("../utils/imageUtils");

const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getSimilarCars = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const minPrice = car.pricePerDay * 0.8;
    const maxPrice = car.pricePerDay * 1.2;

    const similarCars = await Car.find({
      _id: { $ne: id },
      pricePerDay: { $gte: minPrice, $lte: maxPrice },
    }).limit(3);

    res.json(similarCars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching similar cars" });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid car ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const createCar = async (req, res) => {
  try {
    const { name, brand, pricePerDay, technicalSpecs, equipment } = req.body;

    const parsedSpecs = technicalSpecs ? JSON.parse(technicalSpecs) : {};
    const parsedEquipment = equipment ? JSON.parse(equipment) : {};

    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const car = new Car({
      name,
      brand,
      pricePerDay,
      images,
      technicalSpecs: parsedSpecs,
      equipment: parsedEquipment,
    });

    await car.save();

    res.status(201).json({
      success: true,
      data: car,
    });
  } catch (error) {
    if (req.files && req.files.length > 0) {
      await deleteImageFiles(
        req.files.map((file) => `/uploads/${file.filename}`)
      );
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

const updateCar = async (req, res) => {
  try {
    const existingCar = await Car.findById(req.params.id);
    if (!existingCar) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    let images = existingCar.images;
    if (req.files && req.files.length > 0) {
      if (req.body.replaceImageIndex !== undefined) {
        const replaceIndex = parseInt(req.body.replaceImageIndex);
        if (replaceIndex >= 0 && replaceIndex < existingCar.images.length) {
          await deleteImageFiles([existingCar.images[replaceIndex]]);

          const newImages = [...existingCar.images];
          newImages[replaceIndex] = `/uploads/${req.files[0].filename}`;
          images = newImages;
        } else {
          await deleteImageFiles(existingCar.images);
          const newImages = req.files.map(
            (file) => `/uploads/${file.filename}`
          );
          images = newImages;
        }
      } else {
        if (existingCar.images && existingCar.images.length > 0) {
          await deleteImageFiles(existingCar.images);
        }
        const newImages = req.files.map((file) => `/uploads/${file.filename}`);
        images = newImages;
      }
    }

    const updateData = {
      ...req.body,
      images,
    };

    if (
      req.body.technicalSpecs &&
      typeof req.body.technicalSpecs === "string"
    ) {
      updateData.technicalSpecs = JSON.parse(req.body.technicalSpecs);
    }
    if (req.body.equipment && typeof req.body.equipment === "string") {
      updateData.equipment = JSON.parse(req.body.equipment);
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    if (req.files && req.files.length > 0) {
      await deleteImageFiles(
        req.files.map((file) => `/uploads/${file.filename}`)
      );
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

const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    if (car.images && car.images.length > 0) {
      await deleteImageFiles(car.images);
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const getAvailableCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvailable: true });
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const searchCars = async (req, res) => {
  try {
    const { brand, gearBox, fuel, minPrice, maxPrice } = req.query;

    let query = {};

    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (gearBox) query["technicalSpecs.gearBox"] = gearBox;
    if (fuel) query["technicalSpecs.fuel"] = fuel;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const cars = await Car.find(query);

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

const deleteCarImage = async (req, res) => {
  try {
    const { carId, imageIndex } = req.params;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        error: "Car not found",
      });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= car.images.length) {
      return res.status(400).json({
        success: false,
        error: "Invalid image index",
      });
    }

    await deleteImageFiles([car.images[index]]);

    car.images.splice(index, 1);
    await car.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: car,
    });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid car ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getAvailableCars,
  searchCars,
  deleteCarImage,
  getSimilarCars,
};
