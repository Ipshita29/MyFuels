import { useState, useEffect } from "react";
import { useAuth } from "./store.jsx";
import * as api from "./api.js";

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg:       "#0F0E0C",
  surface:  "#1A1915",
  card:     "#211F1A",
  border:   "#2E2C26",
  borderHi: "#3D3A32",
  orange:   "#E8621A",
  orangeHi: "#F07235",
  orangeDim:"#7A3410",
  cream:    "#F5EDD8",
  creamDim: "#A89880",
  text:     "#F0E8D5",
  textMid:  "#8A8070",
  textDim:  "#504A3F",
};

const MONO = "'DM Mono', monospace";
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "'Inter', sans-serif";

// ─── STATUS ───────────────────────────────────────────────────────────────────
const STATUS = {
  Pending:            { bg: "#2A1A0E", border: "#7A3410", text: "#F07235", dot: "#E8621A" },
  Accepted:           { bg: "#0D1A2E", border: "#1A3A6E", text: "#5B9BD5", dot: "#3A7BC8" },
  "Out for Delivery": { bg: "#1A1500", border: "#4A3A00", text: "#D4A017", dot: "#C89010" },
  Delivered:          { bg: "#0A1F0A", border: "#1A4A1A", text: "#4CAF70", dot: "#3A9A58" },
};

