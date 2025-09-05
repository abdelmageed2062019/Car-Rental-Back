const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "Car ID is required"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Start date must be in the future",
      },
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },

    duration: {
      type: Number,
      default: null,
      min: [1, "Rental must be at least 1 day"],
    },

    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price per day cannot be negative"],
    },

    totalPrice: {
      type: Number,
      default: null,
      min: [0, "Total price cannot be negative"],
    },

    additionalFees: {
      insurance: {
        type: Number,
        default: 0,
        min: [0, "Insurance fee cannot be negative"],
      },
      fuel: {
        type: Number,
        default: 0,
        min: [0, "Fuel fee cannot be negative"],
      },
      cleaning: {
        type: Number,
        default: 0,
        min: [0, "Cleaning fee cannot be negative"],
      },
      lateReturn: {
        type: Number,
        default: 0,
        min: [0, "Late return fee cannot be negative"],
      },
    },

    finalAmount: {
      type: Number,
      default: null,
      min: [0, "Final amount cannot be negative"],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "overdue",
      ],
      default: "pending",
    },

    payment: {
      method: {
        type: String,
        enum: [
          "credit_card",
          "debit_card",
          "cash",
          "bank_transfer",
          "digital_wallet",
        ],
        required: [true, "Payment method is required"],
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: {
        type: String,
        default: null,
      },
      paidAt: {
        type: Date,
        default: null,
      },
    },

    pickup: {
      location: {
        type: String,
        required: [true, "Pickup location is required"],
      },
      branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: [true, "Pickup branch is required"],
      },
      time: {
        type: Date,
        required: [true, "Pickup time is required"],
      },
      notes: {
        type: String,
        default: "",
      },
    },

    return: {
      location: {
        type: String,
        required: [true, "Return location is required"],
      },
      branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: [true, "Return branch is required"],
      },
      time: {
        type: Date,
        default: null,
      },
      notes: {
        type: String,
        default: "",
      },
      actualReturnTime: {
        type: Date,
        default: null,
      },
    },

    carCondition: {
      pickup: {
        fuelLevel: {
          type: Number,
          min: [0, "Fuel level cannot be negative"],
          max: [100, "Fuel level cannot exceed 100%"],
          default: 100,
        },
        mileage: {
          type: Number,
          default: null,
          min: [0, "Mileage cannot be negative"],
        },
        exterior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
          default: "good",
        },
        interior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
          default: "good",
        },
        photos: [
          {
            type: String,
            default: [],
          },
        ],
      },
      return: {
        fuelLevel: {
          type: Number,
          min: [0, "Fuel level cannot be negative"],
          max: [100, "Fuel level cannot exceed 100%"],
          default: null,
        },
        mileage: {
          type: Number,
          default: null,
          min: [0, "Mileage cannot be negative"],
        },
        exterior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
          default: null,
        },
        interior: {
          type: String,
          enum: ["excellent", "good", "fair", "poor"],
          default: null,
        },
        photos: [
          {
            type: String,
            default: [],
          },
        ],
        damageReport: {
          type: String,
          default: "",
        },
      },
    },

    driverInfo: {
      licenseNumber: {
        type: String,
        required: [true, "Driver license number is required"],
      },
      licenseExpiry: {
        type: Date,
        required: [true, "Driver license expiry date is required"],
      },
      additionalDrivers: [
        {
          name: String,
          licenseNumber: String,
          licenseExpiry: Date,
        },
      ],
    },

    insurance: {
      type: {
        type: String,
        enum: ["basic", "standard", "premium", "none"],
        default: "basic",
      },
      coverage: {
        type: Number,
        default: 0,
        min: [0, "Coverage amount cannot be negative"],
      },
      deductible: {
        type: Number,
        default: 0,
        min: [0, "Deductible cannot be negative"],
      },
    },

    cancellationPolicy: {
      allowed: {
        type: Boolean,
        default: true,
      },
      deadline: {
        type: Date,
        default: null,
      },
      refundPercentage: {
        type: Number,
        default: 100,
        min: [0, "Refund percentage cannot be negative"],
        max: [100, "Refund percentage cannot exceed 100%"],
      },
    },

    specialRequests: {
      type: String,
      default: "",
    },

    adminNotes: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    activatedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rentalSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (this.pricePerDay) {
      this.totalPrice = this.duration * this.pricePerDay;

      const additionalFeesTotal =
        (this.additionalFees.insurance || 0) +
        (this.additionalFees.fuel || 0) +
        (this.additionalFees.cleaning || 0) +
        (this.additionalFees.lateReturn || 0);

      this.finalAmount = this.totalPrice + additionalFeesTotal;
    }
  }

  this.updatedAt = Date.now();
  next();
});

rentalSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    this.status === "active" && now >= this.startDate && now <= this.endDate
  );
});

rentalSchema.virtual("isOverdue").get(function () {
  const now = new Date();
  return this.status === "active" && now > this.endDate;
});

rentalSchema.virtual("canCancel").get(function () {
  if (!this.cancellationPolicy.allowed) return false;
  if (!this.cancellationPolicy.deadline) return true;
  return new Date() <= this.cancellationPolicy.deadline;
});

rentalSchema.methods.calculateRefund = function () {
  if (!this.canCancel) return 0;

  const refundPercentage = this.cancellationPolicy.refundPercentage / 100;
  return this.finalAmount * refundPercentage;
};

rentalSchema.methods.activate = function () {
  if (this.status !== "confirmed") {
    throw new Error("Rental must be confirmed before activation");
  }

  this.status = "active";
  this.activatedAt = Date.now();
  return this.save();
};

rentalSchema.methods.complete = function () {
  if (this.status !== "active") {
    throw new Error("Rental must be active before completion");
  }

  this.status = "completed";
  this.completedAt = Date.now();
  return this.save();
};

rentalSchema.methods.cancel = function () {
  if (!this.canCancel) {
    throw new Error("Rental cannot be cancelled");
  }

  this.status = "cancelled";
  this.cancelledAt = Date.now();
  return this.save();
};

rentalSchema.statics.findActiveRentals = function () {
  const now = new Date();
  return this.find({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
};

rentalSchema.statics.findOverdueRentals = function () {
  const now = new Date();
  return this.find({
    status: "active",
    endDate: { $lt: now },
  });
};

rentalSchema.index({ userId: 1, status: 1 });
rentalSchema.index({ carId: 1, status: 1 });
rentalSchema.index({ startDate: 1, endDate: 1 });
rentalSchema.index({ status: 1, createdAt: 1 });

rentalSchema.set("toJSON", { virtuals: true });
rentalSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Rental", rentalSchema);
