import DashboardLayout from '../components/DashboardLayout';
import { auth } from '../lib/auth';
import { User, ShieldCheck } from 'lucide-react';

export default function Settings() {
  const user = auth.getUser();

  return (
    <DashboardLayout title="Paramètres">
      <div className="max-w-2xl space-y-8">
        <section className="card">
          <h2 className="text-xl font-black font-display mb-6 flex items-center gap-2 uppercase tracking-wider">
            <User className="w-5 h-5 text-primary" />
            Informations du Profil
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Nom Complet</p>
                <p className="font-bold text-lg">{user?.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Téléphone</p>
                <p className="font-bold text-lg">{user?.phone}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Nom de l'Entreprise</p>
              <p className="font-bold text-lg">{user?.businessName}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Catégorie</p>
              <p className="font-bold text-lg">{user?.category}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-black font-display mb-6 flex items-center gap-2 uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Sécurité du Compte
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">ID Utilisateur</p>
              <code className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono">{user?.userId}</code>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Rôle</p>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full tracking-widest">
                {user?.role}
              </span>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
