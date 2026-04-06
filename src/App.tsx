import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import DropshipperDashboard from './pages/DropshipperDashboard';
import { auth } from './lib/auth';
import { UserRole } from './types';

import Settings from './pages/Settings';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: UserRole }) {
  const user = auth.getUser();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route 
          path="/dashboard/admin/*" 
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/supplier/*" 
          element={
            <ProtectedRoute role="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/dropshipper/*" 
          element={
            <ProtectedRoute role="dropshipper">
              <DropshipperDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

        <Route path="/admin-secret" element={<Navigate to="/dashboard/admin" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
