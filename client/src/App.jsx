import { useState, useEffect } from "react";
import { useAuth } from "./store.jsx";
import * as api from "./api.js";

// ─── Icon helper ──────────────────────────────────────────────────────────────
const Icon = ({ name, fill = false, size = 24, style = {} }) => (
  <span
    className="material-symbols-outlined"
    style={{
      fontSize: size,
      fontVariationSettings: fill ? "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" : "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
      ...style,
    }}
  >
    {name}
  </span>
);

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusMeta = {
  Pending:            { cls: "badge-pending",  dot: "#D97706", icon: "shopping_cart" },
  Accepted:           { cls: "badge-accepted", dot: "#2563EB", icon: "verified" },
  "Out for Delivery": { cls: "badge-enroute",  dot: "#855300", icon: "local_shipping" },
  Delivered:          { cls: "badge-delivered",dot: "#16A34A", icon: "inventory_2" },
};

const Badge = ({ status }) => {
  const m = statusMeta[status] || { cls: "", dot: "#888" };
  return (
    <span className={`badge ${m.cls}`}>
      <span className="status-dot" style={{ background: m.dot }} />
      {status}
    </span>
  );
};

// ─── Shared ───────────────────────────────────────────────────────────────────
const ErrBox = ({ msg }) => msg ? <div className="err-box">{msg}</div> : null;

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
const AuthPage = () => {
  const { saveAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await (isLogin ? api.login : api.signup)(form);
      if (res.error) return setError(res.error);
      saveAuth(res.token, res.user);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Left branding */}
        <div className="auth-left">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Icon name="oil_barrel" fill style={{ color: "var(--primary-container)" }} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 20, fontWeight: 700, color: "white" }}>MyFuels</span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Fuel Order Management
            </p>
          </div>

          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 44, fontWeight: 700, lineHeight: 1.1, color: "white", marginBottom: 16 }}>
              Fuel.<br />
              <span style={{ color: "var(--primary-container)" }}>Delivered.</span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              Place orders, track deliveries, and manage your fleet logistics in one place.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} className="animate-pulse-dot" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              System Online
            </span>
          </div>
        </div>

        {/* Right form */}
        <div className="auth-right">
          <div style={{ marginBottom: 8 }}>
            <span className="section-title">{isLogin ? "— Sign in to your account" : "— Create new account"}</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 700, color: "var(--on-surface)", marginBottom: 28, lineHeight: 1.2 }}>
            {isLogin ? "Welcome back" : "Get started"}
          </h2>

          <ErrBox msg={error} />

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!isLogin && (
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" placeholder="Your full name" value={form.name} onChange={handle} required />
              </div>
            )}
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handle} required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            <button className="btn btn-amber" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              {!loading && <Icon name="arrow_forward" size={18} />}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--outline-variant)", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--secondary)" }}>
            {isLogin ? "No account? " : "Have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14 }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--surface-container-low)", borderRadius: 8, border: "1px solid var(--outline-variant)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-variant)", lineHeight: 1.8 }}>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>Admin demo:</span><br />
              admin@myfuels.com / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TOP NAVBAR ───────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const { user, logout } = useAuth();
  const userLinks = [
    { id: "dashboard",   label: "Dashboard" },
    { id: "place-order", label: "Orders" },
    { id: "history",     label: "History" },
  ];
  const adminLinks = [{ id: "admin", label: "Orders" }];
  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span className="navbar-logo">MyFuels</span>
          <div className="navbar-links">
            {links.map((l) => (
              <button key={l.id} onClick={() => setPage(l.id)} className={`nav-link${page === l.id ? " active" : ""}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          <div className="search-input-wrap" style={{ display: "none" }}>
            <Icon name="search" size={20} />
            <input className="form-input" placeholder="Search orders..." style={{ width: 220, padding: "8px 12px 8px 40px", borderRadius: 99, fontSize: 14 }} />
          </div>
          <button className="icon-btn"><Icon name="notifications" /></button>
          <button className="icon-btn"><Icon name="settings" /></button>
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <button
            onClick={logout}
            style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--secondary)", background: "none", border: "1px solid var(--outline-variant)", padding: "6px 14px", borderRadius: 8, cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
const Dashboard = ({ setPage }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders().then((d) => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const counts = {
    total:     orders.length,
    active:    orders.filter(o => o.status === "Out for Delivery").length,
    pending:   orders.filter(o => o.status === "Pending").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
  };

  const STEPS = ["Pending","Accepted","Out for Delivery","Delivered"];
  const latestOrder = orders[0];

  return (
    <div className="page-wrap">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <span className="section-title" style={{ display: "block", marginBottom: 6 }}>Enterprise Management</span>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 32, fontWeight: 600, color: "var(--on-surface)", letterSpacing: "-0.01em" }}>
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--secondary)", marginTop: 4 }}>
            Here is the latest status of your fuel orders.
          </p>
        </div>
        <button className="btn btn-amber" onClick={() => setPage("place-order")}>
          <Icon name="add_circle" fill size={18} /> New Order
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ background: "var(--surface-container-low)", padding: 10, borderRadius: 10 }}>
              <Icon name="shopping_cart" style={{ color: "var(--primary)", fontSize: 32 }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#16A34A" }}>All time</span>
          </div>
          <div style={{ marginTop: 24 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)", letterSpacing: "0.02em" }}>Total Orders</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 48, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{counts.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ background: "var(--surface-container-low)", padding: 10, borderRadius: 10 }}>
              <Icon name="local_shipping" style={{ color: "var(--primary)", fontSize: 32 }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--primary)" }}>Live Tracking</span>
          </div>
          <div style={{ marginTop: 24 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)", letterSpacing: "0.02em" }}>Active Deliveries</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 48, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{counts.active}</p>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ background: "var(--surface-container-low)", padding: 10, borderRadius: 10 }}>
              <Icon name="oil_barrel" style={{ color: "var(--primary)", fontSize: 32 }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--secondary)" }}>Delivered</span>
          </div>
          <div style={{ marginTop: 24 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)", letterSpacing: "0.02em" }}>Completed Orders</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 48, fontWeight: 700, color: "var(--on-surface)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{counts.delivered}</p>
          </div>
        </div>
      </div>

      {/* Bottom grid: table + sidebar */}
      <div className="grid-12">
        {/* Recent orders table */}
        <div className="col-8">
          <div className="card">
            <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="text-headline-md">Recent Orders</h2>
              <button onClick={() => setPage("history")} style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>View All</button>
            </div>
            {loading ? (
              <div style={{ padding: 32, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--secondary)" }}>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "60px 32px", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: 18, color: "var(--on-surface-variant)", marginBottom: 20 }}>No orders yet.</p>
                <button className="btn btn-amber" onClick={() => setPage("place-order")}>Place Your First Order</button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Location</th>
                    <th>Fuel</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0,6).map((o) => (
                    <tr key={o._id}>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>#{o._id.slice(-6).toUpperCase()}</span></td>
                      <td><span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600 }}>{o.deliveryLocation}</span></td>
                      <td><span className="chip chip-blue">{o.fuelType}</span></td>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{o.quantity}L</span></td>
                      <td><Badge status={o.status} /></td>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--secondary)" }}>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Live tracking mini */}
          {latestOrder && (
            <div className="card card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="section-title">Latest Order</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary-container)", display: "inline-block" }} className="animate-pulse-dot" />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>
                    {latestOrder.status}
                  </span>
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{latestOrder.fuelType} Delivery</p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-surface-variant)", marginBottom: 20 }}>{latestOrder.deliveryLocation}</p>

              {/* Mini tracker */}
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 2, background: "var(--surface-variant)" }} />
                <div style={{
                  position: "absolute", top: 12, left: 0, height: 2,
                  background: "var(--primary-container)",
                  width: ["0%","33%","66%","100%"][["Pending","Accepted","Out for Delivery","Delivered"].indexOf(latestOrder.status)] || "0%",
                }} />
                {["Pending","Accepted","Out for Delivery","Delivered"].map((s, i) => {
                  const done = i <= ["Pending","Accepted","Out for Delivery","Delivered"].indexOf(latestOrder.status);
                  return (
                    <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? "var(--primary-container)" : "var(--surface-variant)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={statusMeta[s]?.icon || "circle"} size={14} style={{ color: done ? "var(--on-primary-container)" : "var(--on-surface-variant)" }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: done ? "var(--primary)" : "var(--secondary)", textTransform: "uppercase", textAlign: "center", maxWidth: 56 }}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Support card */}
          <div style={{ background: "var(--inverse-surface)", borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 20, fontWeight: 600, color: "white", marginBottom: 8 }}>Need Help?</h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20 }}>Our support team is available for order help and route changes.</p>
            <button style={{ width: "100%", padding: "12px", background: "white", color: "var(--inverse-surface)", borderRadius: 12, fontWeight: 700, fontFamily: "var(--font-sans)", fontSize: 14, border: "none", cursor: "pointer" }}>
              Contact Support
            </button>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} className="animate-pulse-dot" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Support Online</span>
            </div>
          </div>
        </div>
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
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await api.placeOrder(form);
      if (res.error) return setError(res.error);
      setSuccess(true);
      setTimeout(() => setPage("history"), 2500);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="page-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Icon name="check_circle" fill size={40} style={{ color: "#16A34A" }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Order Confirmed</h2>
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--secondary)" }}>Redirecting to your orders...</p>
      </div>
    </div>
  );

  const fuels = [
    { type: "Petrol",  icon: "local_gas_station", desc: "95 Octane — Regular unleaded" },
    { type: "Diesel",  icon: "oil_barrel",         desc: "ULS Diesel — Commercial grade" },
    { type: "CNG",     icon: "gas_meter",          desc: "Compressed Natural Gas" },
    { type: "LPG",     icon: "propane",            desc: "Liquefied Petroleum Gas" },
  ];

  const unitPrice = 1.42;
  const estimatedTotal = form.quantity ? (parseFloat(form.quantity) * unitPrice).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00";

  return (
    <div className="page-wrap">
      {/* Back + header */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => setPage("dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--secondary)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 }}>
          <Icon name="arrow_back" size={18} /> Back to Dashboard
        </button>
        <h1 className="text-display-lg" style={{ color: "var(--on-surface)" }}>New Fuel Order</h1>
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--on-surface-variant)", marginTop: 6, maxWidth: 520 }}>
          Submit a new fuel request. Ensure delivery logistics and specifications are accurate before submission.
        </p>
      </div>

      <div className="grid-12" style={{ marginTop: 32, alignItems: "start" }}>
        {/* Main form */}
        <div className="col-8">
          <div className="card">
            <div style={{ padding: 32 }}>
              <ErrBox msg={error} />
              <form onSubmit={submit}>
                {/* Section 1: Fuel Specs */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: "1px solid var(--surface-variant)", marginBottom: 24 }}>
                    <Icon name="oil_barrel" style={{ color: "var(--primary)" }} />
                    <h2 className="text-headline-md">Fuel Specifications</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
                    <div>
                      <label className="form-label">Fuel Type</label>
                      <select className="form-select" name="fuelType" value={form.fuelType} onChange={handle}>
                        {fuels.map(f => <option key={f.type}>{f.type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Quantity (Litres)</label>
                      <div style={{ position: "relative" }}>
                        <input className="form-input" name="quantity" type="number" min="1" placeholder="e.g. 5000" value={form.quantity} onChange={handle} required style={{ paddingRight: 52 }} />
                        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--on-surface-variant)" }}>LTR</span>
                      </div>
                    </div>
                  </div>

                  {/* Fuel option cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {fuels.map(f => (
                      <button key={f.type} type="button" className={`fuel-option${form.fuelType === f.type ? " selected" : ""}`} onClick={() => setForm({ ...form, fuelType: f.type })}>
                        <div className="fuel-icon-box"><Icon name={f.icon} /></div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "var(--on-surface)" }}>{f.type}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--secondary)", marginTop: 2 }}>{f.desc}</div>
                        </div>
                        {form.fuelType === f.type && <Icon name="check_circle" fill size={20} style={{ color: "var(--primary)", marginLeft: "auto" }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 2: Logistics */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: "1px solid var(--surface-variant)", marginBottom: 24 }}>
                    <Icon name="local_shipping" style={{ color: "var(--primary)" }} />
                    <h2 className="text-headline-md">Delivery Logistics</h2>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label className="form-label">Delivery Address / Depot</label>
                    <div className="input-icon-wrap">
                      <Icon name="location_on" size={20} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)" }} />
                      <input className="form-input" name="deliveryLocation" placeholder="Enter site name or full address" value={form.deliveryLocation} onChange={handle} required style={{ paddingLeft: 44 }} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Preferred Delivery Window</label>
                    <input className="form-input" name="preferredTime" type="datetime-local" value={form.preferredTime} onChange={handle} required />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="col-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ position: "sticky", top: 80 }}>
            <div className="card-head">
              <span className="section-title">Order Summary</span>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-sans)", color: "var(--on-surface-variant)" }}>Unit Price</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500 }}>$1.42 / LTR</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-sans)", color: "var(--on-surface-variant)" }}>Estimated Total</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>{estimatedTotal}</span>
              </div>

              <div className="divider" style={{ marginBottom: 20 }} />

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 24, padding: 12, background: "var(--surface-container-low)", borderRadius: 8 }}>
                <Icon name="info" size={18} style={{ color: "var(--secondary)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
                  Deliveries occur within 4–6 hours of your preferred window.
                </p>
              </div>

              <button className="btn btn-amber" disabled={loading} onClick={submit} style={{ width: "100%", padding: "14px" }}>
                {loading ? (
                  <><Icon name="progress_activity" size={18} /> Processing...</>
                ) : (
                  <><span>Submit Order</span><Icon name="send" size={18} /></>
                )}
              </button>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-surface-variant)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
                By submitting you agree to the MyFuels service agreement.
              </p>
            </div>
          </div>

          <div style={{ background: "var(--secondary-container)", border: "1px solid var(--tertiary-container)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, background: "white", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--tertiary-container)", flexShrink: 0 }}>
              <Icon name="verified" fill size={22} style={{ color: "var(--secondary)" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority Account</div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--on-surface-variant)", marginTop: 2 }}>Enterprise SLAs are applied automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ORDER HISTORY ────────────────────────────────────────────────────────────
const OrderHistory = ({ setPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.getMyOrders().then((d) => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const STEPS = ["Pending","Accepted","Out for Delivery","Delivered"];

  return (
    <div className="page-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <span className="section-title" style={{ display: "block", marginBottom: 6 }}>Order ID</span>
          <h1 className="text-headline-lg">My Fuel Orders</h1>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--on-surface-variant)", marginTop: 4 }}>Track and manage all your fuel delivery requests.</p>
        </div>
        <button className="btn btn-amber" onClick={() => setPage("place-order")}>
          <Icon name="add" size={18} /> New Order
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--secondary)" }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: "80px 32px", textAlign: "center" }}>
          <Icon name="local_shipping" size={48} style={{ color: "var(--outline-variant)", display: "block", margin: "0 auto 20px" }} />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 18, color: "var(--on-surface-variant)", marginBottom: 20 }}>No orders placed yet.</p>
          <button className="btn btn-amber" onClick={() => setPage("place-order")}>Place Your First Order</button>
        </div>
      ) : (
        <div className="grid-12" style={{ alignItems: "start" }}>
          {/* Orders list */}
          <div className="col-7">
            <div className="card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Fuel Type</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} onClick={() => setSelected(o)} style={{ cursor: "pointer", background: selected?._id === o._id ? "var(--surface-container-low)" : "" }}>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>#{o._id.slice(-6).toUpperCase()}</span></td>
                      <td><span className="chip chip-blue">{o.fuelType}</span></td>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{o.quantity}L</span></td>
                      <td><Badge status={o.status} /></td>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--secondary)" }}>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          <div className="col-5">
            {selected ? (
              <div className="card" style={{ position: "sticky", top: 80 }}>
                {/* Live status tracking */}
                <div style={{ padding: 24, borderBottom: "1px solid var(--outline-variant)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <span className="section-title">Live Status Tracking</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary-container)", display: "inline-block" }} className="animate-pulse-dot" />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>{selected.status}</span>
                    </div>
                  </div>

                  {/* Tracker */}
                  <div className="tracker-wrap">
                    <div className="tracker-rail" />
                    <div className="tracker-fill" style={{ width: ["0%","33%","66%","100%"][STEPS.indexOf(selected.status)] || "0%" }} />
                    <div className="tracker-steps">
                      {STEPS.map((s, i) => {
                        const done = i <= STEPS.indexOf(selected.status);
                        const current = s === selected.status;
                        return (
                          <div key={s} className="tracker-step">
                            <div className={`tracker-dot${done ? " active" : ""}${current ? " current" : ""}`} style={{ boxShadow: current ? "0 0 0 4px var(--primary-fixed)" : "none" }}>
                              <Icon name={statusMeta[s]?.icon || "circle"} size={20} />
                            </div>
                            <span className="tracker-label">{s}</span>
                            <span className={`tracker-sub${done ? " active" : ""}`}>
                              {current ? "Current" : done ? "Done" : "Pending"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Delivery details */}
                <div style={{ padding: 24 }}>
                  <h3 className="section-title" style={{ marginBottom: 16 }}>Delivery Specs</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Icon name="location_on" style={{ color: "var(--secondary)", flexShrink: 0 }} />
                      <div>
                        <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{selected.deliveryLocation}</p>
                      </div>
                    </div>
                    <div className="divider" />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--on-surface-variant)" }}>Fuel Grade</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700 }}>{selected.fuelType}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--on-surface-variant)" }}>Quantity</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700 }}>{selected.quantity} Litres</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--on-surface-variant)" }}>Preferred Time</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{new Date(selected.preferredTime).toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--on-surface-variant)" }}>Order Ref</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>#{selected._id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card card-pad" style={{ textAlign: "center", padding: 40 }}>
                <Icon name="touch_app" size={36} style={{ color: "var(--outline-variant)", display: "block", margin: "0 auto 12px" }} />
                <p style={{ fontFamily: "var(--font-sans)", color: "var(--on-surface-variant)", fontSize: 14 }}>Select an order to view tracking details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const { logout } = useAuth();
  const [orders, setOrders]         = useState([]);
  const [stats, setStats]           = useState({});
  const [search, setSearch]         = useState("");
  const [statusFilter, setFilter]   = useState("all");
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState(null);
  const [tab, setTab]               = useState("all");

  const load = async () => {
    setLoading(true);
    const [o, s] = await Promise.all([api.getAllOrders({ search, status: statusFilter }), api.getStats()]);
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

  const STATUSES = ["Pending","Accepted","Out for Delivery","Delivered"];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Icon name="oil_barrel" style={{ color: "var(--primary)" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, color: "var(--on-surface)" }}>FuelOps Admin</span>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { icon: "dashboard",           label: "Dashboard" },
            { icon: "oil_barrel",          label: "Fuel Orders", active: true },
            { icon: "local_shipping",      label: "Fleet Status" },
            { icon: "admin_panel_settings",label: "Admin Panel" },
            { icon: "settings",            label: "Settings" },
          ].map((item) => (
            <button key={item.label} className={`sidebar-item${item.active ? " active" : ""}`}>
              <Icon name={item.icon} size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={logout} className="sidebar-item">
            <Icon name="logout" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-content">
        <div className="page-wrap">
          {/* Metrics bento */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 20, marginBottom: 32 }}>
            {/* Fleet efficiency large card */}
            <div className="card card-pad">
              <span className="section-title" style={{ display: "block", marginBottom: 8 }}>Fleet Efficiency</span>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--on-surface)", lineHeight: 1.1 }}>
                {stats.total > 0 ? `${Math.round((stats.delivered / stats.total) * 100) || 0}%` : "—"}
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--secondary)", marginTop: 4 }}>Delivery completion rate</p>
            </div>

            {[
              { label: "Pending", val: stats.pending },
              { label: "En Route", val: stats.outForDelivery },
              { label: "Delivered", val: stats.delivered },
            ].map((s) => (
              <div key={s.label} className="card card-pad">
                <span className="section-title" style={{ display: "block", marginBottom: 8 }}>{s.label}</span>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 36, fontWeight: 700, color: "var(--on-surface)", letterSpacing: "-0.01em" }}>{s.val ?? "—"}</div>
              </div>
            ))}
          </div>

          {/* Orders table */}
          <div className="card">
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <h2 className="text-headline-md">Active Fuel Orders</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {/* Tab filter */}
                <div style={{ display: "flex", background: "var(--surface-container)", borderRadius: 10, padding: 4, gap: 2 }}>
                  {["all","Pending","Out for Delivery"].map((t) => (
                    <button key={t} onClick={() => { setTab(t); setFilter(t); }} style={{
                      padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontFamily: "var(--font-mono)", fontSize: 13,
                      background: tab === t ? "white" : "transparent",
                      color: tab === t ? "var(--on-surface)" : "var(--on-surface-variant)",
                      fontWeight: tab === t ? 600 : 400,
                      boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}>
                      {t === "all" ? "All Orders" : t === "Pending" ? "Pending" : "In Transit"}
                    </button>
                  ))}
                </div>
                {/* Search */}
                <div className="search-input-wrap">
                  <Icon name="search" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--outline)" }} />
                  <input
                    className="form-input"
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: 40, width: 220, borderRadius: 12, padding: "8px 12px 8px 40px", fontSize: 14 }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--secondary)" }}>Loading orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "60px 32px", textAlign: "center", fontFamily: "var(--font-sans)", color: "var(--on-surface-variant)", fontSize: 16 }}>No orders match.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Fuel Type</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>#{o._id.slice(-6).toUpperCase()}</span></td>
                      <td>
                        <div>
                          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, display: "block" }}>{o.userName || "—"}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-variant)" }}>{o.deliveryLocation}</span>
                        </div>
                      </td>
                      <td><span className="chip chip-blue">{o.fuelType}</span></td>
                      <td><span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{o.quantity}L</span></td>
                      <td><Badge status={o.status} /></td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
                          {o.status === "Pending" && (
                            <button className="btn btn-amber btn-sm" disabled={updating === o._id} onClick={() => changeStatus(o._id, "Accepted")}>
                              Accept
                            </button>
                          )}
                          {o.status === "Accepted" && (
                            <button className="btn btn-dark btn-sm" disabled={updating === o._id} onClick={() => changeStatus(o._id, "Out for Delivery")}>
                              Dispatch
                            </button>
                          )}
                          {o.status === "Out for Delivery" && (
                            <button className="btn btn-outline btn-sm" disabled={updating === o._id} onClick={() => changeStatus(o._id, "Delivered")}>
                              Mark Delivered
                            </button>
                          )}
                          {o.status === "Delivered" && (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-surface-variant)", fontStyle: "italic", paddingRight: 8 }}>Completed</span>
                          )}
                          <button className="icon-btn" style={{ borderRadius: 8, padding: 6 }}>
                            <Icon name="more_vert" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--outline-variant)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--on-surface-variant)" }}>
                Showing {orders.length} orders
              </span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button className="btn btn-outline btn-sm" style={{ padding: "6px 10px" }}><Icon name="chevron_left" size={18} /></button>
                <button className="btn btn-primary btn-sm" style={{ width: 36, padding: 0, height: 36, borderRadius: 8 }}>1</button>
                <button className="btn btn-outline btn-sm" style={{ padding: "6px 10px" }}><Icon name="chevron_right" size={18} /></button>
              </div>
            </div>
          </div>
        </div>
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
      case "history":     return <OrderHistory setPage={setPage} />;
      default:            return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {user.role !== "admin" && <Navbar page={page} setPage={setPage} />}
      {render()}
    </div>
  );
}