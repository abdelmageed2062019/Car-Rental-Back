const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },

  images: [{ type: String }],

  technicalSpecs: {
    gearBox: { type: String, enum: ["Manual", "Automatic"], required: true },
    fuel: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      required: true,
    },
    doors: { type: Number, default: 4 },
    airConditioner: { type: Boolean, default: true },
    seats: { type: Number, default: 5 },
    distance: { type: String, default: "Unlimited" },
  },

  equipment: {
    ABS: { type: Boolean, default: false },
    airBags: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    cruiseControl: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Car", carSchema);
