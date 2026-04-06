import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, UserPlus, ShieldCheck, Truck, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

export default function Signup() {
  const [role, setRole] = useState<UserRole>('dropshipper');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    businessName: '',
    category: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = auth.signup({
        ...formData,
        role,
      });
      toast.success(`Account created! Welcome, ${user.name}`);
      navigate(`/dashboard/${user.role}`);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col lg:flex-row font-sans">
      {/* Left Side - Branding */}
      <div className="lg:w-1/3 p-12 flex flex-col justify-between relative overflow-hidden bg-primary/5">
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
            <h1 className="text-4xl lg:text-5xl font-black font-display text-white leading-tight mb-8">
              Rejoignez le <span className="text-primary">futur</span> du commerce en Afrique.
            </h1>
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
              Créez votre compte et commencez à développer votre activité de dropshipping dès aujourd'hui.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-2/3 p-8 lg:p-24 flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black font-display mb-3">Créer un compte</h2>
            <p className="text-gray-500 font-medium">Remplissez vos informations pour commencer l'aventure.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { id: 'dropshipper', label: 'Vendeur', icon: <UserIcon className="w-5 h-5" /> },
                { id: 'supplier', label: 'Fournisseur', icon: <Truck className="w-5 h-5" /> },
                { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-5 h-5" /> },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as UserRole)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all",
                    role === r.id 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200"
                  )}
                >
                  {r.icon}
                  <span className="text-sm font-bold uppercase tracking-wider">{r.label}</span>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Yao Didier"
                  className="input-field py-4 px-6 rounded-2xl"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Numéro de Téléphone</label>
                <input 
                  type="tel" 
                  required
                  placeholder="ex: 2250102030405"
                  className="input-field py-4 px-6 rounded-2xl"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nom de l'Entreprise</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Alimentation Express"
                  className="input-field py-4 px-6 rounded-2xl"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Catégorie</label>
                <select 
                  required
                  className="input-field py-4 px-6 rounded-2xl"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Choisir une catégorie</option>
                  <option value="Alimentaire">Alimentaire</option>
                  <option value="Santé">Santé</option>
                  <option value="Beauté">Beauté</option>
                  <option value="Électronique">Électronique</option>
                  <option value="Mode">Mode</option>
                  <option value="Maison">Maison</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full py-5 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
            >
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
              <UserPlus className="ml-2 w-5 h-5" />
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500 font-medium">
            Déjà un compte ? <Link to="/login" className="text-primary font-black hover:underline">Se connecter</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
