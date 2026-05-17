const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { User, Order } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "myfuels_secret_key";

// Middleware to authenticate JWT tokens
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    next();
  });
};

// Auth Routes
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
// User Routes
app.post("/api/orders", auth, async (req, res) => {
  try {
    const { fuelType, quantity, deliveryLocation, preferredTime } = req.body;
    if (!fuelType || !quantity || !deliveryLocation || !preferredTime)
      return res.status(400).json({ error: "All fields required" });
    const order = await Order.create({
      user: req.user.id,
      userName: req.user.name,
      fuelType,
      quantity,
      deliveryLocation,
      preferredTime,
    });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
app.get("/api/orders/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
// Admin Routes
app.get("/api/admin/orders", adminAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (status && status !== "all") query.status = status;
    if (search) query.$or = [
      { deliveryLocation: { $regex: search, $options: "i" } },
      { userName: { $regex: search, $options: "i" } },
      { fuelType: { $regex: search, $options: "i" } },
    ];
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
app.patch("/api/admin/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Accepted", "Out for Delivery", "Delivered"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
 
app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: "Pending" });
    const delivered = await Order.countDocuments({ status: "Delivered" });
    const outForDelivery = await Order.countDocuments({ status: "Out for Delivery" });
    res.json({ total, pending, delivered, outForDelivery });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/myfuels")
  .then(async () => {
    console.log("MongoDB connected");
    const admin = await User.findOne({ email: "admin@myfuels.com" });
    if (!admin) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({ name: "Admin", email: "admin@myfuels.com", password: hashed, role: "admin" });
      console.log("Default admin created: admin@myfuels.com / admin123");
    }
    app.listen(5000, () => console.log("Server running on http://localhost:5000"));
  })
  .catch((e) => console.error("DB Error:", e.message));