import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

export default function DashboardLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 bg-dark-bg text-white">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black font-display text-white uppercase tracking-tight">{title}</h1>
          </header>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
