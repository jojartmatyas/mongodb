import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { AuthProvider } from './AuthContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
	<AuthProvider>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/admin" element={<AdminPage />} />
			</Routes>
		</BrowserRouter>
	</AuthProvider>
);
