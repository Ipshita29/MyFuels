require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { User, Order } = require("./models");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "myfuels_secret_2024";
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Middleware ────────────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });
    next();
  });
};

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });
    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Invalid email or password" });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── User Routes ───────────────────────────────────────────────────────────────
app.post("/api/orders", auth, async (req, res) => {
  try {
    const { fuelType, quantity, deliveryLocation, preferredTime } = req.body;
    if (!fuelType || !quantity || !deliveryLocation || !preferredTime)
      return res.status(400).json({ error: "All order fields are required" });
    const order = await Order.create({
      user: req.user.id,
      userName: req.user.name,
      fuelType,
      quantity: Number(quantity),
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

// ── Admin Routes ──────────────────────────────────────────────────────────────
app.get("/api/admin/orders", adminAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { deliveryLocation: { $regex: search, $options: "i" } },
        { fuelType: { $regex: search, $options: "i" } },
      ];
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/admin/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Pending", "Accepted", "Out for Delivery", "Delivered"];
    if (!valid.includes(status))
      return res.status(400).json({ error: "Invalid status value" });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    const [total, pending, accepted, outForDelivery, delivered] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Accepted" }),
      Order.countDocuments({ status: "Out for Delivery" }),
      Order.countDocuments({ status: "Delivered" }),
    ]);
    res.json({ total, pending, accepted, outForDelivery, delivered });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/myfuels")
  .then(async () => {
    console.log("MongoDB connected");
    const existing = await User.findOne({ email: "admin@myfuels.com" });
    if (!existing) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Admin",
        email: "admin@myfuels.com",
        password: hashed,
        role: "admin",
      });
      console.log("Admin created → admin@myfuels.com / admin123");
    }
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });