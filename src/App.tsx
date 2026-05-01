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
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-red-600/5 border border-red-600/20 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 14c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-4 tracking-tight">Configuration Requise</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Le déploiement est réussi, mais les clés de connexion à la base de données ne sont pas encore configurées sur Vercel.
          </p>
          <div className="space-y-3 text-left bg-black/40 p-5 rounded-2xl font-mono text-[11px] text-gray-500 border border-white/5">
            <p className="flex items-center gap-2"><span className="w-4 h-4 bg-white/5 rounded flex items-center justify-center text-[8px]">1</span> Accédez à <span className="text-white">Settings &gt; Environment Variables</span></p>
            <p className="flex items-center gap-2"><span className="w-4 h-4 bg-white/5 rounded flex items-center justify-center text-[8px]">2</span> Ajoutez <span className="text-white font-bold text-primary">VITE_SUPABASE_URL</span></p>
            <p className="flex items-center gap-2"><span className="w-4 h-4 bg-white/5 rounded flex items-center justify-center text-[8px]">3</span> Ajoutez <span className="text-white font-bold text-primary">VITE_SUPABASE_ANON_KEY</span></p>
            <p className="flex items-center gap-4 mt-2 text-[10px] text-gray-400 pt-2 border-t border-white/5 italic">Redémarrez le déploiement ou rafraîchissez cette page après l'ajout.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-black transition-all active:scale-95"
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    );
  }

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
