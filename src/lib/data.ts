import axios from 'axios';
import Papa from 'papaparse';
import { Product, Transaction, Dropshipper, RegisteredSupplier } from '../types';

// Google Sheets CSV Export URLs
const SHEETS = {
  PRODUCTS: 'https://docs.google.com/spreadsheets/d/1qbEtxd-aOE3RFOwJC3IZVVdyzkQVbZ_3cHH-xX86eVk/export?format=csv',
  TRANSACTIONS: 'https://docs.google.com/spreadsheets/d/1zkHTyQsGzGjSi5n6_z9Eaa4P9vMpxFpmG3-iMVvphrE/export?format=csv',
  DROPSHIPPERS: 'https://docs.google.com/spreadsheets/d/1UufcHP1qljNpojKkdj7QThV8_2eCMRrWGHLX66J-GI4/export?format=csv',
  SUPPLIERS: 'https://docs.google.com/spreadsheets/d/1WFHAEEkT-SmUNhVvRAwoftB6Mb5Zq5x4QiEAY4H5Hyw/export?format=csv'
};

const fetchCSV = async (url: string) => {
  try {
    const response = await axios.get(url);
    const results = Papa.parse(response.data, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    return results.data;
  } catch (e) {
    console.error('Error fetching CSV:', e);
    return [];
  }
};

export const dataService = {
  getProducts: async (): Promise<Product[]> => {
    const data = await fetchCSV(SHEETS.PRODUCTS);
    return data.map((item: any) => ({
      ...item,
      is_active: String(item.is_active).toUpperCase() === 'TRUE' || item.is_active === true,
      label_price: Number(item.label_price) || 0,
      supplier_price: Number(item.supplier_price) || 0,
      stock_available: Number(item.stock_available) || 0
    }));
  },
  
  getTransactions: async (): Promise<Transaction[]> => {
    const data = await fetchCSV(SHEETS.TRANSACTIONS);
    return data.map((item: any) => ({
      ...item,
      quantite: Number(item.quantite) || 0,
      montant_client: Number(item.montant_client) || 0,
      montant_supplier: Number(item.montant_supplier) || 0,
      montant_dropshipper: Number(item.montant_dropshipper) || 0
    }));
  },
  
  getDropshippers: async (): Promise<Dropshipper[]> => {
    const data = await fetchCSV(SHEETS.DROPSHIPPERS);
    return data.map((item: any) => ({
      ...item,
      produits: Number(item.produits) || 0,
      montant: Number(item.montant) || 0
    }));
  },
  
  getSuppliers: async (): Promise<RegisteredSupplier[]> => {
    const data = await fetchCSV(SHEETS.SUPPLIERS);
    return data as RegisteredSupplier[];
  },
  
  // Keep write operations as webhooks (n8n)
  addProduct: async (product: Partial<Product>) => {
    try {
      const response = await axios.post('https://digitaladn225.app.n8n.cloud/webhook/dropchampy-add-product', product);
      return response.status === 200;
    } catch (e) {
      console.error('Error adding product:', e);
      return false;
    }
  },
  
  updateStock: async (data: { product_code: string; quantity: number }) => {
    try {
      const response = await axios.post('https://digitaladn225.app.n8n.cloud/webhook/dropchampy-substock', data);
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
      return response.status === 200;
    } catch (e) {
      console.error('Error updating order status:', e);
      return false;
    }
  }
};
