import { Product, Transaction, Dropshipper, RegisteredSupplier } from '../types';
import { supabase } from './supabase';
import axios from 'axios';

export const dataService = {
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    console.log('Raw products from Supabase:', data?.slice(0, 2));

    return (data || []).map((p: any) => ({
      record_id: p.id,
      product_code: p.product_code || p.code || '',
      product_name: p.product_name || p.name || '',
      category: p.category || '',
      variant: p.variant || '',
      stock_available: Number(p.stock_available || p.stock || 0),
      supplier_price: Number(p.supplier_price || 0),
      label_price: Number(p.label_price || 0),
      currency: p.currency || 'XOF',
      supplier_id: p.supplier_id || '',
      supplier_name: p.supplier_name || 'Fournisseur',
      supplier_contact_name: p.supplier_contact_name || 'Contact',
      supplier_whatsapp: p.supplier_whatsapp || '',
      supplier_phone: p.supplier_phone || '',
      supplier_email: p.supplier_email || '',
      preferred_contact_method: p.preferred_contact_method || 'WhatsApp',
      supplier_city: p.supplier_city || 'Abidjan',
      delivery_zones: p.delivery_zones || '',
      order_message_template: p.order_message_template || '',
      is_active: p.is_active ?? true,
      last_updated: p.created_at || '',
      photo_produit: p.photo_produit || p.image_url || p.photo_url
    }));
  },
  
  getTransactions: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return (data || []).map((t: any) => ({
      record_id: t.id,
      contact_client: t.contact_client || t.customer_name || t.customer_phone || 'Client inconnu',
      produit: t.produit || 'Produit inconnu',
      quantite: t.quantite || t.quantity || 0,
      fournisseur: t.fournisseur || 'Fournisseur Inconnu',
      montant_supplier: t.montant_supplier || 0,
      montant_dropshipper: t.montant_dropshipper || 0,
      montant_client: t.montant_client || t.amount_total || 0,
      date: t.created_at,
      status: t.status || 'En attente'
    }));
  },
  
  getDropshippers: async (): Promise<Dropshipper[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'dropshipper');
    
    if (error) {
      console.error('Error fetching dropshippers:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      vendeur: d.full_name || d.business_name || 'Vendeur',
      boutique: d.business_name || 'Ma Boutique',
      produits: 0,
      montant: 0,
      catégorie: d.category || 'E-commerce'
    }));
  },
  
  getSuppliers: async (): Promise<RegisteredSupplier[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'supplier');
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }

    return (data || []).map((s: any) => ({
      nom: s.business_name || s.full_name || 'Fournisseur',
      contact: s.phone || s.email || 'Pas de contact',
      catégorie: s.category || 'Fournisseur',
      estimation_stock: 'Vérifié',
      localisation: s.city || 'Abidjan',
      zone_de_livraison: 'Abidjan & Intérieur'
    }));
  },

  getAdminStats: async () => {
    const { data, error } = await supabase
      .from('admin_stats')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching admin stats:', error);
      return { total_products: 0, total_orders: 0, total_earnings: 0 };
    }
    return data;
  },
  
  // Use Supabase for writes for better reliability with provided credentials
  addProduct: async (product: Partial<Product>) => {
    try {
      const { error } = await supabase.from('products').insert([{
        product_code: product.product_code,
        product_name: product.product_name,
        category: product.category,
        variant: product.variant,
        supplier_id: product.supplier_id || null,
        supplier_name: product.supplier_name,
        supplier_contact_name: product.supplier_contact_name,
        supplier_whatsapp: product.supplier_whatsapp,
        supplier_phone: product.supplier_phone,
        supplier_email: product.supplier_email,
        preferred_contact_method: product.preferred_contact_method,
        supplier_city: product.supplier_city,
        supplier_price: Number(product.supplier_price || 0),
        label_price: Number(product.label_price || 0),
        stock_available: Number(product.stock_available || 0),
        delivery_zones: product.delivery_zones,
        order_message_template: product.order_message_template,
        photo_produit: product.product_image_base64 || product.photo_produit,
        is_active: true
      }]);

      if (error) {
        console.error('Supabase error adding product:', error);
        // Fallback to webhook if direct Supabase fails
        const response = await axios.post('https://digitaladn225.app.n8n.cloud/webhook/dropchampy-add-product', product);
        return response.status === 200;
      }
      return true;
    } catch (e) {
      console.error('Error adding product:', e);
      return false;
    }
  },
  
  updateStock: async (data: { product_code: string; quantity: number }) => {
    try {
      // First attempt n8n webhook as it may have logic for history/logging
      const response = await axios.post('https://digitaladn225.app.n8n.cloud/webhook/dropchampy-substock', data);
      
      // Also update Supabase directly to ensure UI reflects it immediately
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_available')
        .eq('product_code', data.product_code)
        .single();
      
      if (currentProduct) {
        await supabase
          .from('products')
          .update({ stock_available: Math.max(0, (currentProduct.stock_available || 0) - data.quantity) })
          .eq('product_code', data.product_code);
      }

      return response.status === 200;
    } catch (e) {
      console.error('Error updating stock:', e);
      return false;
    }
  },
  
  createOrder: async (order: any) => {
    try {
      const response = await axios.post('https://digitaladn225.app.n8n.cloud/webhook/dropchampy', {
        ...order,
        status: 'En attente',
        date: new Date().toISOString()
      });

      // Also log to Supabase transactions table
      await supabase.from('transactions').insert([{
        contact_client: order.contact_client,
        produit: order.produit,
        quantite: order.quantite,
        fournisseur: order.fournisseur,
        montant_supplier: order.montant_supplier,
        montant_dropshipper: order.montant_dropshipper,
        montant_client: order.montant_client,
        status: 'En attente'
      }]);

      return response.status === 200;
    } catch (e) {
      console.error('Error creating order:', e);
      return false;
    }
  },

  updateOrderStatus: async (orderData: any) => {
    try {
      const response = await axios.post('https://digitaladn225.app.n8n.cloud/webhook/dropchampy-substock', {
        ...orderData,
        updated_at: new Date().toISOString()
      });

      // Update in Supabase
      if (orderData.record_id) {
        await supabase
          .from('transactions')
          .update({ 
            status: orderData.status,
            notes: orderData.notes 
          })
          .eq('id', orderData.record_id);
      }

      return response.status === 200;
    } catch (e) {
      console.error('Error updating order status:', e);
      return false;
    }
  }
};
