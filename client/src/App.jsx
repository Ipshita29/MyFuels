import { useState, useEffect } from "react";
import { useAuth } from "./store";
import * as api from "./api";

// ─── Design tokens matching the vintage poster aesthetic ──────────────────────
// Cream bg, orange type, dark ink, editorial feel

const STATUS_CONFIG = {
  Pending:          { color: "#D85A30", bg: "#FAE8E0", dot: "#D85A30" },
  Accepted:         { color: "#1D4E89", bg: "#EAF1F8", dot: "#1D4E89" },
  "Out for Delivery": { color: "#8B5E1E", bg: "#FBF3E2", dot: "#E8960C" },
  Delivered:        { color: "#2D6A4F", bg: "#E9F5EE", dot: "#52B788" },
};

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: "#555", bg: "#eee", dot: "#999" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: cfg.bg, color: cfg.color,
      padding: "4px 10px", borderRadius: 2,
      fontFamily: "'Courier New', monospace",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", border: `1px solid ${cfg.color}33`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block", flexShrink: 0 }} />
      {status}
    </span>
  );
};

const Label = ({ children }) => (
  <div style={{
    fontFamily: "'Courier New', monospace",
    fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
    color: "#8B7355", textTransform: "uppercase", marginBottom: 6,
  }}>{children}</div>
);

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#FAF7F2",
  border: "1px solid #D4C5A9",
  borderRadius: 2,
  padding: "10px 14px",
  fontFamily: "'Courier New', monospace",
  fontSize: 14, color: "#2C1810",
  outline: "none",
};

const Input = (props) => <input style={inputStyle} {...props} />;

