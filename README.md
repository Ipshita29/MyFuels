# MyFuels — Fuel Order Management System

A full-stack fuel order management platform built for the MyFuels. The system covers the complete operational workflow — from a customer placing a fuel order to an admin dispatching and tracking delivery in real time.

---

## Demo Credentials

**Admin Account**
- Email: admin@myfuels.com
- Password: admin123

**User Account**
- Email: user@example.com
- Password: user123

Note: The admin account is auto-created on first server boot. The user account must be created via the signup page, or you can seed it manually (see seeding section below).

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast builds, hot reload, minimal config |
| Styling | Vanilla CSS with custom properties | No build-time dependencies, full control |
| Backend | Node.js + Express | Lightweight, unopinionated, fast to iterate |
| Database | MongoDB + Mongoose | Flexible schema, great for document-style order data |
| Auth | JWT + bcryptjs | Stateless, scalable, industry standard |
| Icons | Material Symbols Outlined | Consistent icon system, no extra bundle weight |
| Fonts | Hanken Grotesk + JetBrains Mono | Clean, professional, readable at all sizes |

---

## Project Structure

```
myfuels/
├── client/                        # React frontend (Vite)
│   ├── index.html                 # Entry HTML, loads fonts and Material icons
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx               # React root, mounts AuthProvider
│       ├── App.jsx                # All pages: Auth, Dashboard, Orders, History, Admin
│       ├── api.js                 # All API call functions (single source of truth)
│       ├── store.jsx              # Auth context: user state, login, logout
│       └── index.css              # Design tokens (CSS variables), all component styles
│
├── server/                        # Express backend
│   ├── index.js                   # Server entry: all routes, middleware, DB connection
│   ├── models.js                  # Mongoose schemas: User, Order
│   ├── package.json
│   └── .env                       # Environment variables (not committed to git)
│
└── README.md
```

The structure is intentionally minimal — maximum functionality with minimum files. Every file has a single clear responsibility.

---

## Architecture Overview

```
Browser (React)
      |
      | HTTP + JWT in Authorization header
      v
Express Server (Node.js)
      |
      |-- POST /api/signup          Create user account
      |-- POST /api/login           Authenticate, return JWT
      |-- POST /api/orders          Place order (auth required)
      |-- GET  /api/orders/my       Get current user's orders (auth required)
      |-- GET  /api/admin/orders    Get all orders with search/filter (admin only)
      |-- PATCH /api/admin/orders/:id/status  Update order status (admin only)
      |-- GET  /api/admin/stats     Aggregated stats (admin only)
      |
      v
MongoDB Atlas (Cloud)
      |
      |-- users collection          Stores accounts with hashed passwords
      |-- orders collection         Stores all fuel orders with status
```

**Auth flow**: User logs in → server verifies password with bcrypt → signs a JWT → client stores token in localStorage → all subsequent requests send token in the `Authorization: Bearer <token>` header → server middleware verifies token on every protected route.

---

## Database Models

**User**
```
name          String    required
email         String    required, unique, indexed
password      String    bcrypt hashed, never returned in responses
role          String    "user" | "admin", default "user"
createdAt     Date      auto
updatedAt     Date      auto
```

**Order**
```
user          ObjectId  ref to User, required
userName      String    denormalized for admin display without joins
fuelType      String    enum: Petrol | Diesel | CNG | LPG
quantity      Number    in litres, min 1
deliveryLocation  String
preferredTime String    datetime string
status        String    enum: Pending | Accepted | Out for Delivery | Delivered
createdAt     Date      auto
updatedAt     Date      auto
```

---

## API Reference

All endpoints return JSON. Protected endpoints require the header:
```
Authorization: Bearer <token>
```

### Auth

```
POST /api/signup
Body: { name, email, password }
Returns: { token, user: { id, name, email, role } }

POST /api/login
Body: { email, password }
Returns: { token, user: { id, name, email, role } }
```

### User (JWT required)

```
POST /api/orders
Body: { fuelType, quantity, deliveryLocation, preferredTime }
Returns: Order object

GET /api/orders/my
Returns: Array of orders for the authenticated user, sorted newest first
```

### Admin (Admin JWT required)

```
GET /api/admin/orders?search=&status=
Returns: Filtered array of all orders

PATCH /api/admin/orders/:id/status
Body: { status }
Returns: Updated order object

GET /api/admin/stats
Returns: { total, pending, accepted, outForDelivery, delivered }
```

---

## Running Locally

### Prerequisites
- Node.js v18 or higher
- A free MongoDB Atlas account (or local MongoDB running on port 27017)

### Step 1 — MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free account
2. Click "Build a Database" and select the M0 Free tier
3. Choose any cloud region
4. Create a database user with a username and password — save these
5. Under "Network Access", click "Add IP Address" and select "Allow Access from Anywhere" (0.0.0.0/0)
6. Go to "Database", click "Connect", then "Drivers"
7. Copy the connection string. It will look like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace USERNAME and PASSWORD with your actual credentials

