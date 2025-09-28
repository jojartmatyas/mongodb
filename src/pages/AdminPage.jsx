import React from 'react';
import { useAuth } from '../AuthContext.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import { Link, Navigate } from 'react-router-dom';

export default function AdminPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return (
    <div className="admin-page-wrapper app-bg">
      <div className="bg-image-overlay" />
      <div className="admin-page-header">
        <h1>Admin felület</h1>
        <Link to="/" className="back-link">Vissza a főoldalra</Link>
      </div>
      <div className="admin-panel-container">
        <AdminPanel currentUser={user} />
      </div>
    </div>
  );
}
