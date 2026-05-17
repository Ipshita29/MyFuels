const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "CNG", "LPG"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    deliveryLocation: { type: String, required: true },
    preferredTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Out for Delivery", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  Order: mongoose.model("Order", orderSchema),
};