import React, { createContext, useContext, useEffect, useState } from 'react';
import { setToken as setApiToken } from './api/authService.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  // Betöltés localStorage-ból (ha van)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const { token: t, user: u } = JSON.parse(raw);
        if (t && u) {
          setToken(t);
          setUser(u);
          setApiToken(t);
        }
      }
    } catch {}
    setReady(true);
  }, []);

  function loginSuccess(t, u) {
    setToken(t); setUser(u); setApiToken(t);
    localStorage.setItem('auth', JSON.stringify({ token: t, user: u }));
  }

  function logout() {
    setToken(null); setUser(null); setApiToken(null); localStorage.removeItem('auth');
  }

  return (
    <AuthCtx.Provider value={{ user, token, ready, loginSuccess, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }
