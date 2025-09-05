const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    driverLicense: {
      number: {
        type: String,
        required: [true, "Driver license number is required"],
        unique: true,
      },
      expiryDate: {
        type: Date,
        required: [true, "Driver license expiry date is required"],
      },
      issuingCountry: {
        type: String,
        required: [true, "Issuing country is required"],
      },
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      zipCode: {
        type: String,
        required: [true, "ZIP code is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    preferences: {
      preferredCarTypes: [
        {
          type: String,
          enum: ["Sedan", "SUV", "Sports", "Luxury", "Economy", "Van"],
        },
      ],
      preferredFuelType: {
        type: String,
        enum: ["Petrol", "Diesel", "Electric", "Hybrid", "Any"],
      },
      maxDailyBudget: {
        type: Number,
        min: 0,
      },
    },
    rentalHistory: [
      {
        rentalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Rental",
        },
        carId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Car",
        },
        startDate: Date,
        endDate: Date,
        totalCost: Number,
        status: {
          type: String,
          enum: ["completed", "cancelled", "ongoing"],
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

userSchema.methods.isManagerOrAdmin = function () {
  return this.role === "admin" || this.role === "manager";
};

userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
