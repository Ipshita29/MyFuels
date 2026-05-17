const BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Auth
export const signup = (data) =>
  fetch(`${BASE}/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json());

export const login = (data) =>
  fetch(`${BASE}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json());

// User
export const placeOrder = (data) =>
  fetch(`${BASE}/orders`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then((r) => r.json());

export const getMyOrders = () =>
  fetch(`${BASE}/orders/my`, { headers: headers() }).then((r) => r.json());

// Admin
export const getAllOrders = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}/admin/orders?${q}`, { headers: headers() }).then((r) => r.json());
};

export const updateOrderStatus = (id, status) =>
  fetch(`${BASE}/admin/orders/${id}/status`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status }) }).then((r) => r.json());

export const getStats = () =>
  fetch(`${BASE}/admin/stats`, { headers: headers() }).then((r) => r.json());