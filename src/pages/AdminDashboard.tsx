import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import { Package, Users, Truck, CreditCard, TrendingUp } from 'lucide-react';
import { dataService } from '../lib/data';
import { Product, Transaction, Dropshipper, RegisteredSupplier } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dropshippers, setDropshippers] = useState<Dropshipper[]>([]);
  const [suppliers, setSuppliers] = useState<RegisteredSupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [p, t, d, s] = await Promise.all([
        dataService.getProducts(),
        dataService.getTransactions(),
        dataService.getDropshippers(),
        dataService.getSuppliers(),
      ]);
      setProducts(p);
      setTransactions(t);
      setDropshippers(d);
      setSuppliers(s);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const totalEarnings = transactions.reduce((acc, t) => acc + t.montant_dropshipper, 0);
  const totalStock = products.reduce((acc, p) => acc + p.stock_available, 0);
  const uniqueSuppliersCount = new Set(products.map(p => p.supplier_name).filter(Boolean)).size;

  return (
    <DashboardLayout title="Vue d'ensemble Admin">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <StatsCard 
          label="Total Produits" 
          value={products.length} 
          icon={<Package className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Total Fournisseurs" 
          value={uniqueSuppliersCount} 
          icon={<Truck className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Stock Total" 
          value={totalStock} 
          icon={<TrendingUp className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Total Transactions" 
          value={transactions.length} 
          icon={<CreditCard className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Gains Vendeurs" 
          value={formatCurrency(totalEarnings)} 
          icon={<Users className="w-6 h-6" />} 
          className="bg-primary/5 border-primary/20"
        />
      </div>

      <div className="space-y-10">
        <section id="produits">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Produits Récents</h2>
            <button className="text-sm font-bold text-primary hover:underline">Voir tout</button>
          </div>
          <DataTable<Product> 
            isLoading={isLoading}
            data={products.slice(0, 5)}
            columns={[
              { header: 'Code', accessor: 'product_code' },
              { header: 'Nom du Produit', accessor: 'product_name' },
              { header: 'Catégorie', accessor: 'category' },
              { header: 'Prix Fournisseur', accessor: (p: Product) => formatCurrency(p.supplier_price) },
              { header: 'Prix Public', accessor: (p: Product) => formatCurrency(p.label_price) },
              { header: 'Stock', accessor: 'stock_available' },
              { header: 'Fournisseur', accessor: 'supplier_name' },
              { 
                header: 'Statut', 
                accessor: (p: Product) => (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    p.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {p.is_active ? 'Actif' : 'Inactif'}
                  </span>
                ) 
              },
            ]}
          />
        </section>

        <section id="transactions">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Transactions Récentes</h2>
            <button className="text-sm font-bold text-primary hover:underline">Voir tout</button>
          </div>
          <DataTable<Transaction> 
            isLoading={isLoading}
            data={transactions}
            columns={[
              { header: 'Client', accessor: 'contact_client' },
              { header: 'Produit', accessor: 'produit' },
              { header: 'Qté', accessor: 'quantite' },
              { header: 'Fournisseur', accessor: 'fournisseur' },
              { header: 'Montant Client', accessor: (t: Transaction) => formatCurrency(t.montant_client) },
              { header: 'Montant Fournisseur', accessor: (t: Transaction) => formatCurrency(t.montant_supplier) },
              { header: 'Gains', accessor: (t: Transaction) => formatCurrency(t.montant_dropshipper), className: 'font-bold text-green-600' },
            ]}
          />
        </section>

        <section id="fournisseurs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Liste des Fournisseurs</h2>
          </div>
          <DataTable<RegisteredSupplier> 
            isLoading={isLoading}
            data={suppliers}
            columns={[
              { header: 'Nom', accessor: 'nom' },
              { header: 'Contact', accessor: 'contact' },
              { header: 'Catégorie', accessor: 'catégorie' },
              { header: 'Stock Est.', accessor: 'estimation_stock' },
              { header: 'Localisation', accessor: 'localisation' },
              { header: 'Zones', accessor: 'zone_de_livraison' },
            ]}
          />
        </section>

        <section id="vendeurs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Liste des Vendeurs</h2>
          </div>
          <DataTable<Dropshipper> 
            isLoading={isLoading}
            data={dropshippers}
            columns={[
              { header: 'Vendeur', accessor: 'vendeur' },
              { header: 'Boutique', accessor: 'boutique' },
              { header: 'Produits', accessor: 'produits' },
              { header: 'Montant', accessor: (d: Dropshipper) => formatCurrency(d.montant) },
              { header: 'Catégorie', accessor: 'catégorie' },
            ]}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
