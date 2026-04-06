export type UserRole = 'admin' | 'supplier' | 'dropshipper';

export interface User {
  role: UserRole;
  userId: string;
  name: string;
  phone: string;
  businessName: string;
  category: string;
}

export interface Product {
  record_id: string;
  product_code: string;
  product_name: string;
  category: string;
  variant: string;
  label_price: number;
  supplier_price: number;
  currency: string;
  stock_available: number;
  supplier_id: string;
  supplier_name: string;
  supplier_contact_name: string;
  supplier_whatsapp: string;
  supplier_phone: string;
  supplier_email: string;
  preferred_contact_method: string;
  supplier_city: string;
  delivery_zones: string;
  order_message_template: string;
  is_active: boolean;
  last_updated: string;
  product_image_base64?: string;
  photo_produit?: string;
}

export interface Transaction {
  record_id?: string;
  contact_client: string;
  produit: string;
  quantite: number;
  fournisseur: string;
  montant_client: number;
  montant_supplier: number;
  montant_dropshipper: number;
  date?: string;
  status?: 'En attente' | 'Livré' | 'Annulé' | 'Remboursé' | string;
}

export interface Dropshipper {
  vendeur: string;
  boutique: string;
  produits: number;
  montant: number;
  catégorie: string;
}

export interface RegisteredSupplier {
  nom: string;
  contact: string;
  catégorie: string;
  estimation_stock: string;
  localisation: string;
  zone_de_livraison: string;
}
