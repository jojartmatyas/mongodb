// Egyszerű auth service a frontendhez
const BASE = '/api/auth';

let authToken = null;

export function setToken(t) { authToken = t; }
export function getToken() { return authToken; }

async function send(path, body, method = 'POST') {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let data;
  try {
    // Ha content-length 0 vagy nincs body → backend nem adott választ (proxy hiba / szerver down)
    const len = res.headers.get('content-length');
    if (len === '0') {
      throw new Error('EMPTY_BODY');
    }
    data = await res.json();
  } catch (e) {
    if (e.message === 'EMPTY_BODY') {
      console.error('Üres válasz a szervertől. A backend valószínűleg nem fut.');
      throw new Error('A backend nem érhető el (üres válasz). Indítsd: npm run server');
    }
    console.error('Nem JSON válasz', e);
    throw new Error('Érvénytelen válasz a szervertől');
  }
  if (!res.ok || !data?.success) {
    console.warn('Auth API hiba', { status: res.status, data });
    const msg = data?.error || `Hiba (status ${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function login(username, password) {
  const data = await send('/login', { username, password });
  if (data.token) setToken(data.token);
  return data;
}
export function register(username, password) {
  return send('/register', { username, password });
}

// --- Admin API ---
const ADMIN_BASE = '/api/admin';

async function adminFetch(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let data;
  try { data = await res.json(); } catch { throw new Error('Érvénytelen admin válasz'); }
  if (!res.ok || !data?.success) throw new Error(data?.error || 'Admin API hiba');
  return data;
}

export const adminApi = {
  listUsers: (q='') => adminFetch(`/users${q?`?q=${encodeURIComponent(q)}`:''}`),
  createUser: (username, password, isAdmin=false) => adminFetch('/users', { method: 'POST', body: { username, password, isAdmin } }),
  updateUser: (id, data) => adminFetch(`/users/${id}`, { method: 'PATCH', body: data }),
  deleteUser: (id) => adminFetch(`/users/${id}`, { method: 'DELETE' }),
  toggleAdmin: (id) => adminFetch(`/users/${id}/toggle-admin`, { method: 'POST' })
};
