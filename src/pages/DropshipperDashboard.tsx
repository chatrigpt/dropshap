import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import { Package, CreditCard, ShoppingCart, ExternalLink, RefreshCw } from 'lucide-react';
import { dataService } from '../lib/data';
import { Product, Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export default function DropshipperDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [connectedShops, setConnectedShops] = useState<{shop_domain: string}[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPushing, setIsPushing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchShops();
    if (window.location.hash.includes('success=installed')) {
      toast.success('Shopify connecté avec succès !');
      window.location.hash = '';
    }
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shopify/shops');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setConnectedShops(Array.isArray(data) ? data : []);
        if (data && Array.isArray(data) && data.length > 0) {
          setSelectedShop(data[0].shop_domain);
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 100));
        setConnectedShops([]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      setConnectedShops([]);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const [p, t] = await Promise.all([
      dataService.getProducts(),
      dataService.getTransactions(),
    ]);
    setProducts(p);
    setTransactions(t);
    setIsLoading(false);
  };

  const handlePushToShopify = async (productId: string) => {
    if (!selectedShop) {
      return toast.error('Veuillez d\'abord connecter une boutique Shopify');
    }

    setIsPushing(productId);
    try {
      const response = await fetch('/api/shopify/push-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, shopDomain: selectedShop })
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          toast.success(`Produit ajouté à ${selectedShop} !`);
        } else {
          toast.error(data.error || 'Erreur lors de l\'exportation');
        }
      } else {
        const text = await response.text();
        console.error('Push error non-JSON:', text.substring(0, 100));
        toast.error('Erreur du serveur (réponse non-valide)');
      }
    } catch (error) {
      console.error('Push error:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsPushing(null);
    }
  };

  const totalEarnings = transactions.reduce((acc, t) => acc + t.montant_dropshipper, 0);

  return (
    <DashboardLayout title="Tableau de Bord Vendeur">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label="Gains Totaux" 
          value={formatCurrency(totalEarnings)} 
          icon={<CreditCard className="w-6 h-6" />} 
          className="bg-primary/5 border-primary/20"
        />
        <StatsCard 
          label="Total Commandes" 
          value={transactions.length} 
          icon={<ShoppingCart className="w-6 h-6" />} 
        />
        <div className="md:col-span-2 card bg-dark-bg text-white flex items-center justify-between">
          <div className="flex-1 mr-4">
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">Intégration Shopify</p>
            
            {connectedShops.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-bold">{connectedShops.length} boutique(s) connectée(s)</span>
                </div>
                <select 
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                  className="w-full bg-white/10 border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {connectedShops.map(s => (
                    <option key={s.shop_domain} value={s.shop_domain} className="bg-dark-bg">{s.shop_domain}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const shop = prompt('Entrez l\'URL de votre autre boutique (ex: ma-boutique.myshopify.com)');
                      if (shop) window.location.href = `/api/shopify/auth?shop=${shop}`;
                    }}
                    className="text-[10px] font-black uppercase text-primary hover:underline"
                  >
                    + Ajouter une autre boutique
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="votre-boutique.myshopify.com"
                  className="bg-white/10 border-white/20 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  id="shop-domain-input"
                />
                <button 
                  onClick={() => {
                    const shop = (document.getElementById('shop-domain-input') as HTMLInputElement).value;
                    if (!shop) return toast.error('Veuillez entrer un domaine Shopify');
                    window.location.href = `/api/shopify/auth?shop=${shop}`;
                  }}
                  className="btn-primary py-2 px-4 text-xs font-black uppercase tracking-widest h-fit"
                >
                  Installer l'App
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => toast.success('Synchronisation des commandes...')}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => toast.success('Ouverture de l\'admin Shopify...')}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <section id="catalogue">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Catalogue Produits</h2>
            <p className="text-sm text-gray-500 font-medium">Parcourez les produits à vendre dans votre boutique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.record_id} className="card group hover:shadow-2xl transition-all border-transparent hover:border-primary/20">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  {product.photo_produit || product.product_image_base64 ? (
                    <img 
                      src={product.photo_produit || product.product_image_base64} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer" 
                      alt={product.product_name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase shadow-sm tracking-widest">
                    {product.category}
                  </div>
                </div>
                <h3 className="font-black text-xl mb-1 font-display tracking-tight uppercase">{product.product_name}</h3>
                <p className="text-sm text-gray-500 mb-4 font-medium">{product.variant}</p>
                
                <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Votre Profit</p>
                    <p className="text-xl font-black text-green-600">
                      {formatCurrency(Number(product.label_price || 0) - Number(product.supplier_price || 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Prix de Vente</p>
                    <p className="text-xl font-black text-gray-900">{formatCurrency(Number(product.label_price || 0))}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <span>Stock Disponible:</span>
                    <span className="text-gray-900">{product.stock_available} unités</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <span>Localisation:</span>
                    <span className="text-gray-900">{product.supplier_city}</span>
                  </div>
                  <button 
                    onClick={() => handlePushToShopify(product.record_id)}
                    disabled={isPushing === product.record_id}
                    className={cn(
                      "w-full btn-primary py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2",
                      isPushing === product.record_id && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isPushing === product.record_id ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Exportation...
                      </>
                    ) : (
                      'Ajouter à ma Boutique'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="commandes">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Commandes Récentes</h2>
          </div>
          <DataTable<Transaction> 
            isLoading={isLoading}
            data={transactions}
            columns={[
              { header: 'Client', accessor: 'contact_client' },
              { header: 'Produit', accessor: 'produit' },
              { header: 'Qté', accessor: 'quantite' },
              { header: 'Vente Totale', accessor: (t: Transaction) => formatCurrency(t.montant_client) },
              { header: 'Votre Profit', accessor: (t: Transaction) => formatCurrency(t.montant_dropshipper), className: 'font-bold text-green-600' },
              { 
                header: 'Statut', 
                accessor: (t: Transaction) => (
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    t.status === 'Livré' ? "bg-green-100 text-green-700" : 
                    t.status === 'Annulé' ? "bg-red-100 text-red-700" :
                    t.status === 'Remboursé' ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {t.status || 'En attente'}
                  </span>
                ) 
              },
            ]}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
