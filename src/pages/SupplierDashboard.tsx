import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import ImageUpload from '../components/ImageUpload';
import { Package, TrendingUp, Plus, RefreshCw, X, CreditCard } from 'lucide-react';
import { dataService } from '../lib/data';
import { auth } from '../lib/auth';
import { Product, Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export default function SupplierDashboard() {
  const user = auth.getUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Transaction | null>(null);
  const [statusNote, setStatusNote] = useState('');
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    product_code: '',
    product_name: '',
    category: '',
    variant: '',
    label_price: 0,
    supplier_price: 0,
    currency: 'XOF',
    stock_available: 0,
    supplier_id: user?.userId || '',
    supplier_name: user?.businessName || '',
    supplier_contact_name: user?.name || '',
    supplier_whatsapp: user?.phone || '',
    supplier_phone: user?.phone || '',
    supplier_email: '',
    preferred_contact_method: 'whatsapp',
    supplier_city: '',
    delivery_zones: '',
    order_message_template: '',
    is_active: true,
    product_image_base64: '',
  });

  const [stockUpdate, setStockUpdate] = useState({ product_code: '', quantity: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [allProducts, allTransactions] = await Promise.all([
      dataService.getProducts(),
      dataService.getTransactions()
    ]);
    // Filter products for this supplier
    setProducts(allProducts.filter(p => p.supplier_id === user?.userId));
    // Filter transactions for this supplier
    setTransactions(allTransactions.filter(t => t.fournisseur === user?.businessName));
    setIsLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await dataService.addProduct(newProduct);
    if (success) {
      toast.success('Produit ajouté avec succès !');
      setIsAddModalOpen(false);
      fetchData();
    } else {
      toast.error('Échec de l\'ajout du produit.');
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await dataService.updateStock(stockUpdate);
    if (success) {
      toast.success('Stock mis à jour !');
      setIsStockModalOpen(false);
      fetchData();
    } else {
      toast.error('Échec de la mise à jour du stock.');
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedOrder) return;
    
    // Find the product to send its full info as requested
    const product = products.find(p => p.product_name === selectedOrder.produit);

    const success = await dataService.updateOrderStatus({
      ...selectedOrder,
      product_info: product,
      status,
      notes: status === 'Autre' ? statusNote : undefined
    });

    if (success) {
      toast.success(`Statut mis à jour : ${status}`);
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      setStatusNote('');
      fetchData();
    } else {
      toast.error('Échec de la mise à jour du statut.');
    }
  };

  return (
    <DashboardLayout title="Tableau de Bord Fournisseur">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          label="Mes Produits" 
          value={products.length} 
          icon={<Package className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Stock Total" 
          value={products.reduce((acc, p) => acc + p.stock_available, 0)} 
          icon={<TrendingUp className="w-6 h-6" />} 
        />
        <StatsCard 
          label="Commandes" 
          value={transactions.length} 
          icon={<CreditCard className="w-6 h-6" />} 
        />
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 btn-primary h-full flex-col gap-2 rounded-2xl"
          >
            <Plus className="w-6 h-6" />
            Ajouter Produit
          </button>
          <button 
            onClick={() => setIsStockModalOpen(true)}
            className="flex-1 btn-secondary h-full flex-col gap-2 rounded-2xl bg-dark-bg text-white"
          >
            <RefreshCw className="w-6 h-6" />
            Mise à jour Stock
          </button>
        </div>
      </div>

      <div className="space-y-10">
        <section id="produits">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Mes Produits</h2>
          </div>
          <DataTable<Product> 
            isLoading={isLoading}
            data={products}
            columns={[
              { 
                header: 'Image', 
                accessor: (p: Product) => (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                    {p.photo_produit || p.product_image_base64 ? (
                      <img src={p.photo_produit || p.product_image_base64} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ) 
              },
              { header: 'Code', accessor: 'product_code' },
              { header: 'Nom', accessor: 'product_name' },
              { header: 'Catégorie', accessor: 'category' },
              { header: 'Stock', accessor: 'stock_available', className: 'font-bold' },
              { header: 'Prix Fournisseur', accessor: (p: Product) => formatCurrency(p.supplier_price) },
              { header: 'Prix Public', accessor: (p: Product) => formatCurrency(p.label_price) },
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

        <section id="commandes">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black font-display uppercase tracking-wider">Commandes Clients</h2>
          </div>
          <DataTable<Transaction> 
            isLoading={isLoading}
            data={transactions}
            columns={[
              { header: 'Client', accessor: 'contact_client' },
              { header: 'Produit', accessor: 'produit' },
              { header: 'Qté', accessor: 'quantite' },
              { header: 'Montant', accessor: (t: Transaction) => formatCurrency(t.montant_supplier) },
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
              {
                header: 'Actions',
                accessor: (t: Transaction) => (
                  <button 
                    onClick={() => {
                      setSelectedOrder(t);
                      setIsStatusModalOpen(true);
                    }}
                    className="text-primary hover:underline font-bold text-xs uppercase tracking-widest"
                  >
                    Gérer
                  </button>
                )
              }
            ]}
          />
        </section>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black font-display uppercase tracking-tight">Mettre à jour le Statut</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleStatusUpdate('Livré')}
                  className="p-4 rounded-2xl bg-green-50 text-green-700 font-bold hover:bg-green-100 transition-all"
                >
                  Livré
                </button>
                <button 
                  onClick={() => handleStatusUpdate('Annulé')}
                  className="p-4 rounded-2xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all"
                >
                  Annulé
                </button>
                <button 
                  onClick={() => handleStatusUpdate('Remboursé')}
                  className="p-4 rounded-2xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-all"
                >
                  Remboursé
                </button>
                <button 
                  onClick={() => handleStatusUpdate('En attente')}
                  className="p-4 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all"
                >
                  En attente
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Autre Problème / Note</label>
                <textarea 
                  className="input-field h-24 resize-none rounded-xl mb-4" 
                  placeholder="Décrivez le problème..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <button 
                  onClick={() => handleStatusUpdate('Autre')}
                  disabled={!statusNote}
                  className="w-full btn-primary py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  Envoyer Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-black font-display uppercase tracking-tight">Ajouter un Nouveau Produit</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <ImageUpload 
                    value={newProduct.product_image_base64}
                    onImageSelect={(base64) => setNewProduct({ ...newProduct, product_image_base64: base64 })}
                    onRemove={() => setNewProduct({ ...newProduct, product_image_base64: '' })}
                  />
                  
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Code Produit</label>
                        <input 
                          type="text" required className="input-field rounded-xl text-gray-900"
                          value={newProduct.product_code}
                          onChange={(e) => setNewProduct({ ...newProduct, product_code: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Catégorie</label>
                        <input 
                          type="text" required className="input-field rounded-xl text-gray-900"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nom du Produit</label>
                      <input 
                        type="text" required className="input-field rounded-xl text-gray-900"
                        value={newProduct.product_name}
                        onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Variante</label>
                      <input 
                        type="text" className="input-field rounded-xl text-gray-900" placeholder="ex: Rouge / XL"
                        value={newProduct.variant}
                        onChange={(e) => setNewProduct({ ...newProduct, variant: e.target.value })}
                      />
                    </div>
                  </div>
  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Prix Fournisseur</label>
                        <input 
                          type="number" required className="input-field rounded-xl text-gray-900"
                          value={newProduct.supplier_price}
                          onChange={(e) => setNewProduct({ ...newProduct, supplier_price: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Prix Public</label>
                        <input 
                          type="number" required className="input-field rounded-xl text-gray-900"
                          value={newProduct.label_price}
                          onChange={(e) => setNewProduct({ ...newProduct, label_price: Number(e.target.value) })}
                        />
                      </div>
                    </div>
  
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Stock Disponible</label>
                        <input 
                          type="number" required className="input-field rounded-xl text-gray-900"
                          value={newProduct.stock_available}
                          onChange={(e) => setNewProduct({ ...newProduct, stock_available: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Ville</label>
                        <input 
                          type="text" required className="input-field rounded-xl text-gray-900"
                          value={newProduct.supplier_city}
                          onChange={(e) => setNewProduct({ ...newProduct, supplier_city: e.target.value })}
                        />
                      </div>
                    </div>
  
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Zones de Livraison</label>
                      <input 
                        type="text" required className="input-field rounded-xl text-gray-900" placeholder="ex: Abidjan, Yamoussoukro"
                        value={newProduct.delivery_zones}
                        onChange={(e) => setNewProduct({ ...newProduct, delivery_zones: e.target.value })}
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Modèle de Message de Commande</label>
                      <textarea 
                        className="input-field h-24 resize-none rounded-xl text-gray-900" 
                        placeholder="Bonjour, je souhaite commander {product_name}..."
                        value={newProduct.order_message_template}
                        onChange={(e) => setNewProduct({ ...newProduct, order_message_template: e.target.value })}
                      />
                    </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700">Annuler</button>
                <button type="submit" className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">Créer le Produit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black font-display uppercase tracking-tight">Mise à jour du Stock</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Produit</label>
                <select 
                  required className="input-field rounded-xl"
                  value={stockUpdate.product_code}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, product_code: e.target.value })}
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(p => (
                    <option key={p.product_code} value={p.product_code}>{p.product_name} ({p.product_code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Quantité à Retirer</label>
                <input 
                  type="number" required className="input-field rounded-xl"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">Cela diminuera le stock actuel de ce montant.</p>
              </div>
              <button type="submit" className="btn-primary w-full py-4 rounded-xl font-bold shadow-lg shadow-primary/20">Mettre à jour le Stock</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
