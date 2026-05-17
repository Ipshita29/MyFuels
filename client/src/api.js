const BASE = "http://localhost:5000/api";

const token = () => localStorage.getItem("mf_token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token()}`,
});

const post = (url, body, authRequired = false) =>
  fetch(`${BASE}${url}`, {
    method: "POST",
    headers: authRequired ? headers() : { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const get = (url, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}${url}${q ? "?" + q : ""}`, { headers: headers() }).then((r) => r.json());
};

const patch = (url, body) =>
  fetch(`${BASE}${url}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const signup = (data) => post("/signup", data);
export const login = (data) => post("/login", data);
export const placeOrder = (data) => post("/orders", data, true);
export const getMyOrders = () => get("/orders/my");
export const getAllOrders = (params) => get("/admin/orders", params);
export const updateOrderStatus = (id, status) => patch(`/admin/orders/${id}/status`, { status });
export const getStats = () => get("/admin/stats");