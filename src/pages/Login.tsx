import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, LogIn, User as UserIcon, ShieldCheck, Truck } from 'lucide-react';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { UserRole } from '../types';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const user = auth.login(phone);
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/dashboard/${user.role}`);
    } else {
      toast.error('User not found. Please sign up or use a demo account.');
    }
    setIsLoading(false);
  };

  const handleDemoLogin = (role: UserRole) => {
    const user = auth.loginAsDemo(role);
    toast.success(`Logged in as ${role} demo`);
    navigate(`/dashboard/${user.role}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col lg:flex-row font-sans">
      {/* Left Side - Branding */}
      <div className="lg:w-1/2 p-12 flex flex-col justify-between relative overflow-hidden bg-primary/5">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black font-display tracking-tighter text-white">DROPSHAP</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-black font-display text-white leading-tight mb-8">
              Bon retour sur <span className="text-primary">Dropshap</span>.
            </h1>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              Accédez à votre tableau de bord et gérez vos opérations de dropshipping en toute simplicité.
            </p>
          </motion.div>
        </div>
        
        <div className="relative z-10 mt-20">
          <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-white font-bold">Accès Sécurisé</p>
              <p className="text-gray-400 text-sm">Vos données sont protégées et cryptées.</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 p-8 lg:p-24 flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black font-display mb-3">Connexion</h2>
            <p className="text-gray-500 font-medium">Entrez votre numéro de téléphone pour accéder à votre compte.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mb-12">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Numéro de Téléphone</label>
              <input 
                type="tel" 
                required
                placeholder="ex: 2250102030405"
                className="input-field py-4 px-6 rounded-2xl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full py-5 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
              <LogIn className="ml-2 w-5 h-5" />
            </button>
          </form>

          <div className="relative mb-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest text-[10px]">Ou utiliser un compte démo</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <button 
              onClick={() => handleDemoLogin('admin')}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <ShieldCheck className="w-6 h-6 text-gray-400 group-hover:text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Admin</span>
            </button>
            <button 
              onClick={() => handleDemoLogin('supplier')}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <Truck className="w-6 h-6 text-gray-400 group-hover:text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Fournisseur</span>
            </button>
            <button 
              onClick={() => handleDemoLogin('dropshipper')}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <UserIcon className="w-6 h-6 text-gray-400 group-hover:text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Vendeur</span>
            </button>
          </div>

          <p className="text-center text-gray-500 font-medium">
            Pas encore de compte ? <Link to="/signup" className="text-primary font-black hover:underline">S'inscrire</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
