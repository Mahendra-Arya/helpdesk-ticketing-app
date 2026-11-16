import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
        Memeriksa Sesi Pengguna...
      </div>
    );
  }

  return token && user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;