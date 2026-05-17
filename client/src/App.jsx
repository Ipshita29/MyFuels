import { useState, useEffect } from "react";
import { useAuth } from "./store.jsx";
import * as api from "./api.js";

// ─── Badge ────────────────────────────────────────────────────────────────────
const statusClass = {
  "Pending":            "badge-pending",
  "Accepted":           "badge-accepted",
  "Out for Delivery":   "badge-enroute",
  "Delivered":          "badge-delivered",
};

const Badge = ({ status }) => (
  <span className={`badge ${statusClass[status] || ""}`}>
    <span className="badge-dot" />
    {status}
  </span>
);

// ─── Shared UI ────────────────────────────────────────────────────────────────
const ErrBox = ({ msg }) =>
  msg ? <div className="err-box">{msg}</div> : null;

const FuelIcon = ({ type }) => {
  const icons = {
    Petrol: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        <path d="M4 11h12" />
        <path d="M16 8l4 2v6l-4 2" />
      </svg>
    ),
    Diesel: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="12" rx="9" ry="5" />
        <path d="M3 12v5c0 2.76 4.03 5 9 5s9-2.24 9-5v-5" />
        <path d="M3 7v5" /><path d="M21 7v5" />
      </svg>
    ),
    CNG: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
    LPG: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2C8 2 6 6 6 9c0 4 3 6 3 9h6c0-3 3-5 3-9 0-3-2-7-6-7z" />
        <path d="M9 21h6" />
      </svg>
    ),
  };
  return icons[type] || icons.Petrol;
};

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
const AuthPage = () => {
  const { saveAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await (isLogin ? api.login : api.signup)(form);
      if (res.error) return setError(res.error);
      saveAuth(res.token, res.user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* Left branding */}
      <div className="auth-left">
        <div className="stripe-bar" style={{ left: 56, background: "var(--stripe1)", opacity: 0.25 }} />
        <div className="stripe-bar" style={{ left: 76, background: "var(--stripe2)", opacity: 0.18 }} />
        <div className="stripe-bar" style={{ left: 96, background: "var(--stripe3)", opacity: 0.2 }} />

        <div>
          <div className="auth-logo-tag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
              <path d="M4 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 8l4 2v6l-4 2M4 11h12" />
            </svg>
            <span>MyFuels</span>
          </div>
          <div className="auth-tagline">Premium Fuel · Fast Delivery</div>
        </div>

        <div>
          <div className="auth-headline">NO<br />FREE<br />RIDES.</div>
          <div className="auth-sub">
            Fuel delivered to your doorstep.<br />
            Order in seconds. Track in real time.
          </div>
        </div>

        <div className="auth-footer">Est. 2024 · Pune, India</div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-eyebrow">{isLogin ? "— Sign in" : "— Create account"}</div>
          <h1 className="auth-title">
            {isLogin ? "Welcome back." : "Join the fleet."}
          </h1>

          <ErrBox msg={error} />

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" placeholder="Your name" value={form.name} onChange={handle} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            <button className="btn btn-primary" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? "New here? " : "Have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }}>
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>

          <div className="auth-demo">
            <strong>Admin demo</strong><br />
            admin@myfuels.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const { user, logout } = useAuth();

  const userLinks = [
    { id: "dashboard",   label: "Dashboard" },
    { id: "place-order", label: "New Order" },
    { id: "history",     label: "My Orders" },
  ];
  const adminLinks = [{ id: "admin", label: "Control Room" }];
  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
              <path d="M4 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 8l4 2v6l-4 2M4 11h12" />
            </svg>
          </div>
          <span className="navbar-logo-text">MYFUELS</span>
        </div>

        <div className="navbar-links">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => setPage(l.id)}
              className={`nav-btn${page === l.id ? " active" : ""}`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="navbar-right">
          <div>
            <div className="navbar-user-name">{user?.name}</div>
            {user?.role === "admin" && <div className="navbar-user-role">Administrator</div>}
          </div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ setPage }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders().then((d) => {
      setOrders(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const counts = {
    total:     orders.length,
    pending:   orders.filter((o) => o.status === "Pending").length,
    active:    orders.filter((o) => o.status === "Out for Delivery").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Overview</div>
          <h1 className="page-title">Hey, {user?.name.split(" ")[0]}.</h1>
        </div>
        <button className="btn btn-ink" onClick={() => setPage("place-order")}>
          + New Order
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card hi">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{counts.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{counts.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">En Route</div>
          <div className="stat-value">{counts.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivered</div>
          <div className="stat-value">{counts.delivered}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-head-title">Recent Orders</span>
          <button className="panel-link" onClick={() => setPage("history")}>View All</button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 28px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brown-light)" }}>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No orders yet.</div>
            <button className="btn btn-primary" onClick={() => setPage("place-order")}>
              Place Your First Order
            </button>
          </div>
        ) : (
          <>
            <div className="table-head" style={{ gridTemplateColumns: "1.5fr 1fr 1.5fr 2fr 1.2fr" }}>
              {["Fuel", "Qty", "Status", "Location", "Date"].map((h) => <span key={h}>{h}</span>)}
            </div>
            {orders.slice(0, 6).map((o) => (
              <div key={o._id} className="table-row" style={{ gridTemplateColumns: "1.5fr 1fr 1.5fr 2fr 1.2fr" }}>
                <span className="cell-primary">{o.fuelType}</span>
                <span className="cell-mono">{o.quantity}L</span>
                <Badge status={o.status} />
                <span className="cell-mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.deliveryLocation}</span>
                <span className="cell-dim">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ─── PLACE ORDER ──────────────────────────────────────────────────────────────
const PlaceOrder = ({ setPage }) => {
  const [form, setForm] = useState({ fuelType: "Petrol", quantity: "", deliveryLocation: "", preferredTime: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.placeOrder(form);
      if (res.error) return setError(res.error);
      setSuccess(true);
      setTimeout(() => setPage("history"), 2500);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="page">
      <div className="success-wrap">
        <div className="success-eyebrow">Order Confirmed</div>
        <div className="success-title">You're all set.</div>
        <div className="success-sub">Redirecting to your orders...</div>
      </div>
    </div>
  );

  const fuels = [
    { type: "Petrol", desc: "Regular unleaded" },
    { type: "Diesel", desc: "High-cetane grade" },
    { type: "CNG",    desc: "Compressed natural gas" },
    { type: "LPG",    desc: "Liquefied petroleum" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">New Order</div>
          <h1 className="page-title">Fuel Request.</h1>
        </div>
      </div>

      <div className="two-col">
        {/* Step 1 */}
        <div>
          <div className="section-label">01 — Select Fuel Type</div>
          <div className="fuel-grid">
            {fuels.map((f) => (
              <button
                key={f.type}
                type="button"
                className={`fuel-card${form.fuelType === f.type ? " selected" : ""}`}
                onClick={() => setForm({ ...form, fuelType: f.type })}
              >
                <div className="fuel-icon" style={{ color: form.fuelType === f.type ? "var(--orange)" : "var(--brown-mid)" }}>
                  <FuelIcon type={f.type} />
                </div>
                <div>
                  <div className="fuel-name">{f.type}</div>
                  <div className="fuel-desc">{f.desc}</div>
                </div>
                {form.fuelType === f.type && (
                  <div className="fuel-check">
                    <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        <div>
          <div className="section-label">02 — Order Details</div>
          <ErrBox msg={error} />
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Quantity (Litres)</label>
              <input className="form-input" name="quantity" type="number" min="1" placeholder="e.g. 20" value={form.quantity} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Location</label>
              <input className="form-input" name="deliveryLocation" placeholder="Full address" value={form.deliveryLocation} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Delivery Time</label>
              <input className="form-input" name="preferredTime" type="datetime-local" value={form.preferredTime} onChange={handle} required />
            </div>

            {form.quantity && (
              <div className="order-summary">
                <div className="order-summary-label">Order Summary</div>
                <div className="order-summary-value">{form.fuelType} — {form.quantity}L</div>
              </div>
            )}

            <button className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Placing Order..." : "Confirm Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── ORDER HISTORY ────────────────────────────────────────────────────────────
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders().then((d) => {
      setOrders(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const STEPS = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">History</div>
          <h1 className="page-title">All Orders.</h1>
        </div>
      </div>

      {loading ? (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brown-light)" }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-title">No orders placed yet.</div>
        </div>
      ) : (
        orders.map((o) => {
          const idx = STEPS.indexOf(o.status);
          const pct = ["0%", "33%", "66%", "100%"][idx] || "0%";
          return (
            <div key={o._id} className="order-card">
              <div className="order-card-head">
                <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{o.fuelType}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--brown-mid)" }}>{o.quantity} Litres</span>
                </div>
                <Badge status={o.status} />
              </div>

              <div className="order-card-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                  <div>
                    <div className="form-label" style={{ marginBottom: 6 }}>Delivery Location</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)" }}>{o.deliveryLocation}</div>
                  </div>
                  <div>
                    <div className="form-label" style={{ marginBottom: 6 }}>Preferred Time</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)" }}>
                      {new Date(o.preferredTime).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="tracker">
                  <div className="tracker-rail" />
                  <div className="tracker-fill" style={{ width: pct }} />
                  <div className="tracker-steps">
                    {STEPS.map((s, i) => (
                      <div key={s} className="tracker-step">
                        <div className={`tracker-dot${i <= idx ? " done" : ""}`} />
                        <span className={`tracker-step-label${i <= idx ? " done" : ""}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-card-foot">
                Order #{o._id.slice(-8).toUpperCase()} &nbsp;·&nbsp; {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    const [o, s] = await Promise.all([
      api.getAllOrders({ search, status: statusFilter }),
      api.getStats(),
    ]);
    setOrders(Array.isArray(o) ? o : []);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search, statusFilter]);

  const changeStatus = async (id, status) => {
    setUpdating(id);
    await api.updateOrderStatus(id, status);
    await load();
    setUpdating(null);
  };

  const STATUSES = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Admin</div>
          <h1 className="page-title">Control Room.</h1>
        </div>
      </div>

      <div className="stat-grid-5">
        <div className="stat-card hi">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accepted</div>
          <div className="stat-value">{stats.accepted ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">En Route</div>
          <div className="stat-value">{stats.outForDelivery ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivered</div>
          <div className="stat-value">{stats.delivered ?? "—"}</div>
        </div>
      </div>

      <div className="filter-row">
        <input
          className="form-input"
          placeholder="Search by customer, location or fuel type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel">
        <div className="table-head" style={{ gridTemplateColumns: "1.5fr 0.8fr 0.8fr 2fr 1.5fr 1.8fr" }}>
          {["Customer", "Fuel", "Qty", "Location", "Status", "Update"].map((h) => <span key={h}>{h}</span>)}
        </div>

        {loading ? (
          <div style={{ padding: "40px 28px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brown-light)" }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No orders match.</div>
          </div>
        ) : (
          orders.map((o) => (
            <div key={o._id} className="table-row" style={{ gridTemplateColumns: "1.5fr 0.8fr 0.8fr 2fr 1.5fr 1.8fr" }}>
              <span className="cell-primary">{o.userName || "—"}</span>
              <span className="cell-mono">{o.fuelType}</span>
              <span className="cell-mono">{o.quantity}L</span>
              <span className="cell-mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.deliveryLocation}</span>
              <Badge status={o.status} />
              <select
                className="form-select"
                style={{ padding: "7px 32px 7px 10px", fontSize: 11, opacity: updating === o._id ? 0.4 : 1 }}
                disabled={updating === o._id}
                value={o.status}
                onChange={(e) => changeStatus(o._id, e.target.value)}
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState(user?.role === "admin" ? "admin" : "dashboard");

  if (!user) return <AuthPage />;

  const render = () => {
    if (user.role === "admin") return <AdminPanel />;
    switch (page) {
      case "place-order": return <PlaceOrder setPage={setPage} />;
      case "history":     return <OrderHistory />;
      default:            return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <Navbar page={page} setPage={setPage} />
      {render()}
    </div>
  );
}