### Step 2 — Configure Environment

Open `server/.env` and update:

```
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/myfuels?retryWrites=true&w=majority
JWT_SECRET=myfuels_super_secret_key_2024
PORT=5000
```

### Step 3 — Start the Server

```bash
cd server
npm install
npm run dev
```

You should see all three lines:
```
MongoDB connected
Admin created: admin@myfuels.com / admin123
Server running on http://localhost:5000
```

If you do not see "MongoDB connected", your MONGO_URI is incorrect. Double check the username, password, and that your IP is whitelisted in Atlas.

### Step 4 — Start the Frontend

Open a second terminal window and run:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Step 5 — Create the Demo User

Option A — Sign up through the UI:
- Click "Sign up" on the login page
- Use email: user@example.com and password: user123

Option B — Seed via terminal (optional):
```bash
cd server
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const exists = await User.findOne({ email: 'user@example.com' });
  if (!exists) {
    const hashed = await bcrypt.hash('user123', 10);
    await User.create({ name: 'Demo User', email: 'user@example.com', password: hashed });
    console.log('User created');
  } else {
    console.log('User already exists');
  }
  process.exit(0);
});
"
```

---

## Deployment

The recommended setup is Render (backend) and Vercel (frontend) — both have free tiers and deploy directly from GitHub.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit: MyFuels fuel order management system"
```

Go to github.com, create a new repository, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/myfuels.git
git branch -M main
git push -u origin main
```

### Step 2 — Deploy Backend to Render

1. Go to https://render.com and sign up with your GitHub account
2. Click "New" then "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: myfuels-api
   - Root Directory: server
   - Build Command: npm install
   - Start Command: node index.js
   - Instance Type: Free
5. Click "Environment" and add these variables:
   ```
   MONGO_URI     = your full MongoDB Atlas connection string
   JWT_SECRET    = myfuels_super_secret_key_2024
   PORT          = 5000
   ```
6. Click "Create Web Service"
7. Wait for the deployment to complete (2-3 minutes)
8. Copy your backend URL — it will look like: https://myfuels-api.onrender.com

### Step 3 — Update Frontend API URL

Open `client/src/api.js` and change the first line from:
```js
const BASE = "http://localhost:5000/api";
```
to:
```js
const BASE = "https://myfuels-api.onrender.com/api";
```
Replace the URL with your actual Render URL.

### Step 4 — Deploy Frontend to Vercel

1. Go to https://vercel.com and sign up with your GitHub account
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - Root Directory: client
   - Framework Preset: Vite (auto-detected)
   - Build Command: npm run build (default)
   - Output Directory: dist (default)
5. Click "Deploy"
6. Wait about 60 seconds

Your live URL will be something like: https://myfuels.vercel.app

### Step 5 — Commit and Push the URL Change

```bash
git add .
git commit -m "update api url to production"
git push
```

Vercel will automatically redeploy on every push to main.

---

## Features Implemented

**User Side**
- Signup and login with JWT authentication
- Dashboard with order stats (total, active, pending, delivered)
- Place a new fuel order (fuel type, quantity, location, preferred time)
- Full order history with clickable rows
- Live status tracker showing order progress through all 4 stages

**Admin Side**
- Persistent sidebar navigation
- Stats overview (total, pending, accepted, en route, delivered)
- Full orders table with all customer orders
- Contextual action buttons per order status (Accept, Dispatch, Mark Delivered)
- Search orders by customer name, location, or fuel type
- Filter orders by status

**Backend**
- JWT-based authentication with role checks
- Password hashing with bcrypt (10 salt rounds)
- Protected routes with auth and adminAuth middleware
- Full CRUD for orders
- Search and filter with MongoDB regex queries
- Aggregated stats endpoint
- Auto-creates admin account on first boot

---

## Design Decisions

**Single `index.js` for all routes** — in a startup context, speed and readability matter more than premature separation. All routes are visible in one file, making debugging and onboarding fast. Routes can be split into a `/routes` folder as the team grows without changing any logic.

**Denormalized `userName` on orders** — storing the user's name directly on the order avoids a JOIN/populate on every admin query. This is a common pattern for read-heavy admin dashboards where order history is immutable.

**CSS custom properties instead of a framework** — gives full design control with zero build-time dependencies. The entire design system is defined in `:root` variables in `index.css`, making global theme changes a single-line edit.

**JWT in localStorage** — acceptable for a demo and internal tool. For production, HttpOnly cookies would be the more secure approach to prevent XSS token theft.

---

## Local Development Notes

- The frontend runs on port 5173 and the backend on port 5000
- CORS is enabled for all origins in development (restrict in production)
- `nodemon` is used in dev mode for auto-restart on file changes
- All API errors return a consistent `{ error: "message" }` shape
- The `.env` file is not committed to git — never commit secrets

---

## Author

Built for the MyFuels Internship Technical Assessment, Round 2.