const ErrorBox = ({ msg }) => msg ? (
  <div style={{
    background: "#FAE8E0", border: "1px solid #D85A30",
    borderLeft: "4px solid #D85A30",
    padding: "10px 14px", marginBottom: 16, borderRadius: 2,
    fontFamily: "'Courier New', monospace", fontSize: 12, color: "#8B2500",
    letterSpacing: "0.03em",
  }}>{msg}</div>
) : null;

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
    <div style={{ minHeight: "100vh", background: "#F5EDD8", display: "flex" }}>
      {/* Left panel */}
      <div style={{
        flex: "0 0 55%", background: "#F5EDD8",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "48px 56px",
        borderRight: "1px solid #D4C5A9", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: 32, width: 1, height: "100%", background: "#D4C5A9", opacity: 0.5 }} />
        <div style={{ position: "absolute", top: 0, right: 32, width: 1, height: "100%", background: "#D4C5A9", opacity: 0.5 }} />

        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 10, letterSpacing: "0.25em",
          color: "#8B7355", textTransform: "uppercase",
        }}>Premium Fuel · Fast Delivery</div>

        <div>
          <div style={{
            fontSize: 100, fontWeight: 900, lineHeight: 0.88,
            color: "#D85A30", fontFamily: "Georgia, 'Times New Roman', serif",
            textTransform: "uppercase", letterSpacing: "-0.02em",
            marginBottom: 20,
          }}>MY<br />FUELS</div>
          <div style={{
            fontSize: 12, color: "#6B5540",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "0.08em", lineHeight: 2,
            borderTop: "1px solid #D4C5A9", paddingTop: 16,
            textTransform: "uppercase",
          }}>
            Building the future<br />of energy commerce.
          </div>
        </div>

        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 9, color: "#B09A7E", letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          Est. 2024 · Pune, India
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 48px", background: "#FAF7F2",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9, letterSpacing: "0.3em",
            color: "#B09A7E", textTransform: "uppercase", marginBottom: 20,
          }}>
            {isLogin ? "— Sign in to continue" : "— Create your account"}
          </div>

          <h2 style={{
            fontSize: 32, fontWeight: 900, color: "#2C1810",
            fontFamily: "Georgia, serif", marginBottom: 32, lineHeight: 1,
            textTransform: "uppercase", letterSpacing: "-0.01em", margin: "0 0 32px",
          }}>
            {isLogin ? "Welcome back." : "Join the fleet."}
          </h2>

          <ErrorBox msg={error} />

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!isLogin && (
              <div>
                <Label>Full Name</Label>
                <Input name="name" placeholder="Your name" value={form.name} onChange={handle} required />
              </div>
            )}
            <div>
              <Label>Email Address</Label>
              <Input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>

            <button disabled={loading} style={{
              marginTop: 8, background: loading ? "#C4916A" : "#D85A30",
              color: "#FAF7F2", border: "none",
              padding: "14px 0", width: "100%",
              fontFamily: "'Courier New', monospace",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
              borderRadius: 2, transition: "background 0.15s",
            }}>
              {loading ? "Please wait..." : isLogin ? "→ Sign In" : "→ Create Account"}
            </button>
          </form>

          <div style={{
            marginTop: 24, paddingTop: 20, borderTop: "1px solid #D4C5A9",
            fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8B7355",
          }}>
            {isLogin ? "No account? " : "Have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }} style={{
              background: "none", border: "none", color: "#D85A30",
              fontFamily: "'Courier New', monospace", fontSize: 11,
              fontWeight: 700, cursor: "pointer", textDecoration: "underline",
              letterSpacing: "0.05em", padding: 0,
            }}>
              {isLogin ? "Sign up here" : "Sign in instead"}
            </button>
          </div>
          <div style={{
            marginTop: 10, fontFamily: "'Courier New', monospace",
            fontSize: 10, color: "#B09A7E",
          }}>
            Admin demo: admin@myfuels.com / admin123
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
    { id: "dashboard", label: "Dashboard" },
    { id: "place-order", label: "New Order" },
    { id: "history", label: "My Orders" },
  ];
  const adminLinks = [{ id: "admin", label: "Control Room" }];
  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <nav style={{ background: "#F5EDD8", borderBottom: "1px solid #D4C5A9", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: 18, fontWeight: 900, color: "#D85A30",
          fontFamily: "Georgia, serif", textTransform: "uppercase", letterSpacing: "-0.01em",
        }}>⛽ MyFuels</span>

        <div style={{ display: "flex", gap: 4 }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => setPage(l.id)} style={{
              padding: "6px 14px",
              background: page === l.id ? "#D85A30" : "transparent",
              color: page === l.id ? "#FAF7F2" : "#6B5540",
              border: `1px solid ${page === l.id ? "#D85A30" : "transparent"}`,
              borderRadius: 2, cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", transition: "all 0.15s",
            }}>{l.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8B7355" }}>
            {user?.name}
            {user?.role === "admin" && (
              <span style={{
                marginLeft: 6, fontSize: 9, background: "#D85A30",
                color: "#FAF7F2", padding: "2px 6px", borderRadius: 1,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>admin</span>
            )}
          </span>
          <button onClick={logout} style={{
            background: "none", border: "1px solid #D4C5A9",
            padding: "4px 12px", borderRadius: 2, cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontSize: 10,
            color: "#8B7355", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Exit</button>
        </div>
      </div>
    </nav>
  );
};

const Page = ({ children }) => (
  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>{children}</div>
);

const PageTitle = ({ label, title }) => (
  <div style={{ marginBottom: 40 }}>
    <div style={{
      fontFamily: "'Courier New', monospace", fontSize: 10,
      letterSpacing: "0.25em", color: "#B09A7E", textTransform: "uppercase", marginBottom: 8,
    }}>— {label}</div>
    <h1 style={{
      fontSize: 44, fontWeight: 900, color: "#2C1810",
      fontFamily: "Georgia, serif", textTransform: "uppercase",
      letterSpacing: "-0.02em", lineHeight: 1, margin: 0,
    }}>{title}</h1>
  </div>
);

const StatCard = ({ label, value, accent }) => (
  <div style={{
    background: accent ? "#D85A30" : "#F5EDD8",
    border: `1px solid ${accent ? "#C04E26" : "#D4C5A9"}`,
    padding: "22px 24px", borderRadius: 2,
  }}>
    <div style={{
      fontFamily: "'Courier New', monospace", fontSize: 9,
      letterSpacing: "0.2em", textTransform: "uppercase",
      color: accent ? "#FAD5C0" : "#8B7355", marginBottom: 8,
    }}>{label}</div>
    <div style={{
      fontSize: 44, fontWeight: 900, fontFamily: "Georgia, serif",
      color: accent ? "#FAF7F2" : "#D85A30", lineHeight: 1,
    }}>{value}</div>
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ setPage }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders().then((d) => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const counts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    active: orders.filter((o) => o.status === "Out for Delivery").length,
  };

  return (
    <Page>
      <PageTitle label="Your account" title={`Hey, ${user?.name.split(" ")[0]}.`} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 48 }}>
        <StatCard label="Total Orders" value={counts.total} accent />
        <StatCard label="Pending" value={counts.pending} />
        <StatCard label="En Route" value={counts.active} />
        <StatCard label="Delivered" value={counts.delivered} />
      </div>

      <div style={{ borderTop: "2px solid #2C1810", paddingTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <div style={{
            fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 900,
            color: "#2C1810", textTransform: "uppercase",
          }}>Recent Orders</div>
          <button onClick={() => setPage("history")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Courier New', monospace", fontSize: 10,
            color: "#D85A30", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700,
          }}>View all →</button>
        </div>

        {loading ? (
          <div style={{ fontFamily: "'Courier New', monospace", color: "#B09A7E", fontSize: 12 }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 900,
              color: "#D4C5A9", textTransform: "uppercase", marginBottom: 20,
            }}>No orders yet.</div>
            <button onClick={() => setPage("place-order")} style={{
              background: "#D85A30", color: "#FAF7F2", border: "none",
              padding: "12px 28px", borderRadius: 2, cursor: "pointer",
              fontFamily: "'Courier New', monospace", fontSize: 11,
              fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            }}>→ Place First Order</button>
          </div>
        ) : (
          <>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 2fr 1.5fr",
              padding: "8px 0", borderBottom: "1px solid #D4C5A9",
              fontFamily: "'Courier New', monospace", fontSize: 9,
              letterSpacing: "0.18em", color: "#B09A7E", textTransform: "uppercase",
            }}>
              {["Fuel Type","Qty","Status","Location","Date"].map(h => <span key={h}>{h}</span>)}
            </div>
            {orders.slice(0,5).map((o, i) => (
              <div key={o._id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 2fr 1.5fr",
                padding: "14px 0", alignItems: "center",
                borderBottom: "1px solid #EDE5D2",
                background: i % 2 === 0 ? "transparent" : "#F5EDD822",
              }}>
                <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 15, color: "#2C1810" }}>{o.fuelType}</span>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#6B5540" }}>{o.quantity}L</span>
                <Badge status={o.status} />
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#8B7355", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.deliveryLocation}</span>
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#B09A7E" }}>
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
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
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await api.placeOrder(form);
      if (res.error) return setError(res.error);
      setSuccess(true);
      setTimeout(() => setPage("history"), 2000);
    } finally { setLoading(false); }
  };

  if (success) return (
    <Page>
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <div style={{
          fontSize: 80, fontWeight: 900, color: "#D85A30",
          fontFamily: "Georgia, serif", textTransform: "uppercase",
          lineHeight: 0.9, marginBottom: 24,
        }}>Order<br />Placed!</div>
        <div style={{ fontFamily: "'Courier New', monospace", color: "#8B7355", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Redirecting to your orders...
        </div>
      </div>
    </Page>
  );

  const fuels = [
    { type: "Petrol", desc: "Regular unleaded · Widely available" },
    { type: "Diesel", desc: "High-cetane · Commercial grade" },
    { type: "CNG", desc: "Compressed natural gas · Eco choice" },
    { type: "LPG", desc: "Liquefied petroleum · Auto LPG" },
  ];

  return (
    <Page>
      <PageTitle label="New Order" title="Fuel Request." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        {/* Fuel selector */}
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: "0.2em", color: "#B09A7E", textTransform: "uppercase", marginBottom: 14 }}>
            01 — Select Fuel Type
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fuels.map((f) => (
              <button key={f.type} onClick={() => setForm({ ...form, fuelType: f.type })} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "18px 20px",
                background: form.fuelType === f.type ? "#D85A30" : "#F5EDD8",
                border: `1px solid ${form.fuelType === f.type ? "#C04E26" : "#D4C5A9"}`,
                borderRadius: 2, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}>
                <div>
                  <div style={{
                    fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 16,
                    color: form.fuelType === f.type ? "#FAF7F2" : "#2C1810", textTransform: "uppercase",
                  }}>{f.type}</div>
                  <div style={{
                    fontFamily: "'Courier New', monospace", fontSize: 10,
                    color: form.fuelType === f.type ? "#FAD5C0" : "#8B7355",
                    letterSpacing: "0.05em", marginTop: 3,
                  }}>{f.desc}</div>
                </div>
                {form.fuelType === f.type && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FAF7F2", flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: "0.2em", color: "#B09A7E", textTransform: "uppercase", marginBottom: 14 }}>
            02 — Order Details
          </div>
          <ErrorBox msg={error} />
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <Label>Quantity (Litres)</Label>
              <Input name="quantity" type="number" min="1" placeholder="e.g. 20" value={form.quantity} onChange={handle} required />
            </div>
            <div>
              <Label>Delivery Location</Label>
              <Input name="deliveryLocation" placeholder="Full address" value={form.deliveryLocation} onChange={handle} required />
            </div>
            <div>
              <Label>Preferred Delivery Time</Label>
              <Input name="preferredTime" type="datetime-local" value={form.preferredTime} onChange={handle} required />
            </div>
            {form.quantity && (
              <div style={{ background: "#F5EDD8", border: "1px solid #D4C5A9", padding: "16px 20px", borderRadius: 2 }}>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: "0.2em", color: "#B09A7E", textTransform: "uppercase", marginBottom: 6 }}>Order Summary</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 900, color: "#D85A30" }}>
                  {form.fuelType} · {form.quantity}L
                </div>
              </div>
            )}
            <button disabled={loading} style={{
              background: loading ? "#C4916A" : "#D85A30", color: "#FAF7F2", border: "none",
              padding: "16px", borderRadius: 2,
              fontFamily: "'Courier New', monospace", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Placing Order..." : "→ Confirm Order"}
            </button>
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
    api.getMyOrders().then((d) => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const steps = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

  return (
    <Page>
      <PageTitle label="Your history" title="All Orders." />
      {loading ? (
        <div style={{ fontFamily: "'Courier New', monospace", color: "#B09A7E", fontSize: 12 }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 900, color: "#D4C5A9", textTransform: "uppercase" }}>
          No orders found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((o) => {
            const stepIdx = steps.indexOf(o.status);
            return (
              <div key={o._id} style={{ background: "#F5EDD8", border: "1px solid #D4C5A9", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 24px", borderBottom: "1px solid #D4C5A9", background: "#FAF7F2",
                }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 18, color: "#2C1810", textTransform: "uppercase" }}>{o.fuelType}</span>
                    <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#8B7355" }}>{o.quantity} Litres</span>
                  </div>
                  <Badge status={o.status} />
                </div>

                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                    <div>
                      <Label>Delivery Location</Label>
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#2C1810" }}>{o.deliveryLocation}</div>
                    </div>
                    <div>
                      <Label>Preferred Time</Label>
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#2C1810" }}>
                        {new Date(o.preferredTime).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div style={{ position: "relative", paddingBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                      <div style={{ position: "absolute", top: 7, left: 0, right: 0, height: 2, background: "#D4C5A9" }} />
                      <div style={{
                        position: "absolute", top: 7, left: 0, height: 2, background: "#D85A30",
                        width: ["0%","33%","66%","100%"][stepIdx] || "0%", transition: "width 0.5s",
                      }} />
                      {steps.map((s, i) => (
                        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: "50%",
                            background: i <= stepIdx ? "#D85A30" : "#FAF7F2",
                            border: `2px solid ${i <= stepIdx ? "#D85A30" : "#D4C5A9"}`,
                          }} />
                          <span style={{
                            fontFamily: "'Courier New', monospace", fontSize: 9,
                            letterSpacing: "0.06em", color: i <= stepIdx ? "#D85A30" : "#B09A7E",
                            textTransform: "uppercase", fontWeight: i <= stepIdx ? 700 : 400,
                            textAlign: "center", maxWidth: 64,
                          }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: "8px 24px", background: "#EDE5D2",
                  fontFamily: "'Courier New', monospace", fontSize: 9,
                  color: "#B09A7E", letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  Order #{o._id.slice(-8).toUpperCase()} · Placed {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </div>
              </div>
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

  const statuses = ["Pending", "Accepted", "Out for Delivery", "Delivered"];

  return (
    <Page>
      <PageTitle label="Admin" title="Control Room." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 48 }}>
        <StatCard label="Total Orders" value={stats.total ?? "—"} accent />
        <StatCard label="Pending" value={stats.pending ?? "—"} />
        <StatCard label="En Route" value={stats.outForDelivery ?? "—"} />
        <StatCard label="Delivered" value={stats.delivered ?? "—"} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          placeholder="Search customers, locations, fuel types..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "auto", flex: "0 0 180px" }}>
          <option value="all">All Statuses</option>
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ fontFamily: "'Courier New', monospace", color: "#B09A7E", fontSize: 12 }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 900, color: "#D4C5A9", textTransform: "uppercase" }}>
          No orders match.
        </div>
      ) : (
        <div style={{ border: "1px solid #D4C5A9", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr 2fr 1.5fr 1.8fr",
            padding: "10px 20px", background: "#F5EDD8", borderBottom: "1px solid #D4C5A9",
            fontFamily: "'Courier New', monospace", fontSize: 9,
            letterSpacing: "0.18em", color: "#8B7355", textTransform: "uppercase",
          }}>
            {["Customer","Fuel","Qty","Location","Status","Update"].map(h => <span key={h}>{h}</span>)}
          </div>

          {orders.map((o, i) => (
            <div key={o._id} style={{
              display: "grid", gridTemplateColumns: "1.5fr 0.8fr 0.8fr 2fr 1.5fr 1.8fr",
              padding: "14px 20px", alignItems: "center",
              borderBottom: "1px solid #EDE5D2",
              background: i % 2 === 0 ? "#FAF7F2" : "#F5EDD8",
            }}>
              <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 14, color: "#2C1810" }}>{o.userName || "—"}</span>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#6B5540" }}>{o.fuelType}</span>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#6B5540" }}>{o.quantity}L</span>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#8B7355", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.deliveryLocation}</span>
              <Badge status={o.status} />
              <select
                disabled={updating === o._id}
                value={o.status}
                onChange={(e) => changeStatus(o._id, e.target.value)}
                style={{ ...inputStyle, padding: "6px 10px", fontSize: 11, opacity: updating === o._id ? 0.5 : 1 }}
              >
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState(user?.role === "admin" ? "admin" : "dashboard");

  if (!user) return <AuthPage />;

  const renderPage = () => {
    if (user.role === "admin") return <AdminPanel />;
    switch (page) {
      case "place-order": return <PlaceOrder setPage={setPage} />;
      case "history": return <OrderHistory />;
      default: return <Dashboard setPage={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2" }}>
      <Navbar page={page} setPage={setPage} />
      {renderPage()}
    </div>
  );
}