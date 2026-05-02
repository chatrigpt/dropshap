import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL;

async function startServer() {
  const app = express();
  const PORT = 3000;

  const N8N_BASE_URL = 'https://digitaladn225.app.n8n.cloud/webhook';

  console.log('Starting server with SHOPIFY_CLIENT_ID:', SHOPIFY_CLIENT_ID ? 'Set' : 'Missing');

  // --- NEW SHOPIFY MANAGEMENT ROUTES (Moved up for priority) ---

  // List all connected shops
  app.get('/api/shopify/shops', async (req, res) => {
    console.log('API Request: GET /api/shopify/shops');
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('shop_domain, installed_at');
      
      if (error) {
        console.error('Supabase error fetching shops:', error);
        // Special check for missing table
        if (error.code === '42P01') {
          return res.status(200).json([]); // Return empty list gracefully if table missing
        }
        throw error;
      }
      res.json(data || []);
    } catch (error: any) {
      console.error('Error in /api/shopify/shops:', error.message);
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  });

  // Standard JSON body parser for other routes
  app.use((req, res, next) => {
    if (req.originalUrl === '/api/webhooks/shopify') {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // --- SHOPIFY OAUTH ROUTES ---

  // STEP 1 - Auth Initiation
  app.get('/api/shopify/auth', (req, res) => {
    const { shop } = req.query;
    if (!shop) return res.status(400).send('Missing shop parameter');

    // Sanitize shop domain
    const cleanShop = String(shop)
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');

    const scopes = 'read_products,read_orders,write_products';
    
    // Use environment variable or determine from request
    const appUrl = SHOPIFY_APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appUrl}/api/shopify/callback`;
    const state = crypto.randomBytes(16).toString('hex');

    const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
    
    console.log('Initiating OAuth for:', cleanShop, 'Redirecting to:', authUrl);
    res.redirect(authUrl);
  });

  // STEP 2 - Callback handling
  app.get('/api/shopify/callback', async (req, res) => {
    const { shop, code, state } = req.query;

    if (!shop || !code) return res.status(400).send('Missing parameters');

    const cleanShop = String(shop).replace(/^https?:\/\//i, '').replace(/\/+$/, '');

    try {
      // Exchange code for access token
      const accessTokenResponse = await axios.post(`https://${cleanShop}/admin/oauth/access_token`, {
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code
      });

      const accessToken = accessTokenResponse.data.access_token;

      // Store in Supabase
      const { error: dbError } = await supabase.from('shops').upsert({
        shop_domain: cleanShop,
        access_token: accessToken,
        installed_at: new Date().toISOString()
      }, { onConflict: 'shop_domain' });

      if (dbError) {
        console.error('Error saving shop to Supabase:', dbError);
        // Continue anyway as we have the token
      }

      // STEP 3 - Register Webhooks
      await registerShopifyWebhooks(cleanShop, accessToken);

      // STEP 6 - Notify n8n of new shop
      try {
        await axios.post(`${N8N_BASE_URL}/dropchampy-newshop`, {
          shop_domain: cleanShop,
          installed_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error notifying n8n of new shop:', err);
      }

      // Redirect back to the app board
      res.redirect('/dashboard/dropshipper#success=installed');
    } catch (error: any) {
      console.error('OAuth Callback Error:', error.response?.data || error.message);
      res.status(500).send('OAuth failed');
    }
  });

  // --- WEBHOOK HANDLER ---

  // Raw body parser for webhook verification
  app.use('/api/webhooks/shopify', bodyParser.raw({ type: 'application/json' }));

  // STEP 4 & 5 - Webhook Receiver
  app.post('/api/webhooks/shopify', async (req, res) => {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    const topicHeader = req.get('X-Shopify-Topic');
    const shopHeader = req.get('X-Shopify-Shop-Domain');
    const body = req.body.toString();

    // Verify HMAC
    const hash = crypto
      .createHmac('sha256', SHOPIFY_CLIENT_SECRET || '')
      .update(req.body, 'utf8')
      .digest('base64');

    if (hash !== hmacHeader) {
      console.warn('Invalid HMAC verification for webhook');
      return res.status(401).send('Invalid signature');
    }

    // Respond 200 quickly as requested
    res.status(200).send('OK');

    // Process Async (STEP 5 & 7)
    try {
      const payload = JSON.parse(body);

      if (topicHeader === 'products/create') {
        const productData = {
          product_code: payload.id.toString(),
          product_name: payload.title,
          label_price: payload.variants?.[0]?.price,
          stock_available: payload.variants?.[0]?.inventory_quantity,
          product_image_url: payload.images?.[0]?.src,
          shop: shopHeader
        };
        await axios.post(`${N8N_BASE_URL}/dropchampy-add-product`, productData);
      } 
      else if (topicHeader === 'orders/create') {
        const orderData = {
          code_produit: payload.line_items?.[0]?.product_id?.toString(),
          nom_produit: payload.line_items?.[0]?.title,
          prix_unitaire: payload.line_items?.[0]?.price,
          quantite: payload.line_items?.[0]?.quantity,
          montant_total: payload.total_price,
          client: payload.customer?.first_name,
          telephone: payload.customer?.phone,
          adresse: payload.shipping_address?.address1,
          shop: shopHeader
        };
        await axios.post(`${N8N_BASE_URL}/dropchampy`, orderData);
      }
    } catch (err) {
      console.error('Error processing Shopify webhook:', err);
    }
  });

  // Proxy for other n8n webhooks to bypass CORS
  app.all('/api/webhook/*', async (req, res) => {
    const endpoint = req.params[0];
    const url = `${N8N_BASE_URL}/${endpoint}`;
    
    try {
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error(`Error proxying to n8n (${url}):`, error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    }
  });

  // Push a product to Shopify
  app.post('/api/shopify/push-product', async (req, res) => {
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

      // 3. Create product on Shopify using GraphQL (more efficient)
      const query = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              handle
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          title: product.product_name || product.name,
          bodyHtml: `<strong>Variante:</strong> ${product.variant || 'Standard'}<br><strong>Description:</strong> Produit importé via Dropshap.`,
          vendor: product.supplier_name || 'Dropshap Supplier',
          status: 'ACTIVE',
          variants: [
            {
              price: product.label_price,
              sku: product.product_code || product.code,
              inventoryItem: {
                tracked: true
              },
              inventoryQuantities: [
                {
                  availableQuantity: product.stock || product.stock_available || 0,
                  locationId: "" // We will handle locations later or let Shopify use default
                }
              ]
            }
          ],
          images: product.image_url || product.photo_url ? [{ altText: product.product_name, src: product.image_url || product.photo_url }] : []
        }
      };

      // Since we don't know the location ID, we'll use the REST API for simpler inventory management initially
      // or just create the product without setting inventory quantities if it's too complex for a first pass
      
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
          images: (product.image_url || product.photo_url) ? [{ src: product.image_url || product.photo_url }] : []
        }
      };

      const shopifyResponse = await axios.post(
        `https://${shopDomain}/admin/api/2024-01/products.json`,
        restProduct,
        { headers: { 'X-Shopify-Access-Token': shop.access_token } }
      );

      res.json({
        success: true,
        shopify_product_id: shopifyResponse.data.product.id,
        message: 'Product successfully exported to Shopify'
      });

    } catch (error: any) {
      console.error('Error pushing product to Shopify:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to push product to Shopify',
        details: error.response?.data || error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// STEP 3 helper function
async function registerShopifyWebhooks(shop: string, accessToken: string) {
  const query = `
    mutation {
      webhookSubscriptionCreate(
        topic: PRODUCTS_CREATE,
        webhookSubscription: {
          callbackUrl: "${SHOPIFY_APP_URL}/api/webhooks/shopify",
          format: JSON
        }
      ) {
        userErrors { field message }
        webhookSubscription { id }
      }
      ordersCreate: webhookSubscriptionCreate(
        topic: ORDERS_CREATE,
        webhookSubscription: {
          callbackUrl: "${SHOPIFY_APP_URL}/api/webhooks/shopify",
          format: JSON
        }
      ) {
        userErrors { field message }
        webhookSubscription { id }
      }
    }
  `;

  try {
    const response = await axios.post(`https://${shop}/admin/api/2024-01/graphql.json`, 
      { query },
      { headers: { 'X-Shopify-Access-Token': accessToken } }
    );
    return response.data;
  } catch (error: any) {
    console.error(`Webhook Registration Error for ${shop}:`, error.message);
  }
}

startServer();
