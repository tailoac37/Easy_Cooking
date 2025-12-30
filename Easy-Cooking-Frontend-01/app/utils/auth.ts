// 🔐 Header bình thường cho JSON
export function getAuthHeader() {
  const raw = localStorage.getItem("token");
  if (!raw) return {};

  const token = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: token };
}

// 🔐 Header dành cho FormData (KHÔNG BAO GIỜ set Content-Type)
export function getAuthHeaderFormData() {
  const raw = localStorage.getItem("token");
  if (!raw) return {};

  const token = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
  return {
    Authorization: token,
  };
}
