import React, { useState, useEffect, useRef } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/authService.js';
import { useAuth } from '../AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const initialState = { username: '', password: '' };

export default function AuthCard() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(0);
  const { user: currentUser, loginSuccess } = useAuth();
  const navigate = useNavigate();

  const cardRef = useRef(null);

  // Progress szimuláció (vizuális feedback)
  useEffect(() => {
    if (loading) {
      setProgress(0);
      let frame = 0;
      const id = setInterval(() => {
        frame += 1;
        setProgress(p => {
          // lassuló közelítés 92%-ig
          const next = p + Math.max(0.5, (95 - p) * 0.07);
          return next > 92 ? 92 : next;
        });
      }, 80);
      return () => clearInterval(id);
    } else {
      // finishing anim
      if (progress < 100) {
        const t = setTimeout(() => setProgress(100), 120);
        return () => clearTimeout(t);
      }
    }
  }, [loading]);

  const isLogin = mode === 'login';

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (!form.username || !form.password) throw new Error('Tölts ki minden mezőt');
      if (isLogin) {
        const data = await apiLogin(form.username, form.password);
        loginSuccess(data.token, data.user);
        setMessage({ type: 'success', text: `Sikeres bejelentkezés: ${data.user.username}` });
        if (data.user.isAdmin) {
          // kis késleltetés hogy a success üzenet látszódjon
          setTimeout(()=> navigate('/admin'), 300);
        }
      } else {
        await apiRegister(form.username, form.password);
        setMessage({ type: 'success', text: `Regisztráció sikeres: ${form.username}` });
        setMode('login');
      }
      setForm(initialState);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Hiba történt' });
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 650); // reset kicsit később hogy látszódjon a 100%
    }
  }

  function handlePointerMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', x.toFixed(3));
    el.style.setProperty('--my', y.toFixed(3));
  }

  function handlePointerLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--mx', 0.5);
    el.style.setProperty('--my', 0.5);
  }

  return (
    <div className="auth-wrapper">
      <div
        className="glass-card enhanced-card"
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="card-decoration layer-glow" aria-hidden></div>
        <div className="card-decoration layer-outline" aria-hidden></div>
        <div className="cursor-glow" aria-hidden></div>
        {loading || progress > 0 ? (
          <div className="card-progress" aria-hidden>
            <span style={{ '--val': `${progress}%` }} className={progress === 100 ? 'done' : ''} />
          </div>
        ) : null}
        <div className="toggle-row">
          <button
            className={isLogin ? 'tab active' : 'tab'}
            onClick={() => { setMode('login'); setMessage(null); }}
            disabled={loading}
          >Login</button>
          <button
            className={!isLogin ? 'tab active' : 'tab'}
            onClick={() => { setMode('register'); setMessage(null); }}
            disabled={loading}
          >Register</button>
        </div>
  <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label>Felhasználó</label>
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Add meg a felhasználónevet"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              aria-label="Felhasználónév"
            />
          </div>
          <div className="field">
            <label>Jelszó</label>
            <input
              type="password"
              name="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="Add meg a jelszót"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              aria-label="Jelszó"
            />
          </div>
          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Küldés...' : isLogin ? 'Belépés' : 'Regisztráció'}
          </button>
        </form>
        {currentUser?.isAdmin && (
          <div className="session-row">
            <button type="button" onClick={()=>navigate('/admin')}>Admin felület</button>
          </div>
        )}
      </div>
    </div>
  );
}
