import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore.js';
import Layout from './components/layout/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import InventoryPage from './pages/InventoryPage.jsx';
import POSPage from './pages/POSPage.jsx';
import StatsPage from './pages/StatsPage.jsx';

function PrivateRoute({ children }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (!user) return <div className="flex items-center justify-center h-screen text-slate-400">Cargando...</div>;
  return children;
}

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventario" element={<InventoryPage />} />
        <Route path="pos" element={<POSPage />} />
        <Route path="estadisticas" element={<StatsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
