import React, { useEffect, useState, useRef } from 'react';
import { adminApi } from '../api/authService.js';

export default function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', isAdmin: false });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ username: '', password: '', isAdmin: false });
  const panelRef = useRef(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const data = await adminApi.listUsers(search.trim());
      setUsers(data.users);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Debounce keresés gépelés közben
  const searchDebounceRef = useRef();
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    // ha üres → azonnal listáz mindent
    if (search.trim() === '') {
      searchDebounceRef.current = setTimeout(() => { load(); }, 120);
      return;
    }
    searchDebounceRef.current = setTimeout(() => { load(); }, 220);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  function handleCreateChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }
  async function handleCreate(e) {
    e.preventDefault();
    try {
      await adminApi.createUser(form.username, form.password, form.isAdmin);
      setForm({ username: '', password: '', isAdmin: false });
      setCreating(false);
      load();
    } catch (e2) { alert(e2.message); }
  }

  function startEdit(u) {
    setEditingId(u._id || u.id);
    setEditData({ username: u.username, password: '', isAdmin: !!u.isAdmin });
  }
  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    setEditData(d => ({ ...d, [name]: type === 'checkbox' ? checked : value }));
  }
  async function saveEdit(id) {
    const payload = {};
    if (editData.username) payload.username = editData.username;
    if (editData.password) payload.password = editData.password;
    payload.isAdmin = editData.isAdmin;
    try { await adminApi.updateUser(id, payload); setEditingId(null); load(); }
    catch (e) { alert(e.message); }
  }
  async function del(id) {
    if (!window.confirm('Biztos törlöd?')) return;
    try { await adminApi.deleteUser(id); load(); }
    catch (e) { alert(e.message); }
  }
  async function toggle(id) { try { await adminApi.toggleAdmin(id); load(); } catch (e) { alert(e.message); } }

  async function doSearch(e) { e.preventDefault(); load(); }

  function handlePointerMove(e) {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', x.toFixed(3));
    el.style.setProperty('--my', y.toFixed(3));
  }
  function handlePointerLeave() {
    const el = panelRef.current;
    if (!el) return;
    el.style.setProperty('--mx', 0.5);
    el.style.setProperty('--my', 0.5);
  }

  return (
    <div
      className="admin-panel glass-card enhanced-card"
      ref={panelRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="card-decoration layer-glow" aria-hidden />
      <div className="card-decoration layer-outline" aria-hidden />
      <div className="cursor-glow" aria-hidden />
      <h2 className="admin-heading">Admin felület</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={doSearch} className="admin-search-row" role="search">
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Keresés (pl. m)"
          aria-label="Felhasználónév keresése"
        />
        <button type="submit" disabled={loading}>Keres</button>
        <button type="button" onClick={()=>{ setSearch(''); load(); }} disabled={loading || search===''}>Összes</button>
        <button type="button" onClick={load} disabled={loading}>Frissítés</button>
        <button type="button" onClick={()=>setCreating(c=>!c)}>{creating? 'Mégse':'Új felhasználó'}</button>
      </form>
      {creating && (
        <form onSubmit={handleCreate} className="admin-create-form">
          <input name="username" value={form.username} onChange={handleCreateChange} placeholder="Felhasználónév" required />
            <input name="password" type="password" value={form.password} onChange={handleCreateChange} placeholder="Jelszó" required />
          <label><input type="checkbox" name="isAdmin" checked={form.isAdmin} onChange={handleCreateChange} /> Admin</label>
          <button type="submit">Létrehoz</button>
        </form>
      )}
      {loading ? <p>Betöltés...</p> : (
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>Felhasználó</th>
              <th>Admin</th>
              <th>Létrehozva</th>
              <th>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const id = u._id || u.id;
              const editing = editingId === id;
              return (
                <tr key={id} className={currentUser?.username === u.username ? 'self-row' : ''}>
                  <td>
                    {editing ? (
                      <input name="username" value={editData.username} onChange={handleEditChange} />
                    ) : u.username}
                    {currentUser?.username === u.username && <span className="badge">te</span>}
                  </td>
                  <td>
                    {editing ? (
                      <input type="checkbox" name="isAdmin" checked={editData.isAdmin} onChange={handleEditChange} />
                    ) : (
                      <button type="button" onClick={()=>toggle(id)} className={u.isAdmin? 'flag on':'flag off'}>
                        {u.isAdmin ? '✔' : '✖'}
                      </button>
                    )}
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                  <td>
                    {editing ? (
                      <>
                        <input name="password" type="password" value={editData.password} onChange={handleEditChange} placeholder="(új jelszó)" />
                        <button onClick={()=>saveEdit(id)} type="button">Mentés</button>
                        <button onClick={()=>setEditingId(null)} type="button">Mégse</button>
                      </>
                    ) : (
                      <>
                        <button onClick={()=>startEdit(u)} type="button">Szerk.</button>
                        <button onClick={()=>del(id)} type="button" disabled={currentUser?.username === u.username}>Törlés</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan="4">Nincs találat</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
