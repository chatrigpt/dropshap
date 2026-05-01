import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, shopDomain } = req.body;

  if (!productId || !shopDomain) {
    return res.status(400).json({ error: 'Missing productId or shopDomain' });
  }

  try {
    // 1. Get product details from Supabase
    const { data: product, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (pError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 2. Get shop access token
    const { data: shop, error: sError } = await supabase
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shopDomain)
      .single();
    
    if (sError || !shop) {
      return res.status(404).json({ error: 'Shop not connected' });
    }

    // 3. Create product on Shopify using REST API
    const restProduct = {
      product: {
        title: product.product_name || product.name,
        body_html: `<strong>Variante:</strong> ${product.variant || 'Standard'}<br><strong>Description:</strong> Produit importé via Dropshap.`,
        vendor: product.supplier_name || 'Dropshap Supplier',
        product_type: product.category,
        status: 'active',
        variants: [
          {
            price: product.label_price,
            sku: product.product_code || product.code,
            inventory_management: 'shopify',
            inventory_policy: 'deny'
          }
        ],
        images: (product.photo_produit || product.image_url || product.photo_url) ? [{ src: product.photo_produit || product.image_url || product.photo_url }] : []
      }
    };

    const shopifyResponse = await axios.post(
      `https://${shopDomain}/admin/api/2024-01/products.json`,
      restProduct,
      { headers: { 'X-Shopify-Access-Token': shop.access_token } }
    );

    res.status(200).json({
      success: true,
      shopify_product_id: shopifyResponse.data.product.id,
      message: 'Product successfully exported to Shopify'
    });

  } catch (error: any) {
    console.error('Error pushing product to Shopify:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to push product to Shopify',
      details: error.response?.data || error.message 
    });
  }
}
