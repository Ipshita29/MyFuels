const BASE_URL = "http://localhost:5000";

export const getData = async () => {
  const res = await fetch(`${BASE_URL}/`);
  return res.text();
};