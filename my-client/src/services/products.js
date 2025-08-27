// src/services/products.js
const API_BASE =
  (import.meta?.env?.VITE_API_BASE_URL?.replace(/\/$/, '')) ||
  'http://localhost:5000/api';

function toQueryString(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export async function fetchProducts(opts = {}) {
  const query = toQueryString({
    q: opts.q,
    category: opts.category,
    brand: opts.brand,
    sort: opts.sort,
    page: opts.page,
    limit: opts.limit,
  });

  try {
    const res = await fetch(`${API_BASE}/products${query}`, {
      method: 'GET',
      signal: opts.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    throw new Error('Không tải được danh sách sản phẩm. Vui lòng thử lại sau.');
  }
}

export async function fetchProductBySlug(slug, signal) {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
      method: 'GET',
      signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    throw new Error('Không tìm thấy sản phẩm. Vui lòng thử lại sau.');
  }
}