const Badge = ({ status }) => {
  const s = STATUS[status] || { bg: "#1A1A1A", border: "#333", text: "#888", dot: "#555" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      padding: "3px 10px", borderRadius: 3,
      fontFamily: MONO, fontSize: 11, fontWeight: 500, letterSpacing: "0.06em",
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <div style={{
    fontFamily: MONO, fontSize: 10, fontWeight: 500,
    letterSpacing: "0.16em", color: C.textMid,
    textTransform: "uppercase", marginBottom: 7,
  }}>{children}</div>
);

const inputBase = {
  width: "100%", boxSizing: "border-box",
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 4,
  padding: "11px 14px",
  fontFamily: MONO, fontSize: 14,
  color: C.text,
  outline: "none",
};

const Inp = (props) => (
  <input
    style={inputBase}
    onFocus={(e) => (e.target.style.borderColor = C.orange)}
    onBlur={(e) => (e.target.style.borderColor = C.border)}
    {...props}
  />
);

const Sel = ({ children, ...props }) => (
  <select
    style={{ ...inputBase, cursor: "pointer", appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8070' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
      paddingRight: 36,
    }}
    onFocus={(e) => (e.target.style.borderColor = C.orange)}
    onBlur={(e) => (e.target.style.borderColor = C.border)}
    {...props}
  >
    {children}
  </select>
);

const Btn = ({ children, variant = "primary", disabled, style = {}, ...props }) => {
  const styles = {
    primary: { background: C.orange, color: "#fff", border: `1px solid ${C.orange}` },
    ghost:   { background: "transparent", color: C.cream, border: `1px solid ${C.border}` },
    danger:  { background: "transparent", color: "#E85555", border: "1px solid #4A2020" },
  };
  return (
    <button
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "11px 22px", borderRadius: 4,
        fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em",
        textTransform: "uppercase",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...styles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const ErrBox = ({ msg }) =>
  msg ? (
    <div style={{
      background: "#1F0A0A", border: "1px solid #5A1A1A", borderLeft: `3px solid #E85555`,
      borderRadius: 4, padding: "10px 14px", marginBottom: 16,
      fontFamily: MONO, fontSize: 12, color: "#E87070", letterSpacing: "0.02em",
    }}>{msg}</div>
  ) : null;

const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 8, overflow: "hidden", ...style,
  }}>
    {children}
  </div>
);

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
    <div style={{
      minHeight: "100vh", display: "flex",
      background: C.bg,
    }}>
      {/* Left branding panel */}
      <div style={{
        flex: "0 0 48%",
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 56px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative grid lines */}
        {[140, 280, 420].map((x) => (
          <div key={x} style={{
            position: "absolute", top: 0, left: x, width: 1,
            height: "100%", background: C.border, opacity: 0.5,
          }} />
        ))}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${C.orange}, transparent)`,
          opacity: 0.4,
        }} />

        {/* Logo */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "8px 16px",
            border: `1px solid ${C.borderHi}`,
            borderRadius: 4, marginBottom: 8,
          }}>
            <span style={{ fontSize: 18 }}>⛽</span>
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.2em", color: C.cream, textTransform: "uppercase" }}>
              MyFuels
            </span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMid, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6 }}>
            Premium fuel · Fast delivery
          </div>
        </div>

        {/* Big headline */}
        <div>
          <div style={{
            fontFamily: SERIF, fontSize: 76, lineHeight: 0.92,
            color: C.orange, marginBottom: 24, letterSpacing: "-0.02em",
          }}>
            NO<br />FREE<br />RIDES.
          </div>
          <div style={{
            fontFamily: MONO, fontSize: 11, color: C.textMid,
            letterSpacing: "0.08em", lineHeight: 1.9,
            borderTop: `1px solid ${C.border}`, paddingTop: 20,
          }}>
            Fuel delivered to your doorstep.<br />
            Order in seconds. Track in real time.
          </div>
        </div>

        <div style={{ fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Est. 2024 · Pune, India
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px 56px",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMid, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
              {isLogin ? "— Sign in" : "— Create account"}
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 36, color: C.cream, lineHeight: 1 }}>
              {isLogin ? "Welcome back." : "Join the fleet."}
            </h1>
          </div>

          <ErrBox msg={error} />

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {!isLogin && (
              <div>
                <Label>Full Name</Label>
                <Inp name="name" placeholder="Your name" value={form.name} onChange={handle} required />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Inp name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div>
              <Label>Password</Label>
              <Inp name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            <Btn disabled={loading} style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Please wait..." : isLogin ? "→ Sign In" : "→ Create Account"}
            </Btn>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 11, color: C.textMid }}>
            {isLogin ? "New here? " : "Have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{ background: "none", border: "none", color: C.orange, fontFamily: MONO, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", background: C.surface, borderRadius: 4, border: `1px solid ${C.border}`, fontFamily: MONO, fontSize: 10, color: C.textMid, lineHeight: 1.8 }}>
            <span style={{ color: C.orange }}>Admin demo</span><br />
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
  const links = user?.role === "admin"
    ? [{ id: "admin", label: "Control Room" }]
    : [
        { id: "dashboard", label: "Dashboard" },
        { id: "place-order", label: "New Order" },
        { id: "history", label: "My Orders" },
      ];

  return (
    <nav style={{
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1140, margin: "0 auto", padding: "0 32px",
        height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>⛽</span>
          <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.15em", color: C.cream, textTransform: "uppercase" }}>
            MyFuels
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 2 }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => setPage(l.id)} style={{
              padding: "7px 16px", borderRadius: 4,
              background: page === l.id ? C.orange : "transparent",
              color: page === l.id ? "#fff" : C.textMid,
              border: "none",
              fontFamily: MONO, fontSize: 11, fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>{l.label}</button>
          ))}
        </div>

        {/* User info + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.cream }}>{user?.name}</div>
            {user?.role === "admin" && (
              <div style={{ fontFamily: MONO, fontSize: 9, color: C.orange, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Administrator
              </div>
            )}
          </div>
          <button onClick={logout} style={{
            padding: "6px 14px", borderRadius: 4,
            border: `1px solid ${C.border}`, background: "transparent",
            fontFamily: MONO, fontSize: 10, color: C.textMid,
            letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
          }}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
const Page = ({ children }) => (
  <div style={{ maxWidth: 1140, margin: "0 auto", padding: "48px 32px" }}>{children}</div>
);

const PageHeader = ({ eyebrow, title, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
    <div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: C.orange, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h1 style={{ fontFamily: SERIF, fontSize: 48, color: C.cream, lineHeight: 1, letterSpacing: "-0.01em" }}>
        {title}
      </h1>
    </div>
    {action}
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, highlight }) => (
  <div style={{
    background: highlight ? C.orange : C.card,
    border: `1px solid ${highlight ? C.orange : C.border}`,
    borderRadius: 8, padding: "24px 28px",
  }}>
    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: highlight ? "rgba(255,255,255,0.6)" : C.textMid, marginBottom: 12 }}>
      {label}
    </div>
    <div style={{ fontFamily: SERIF, fontSize: 52, color: highlight ? "#fff" : C.cream, lineHeight: 1 }}>
      {value}
    </div>
  </div>
);

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
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    active: orders.filter((o) => o.status === "Out for Delivery").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Overview"
        title={`Hey, ${user?.name.split(" ")[0]}.`}
        action={
          <Btn onClick={() => setPage("place-order")}>
            + New Order
          </Btn>
        }
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 48 }}>
        <StatCard label="Total Orders" value={counts.total} highlight />
        <StatCard label="Pending" value={counts.pending} />
        <StatCard label="En Route" value={counts.active} />
        <StatCard label="Delivered" value={counts.delivered} />
      </div>

      {/* Recent orders table */}
      <Card>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.cream, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Recent Orders
          </span>
          <button onClick={() => setPage("history")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: MONO, fontSize: 10, color: C.orange, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>View All →</button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 24px", fontFamily: MONO, fontSize: 12, color: C.textMid }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: C.textDim, marginBottom: 20 }}>No orders yet.</div>
            <Btn onClick={() => setPage("place-order")}>Place Your First Order</Btn>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 2fr 1.2fr",
              padding: "10px 24px",
              fontFamily: MONO, fontSize: 9, color: C.textDim,
              letterSpacing: "0.14em", textTransform: "uppercase",
              borderBottom: `1px solid ${C.border}`,
            }}>
              {["Fuel","Qty","Status","Location","Date"].map((h) => <span key={h}>{h}</span>)}
            </div>

            {orders.slice(0, 6).map((o, i) => (
              <div key={o._id} style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr 2fr 1.2fr",
                padding: "16px 24px", alignItems: "center",
                borderBottom: i < Math.min(orders.length - 1, 5) ? `1px solid ${C.border}` : "none",
                background: i % 2 === 1 ? `${C.surface}66` : "transparent",
              }}>
                <span style={{ fontFamily: SERIF, fontSize: 16, color: C.cream }}>{o.fuelType}</span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: C.textMid }}>{o.quantity}L</span>
                <Badge status={o.status} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.deliveryLocation}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: C.textDim }}>
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </>
        )}
      </Card>
    </Page>
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
    <Page>
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: C.orange, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
          — Order Confirmed
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 64, color: C.cream, lineHeight: 1, marginBottom: 20 }}>
          You're all set.
        </div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMid, letterSpacing: "0.08em" }}>
          Redirecting to your orders...
        </div>
      </div>
    </Page>
  );

  const fuels = [
    { type: "Petrol", icon: "🔴", desc: "Regular unleaded" },
    { type: "Diesel", icon: "🟡", desc: "High-cetane grade" },
    { type: "CNG",    icon: "🔵", desc: "Compressed natural gas" },
    { type: "LPG",    icon: "🟢", desc: "Liquefied petroleum" },
  ];

  return (
    <Page>
      <PageHeader eyebrow="New Order" title="Fuel Request." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Step 1: Fuel selector */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.orange, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>
            01 — Select Fuel Type
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fuels.map((f) => {
              const selected = form.fuelType === f.type;
              return (
                <button key={f.type} onClick={() => setForm({ ...form, fuelType: f.type })} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "18px 20px",
                  background: selected ? `${C.orange}18` : C.card,
                  border: `1px solid ${selected ? C.orange : C.border}`,
                  borderRadius: 6, cursor: "pointer", textAlign: "left",
                }}>
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 18, color: selected ? C.orange : C.cream }}>{f.type}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: C.textMid, letterSpacing: "0.04em", marginTop: 2 }}>{f.desc}</div>
                  </div>
                  {selected && <span style={{ marginLeft: "auto", color: C.orange, fontSize: 16 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Details */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: C.orange, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>
            02 — Order Details
          </div>
          <ErrBox msg={error} />
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <Label>Quantity (Litres)</Label>
              <Inp name="quantity" type="number" min="1" placeholder="e.g. 20" value={form.quantity} onChange={handle} required />
            </div>
            <div>
              <Label>Delivery Location</Label>
              <Inp name="deliveryLocation" placeholder="Full address" value={form.deliveryLocation} onChange={handle} required />
            </div>
            <div>
              <Label>Preferred Delivery Time</Label>
              <Inp name="preferredTime" type="datetime-local" value={form.preferredTime} onChange={handle} required />
            </div>

            {/* Summary strip */}
            {form.quantity && form.fuelType && (
              <div style={{
                padding: "16px 20px", background: `${C.orange}12`,
                border: `1px solid ${C.orangeDim}`, borderRadius: 6,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: C.textMid, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>
                  Order Summary
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 26, color: C.orange }}>
                  {form.fuelType} — {form.quantity}L
                </div>
              </div>
            )}

            <Btn disabled={loading} style={{ width: "100%" }}>
              {loading ? "Placing..." : "→ Confirm Order"}
            </Btn>
          </form>
        </div>
      </div>
    </Page>
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
    <Page>
      <PageHeader eyebrow="History" title="All Orders." />

      {loading ? (
        <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMid }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", fontFamily: SERIF, fontSize: 32, color: C.textDim }}>
          No orders placed yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((o) => {
            const idx = STEPS.indexOf(o.status);
            const pct = ["0%", "33%", "66%", "100%"][idx] || "0%";
            return (
              <Card key={o._id}>
                {/* Header */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 24px", borderBottom: `1px solid ${C.border}`,
                  background: C.surface,
                }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                    <span style={{ fontFamily: SERIF, fontSize: 20, color: C.cream }}>{o.fuelType}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13, color: C.textMid }}>{o.quantity} Litres</span>
                  </div>
                  <Badge status={o.status} />
                </div>

                {/* Body */}
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                    <div>
                      <Label>Delivery Location</Label>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: C.text }}>{o.deliveryLocation}</div>
                    </div>
                    <div>
                      <Label>Preferred Time</Label>
                      <div style={{ fontFamily: MONO, fontSize: 12, color: C.text }}>
                        {new Date(o.preferredTime).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div style={{ position: "relative", paddingBottom: 32 }}>
                    {/* Track */}
                    <div style={{ position: "absolute", top: 6, left: 0, right: 0, height: 2, background: C.border }} />
                    <div style={{ position: "absolute", top: 6, left: 0, height: 2, background: C.orange, width: pct, transition: "width 0.6s ease" }} />
                    {/* Steps */}
                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                      {STEPS.map((s, i) => (
                        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 1 }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: "50%",
                            background: i <= idx ? C.orange : C.bg,
                            border: `2px solid ${i <= idx ? C.orange : C.border}`,
                          }} />
                          <span style={{
                            fontFamily: MONO, fontSize: 9, textTransform: "uppercase",
                            letterSpacing: "0.06em", textAlign: "center",
                            color: i <= idx ? C.orange : C.textDim,
                            fontWeight: i <= idx ? 500 : 400,
                            maxWidth: 70,
                            position: "absolute", top: 22,
                          }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  padding: "8px 24px", background: C.surface,
                  borderTop: `1px solid ${C.border}`,
                  fontFamily: MONO, fontSize: 9, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  Order #{o._id.slice(-8).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
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
    <Page>
      <PageHeader eyebrow="Admin" title="Control Room." />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 48 }}>
        <StatCard label="Total" value={stats.total ?? "—"} highlight />
        <StatCard label="Pending" value={stats.pending ?? "—"} />
        <StatCard label="Accepted" value={stats.accepted ?? "—"} />
        <StatCard label="En Route" value={stats.outForDelivery ?? "—"} />
        <StatCard label="Delivered" value={stats.delivered ?? "—"} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <Inp
            placeholder="Search by customer, location or fuel type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: 200 }}>
          <Sel value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Sel>
        </div>
      </div>

      {/* Orders table */}
      <Card>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 0.8fr 0.8fr 2fr 1.5fr 1.8fr",
          padding: "10px 24px",
          background: C.surface, borderBottom: `1px solid ${C.border}`,
          fontFamily: MONO, fontSize: 9, color: C.textDim,
          letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          {["Customer","Fuel","Qty","Location","Status","Update"].map((h) => <span key={h}>{h}</span>)}
        </div>

        {loading ? (
          <div style={{ padding: "40px 24px", fontFamily: MONO, fontSize: 12, color: C.textMid }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", fontFamily: SERIF, fontSize: 24, color: C.textDim }}>
            No orders match.
          </div>
        ) : (
          orders.map((o, i) => (
            <div key={o._id} style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 0.8fr 0.8fr 2fr 1.5fr 1.8fr",
              padding: "15px 24px", alignItems: "center",
              borderBottom: i < orders.length - 1 ? `1px solid ${C.border}` : "none",
              background: i % 2 === 1 ? `${C.surface}66` : "transparent",
            }}>
              <span style={{ fontFamily: SERIF, fontSize: 15, color: C.cream }}>{o.userName || "—"}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.textMid }}>{o.fuelType}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.textMid }}>{o.quantity}L</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.deliveryLocation}</span>
              <Badge status={o.status} />
              <Sel
                disabled={updating === o._id}
                value={o.status}
                onChange={(e) => changeStatus(o._id, e.target.value)}
                style={{ ...inputBase, padding: "7px 30px 7px 10px", fontSize: 11, opacity: updating === o._id ? 0.4 : 1 }}
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </Sel>
            </div>
          ))
        )}
      </Card>
    </Page>
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
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Navbar page={page} setPage={setPage} />
      {render()}
    </div>
  );
}