import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShoppingBag,
  Menu,
  X,
  Truck,
  Store
} from 'lucide-react';
import { auth } from '../lib/auth';
import { cn } from '../lib/utils';
import { useState } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.getUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    { 
      label: 'Vue d\'ensemble', 
      path: `/dashboard/${user.role}`, 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    ...(user.role === 'admin' ? [
      { label: 'Produits', path: '/dashboard/admin#produits', icon: <Package className="w-5 h-5" /> },
      { label: 'Fournisseurs', path: '/dashboard/admin#fournisseurs', icon: <Truck className="w-5 h-5" /> },
      { label: 'Vendeurs', path: '/dashboard/admin#vendeurs', icon: <Store className="w-5 h-5" /> },
      { label: 'Transactions', path: '/dashboard/admin#transactions', icon: <CreditCard className="w-5 h-5" /> },
    ] : []),
    ...(user.role === 'supplier' ? [
      { label: 'Mes Produits', path: '/dashboard/supplier#produits', icon: <Package className="w-5 h-5" /> },
      { label: 'Gestion Stock', path: '/dashboard/supplier#stock', icon: <Truck className="w-5 h-5" /> },
    ] : []),
    ...(user.role === 'dropshipper' ? [
      { label: 'Catalogue', path: '/dashboard/dropshipper#catalogue', icon: <Package className="w-5 h-5" /> },
      { label: 'Mes Commandes', path: '/dashboard/dropshipper#commandes', icon: <CreditCard className="w-5 h-5" /> },
    ] : []),
    { label: 'Paramètres', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-2 text-white bg-transparent border border-white/20 rounded-xl backdrop-blur-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-40 w-64 bg-dark-bg text-white border-r border-white/10 transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black font-display tracking-tighter">DROPSHAP</span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  location.pathname === item.path 
                    ? "bg-primary text-black shadow-lg shadow-primary/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 truncate uppercase font-black tracking-widest">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
