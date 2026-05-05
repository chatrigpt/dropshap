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
    console.log('[API] GET /api/shopify/shops requested');
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('shop_domain, installed_at');
      
      if (error) {
        console.error('[Supabase] Error fetching shops:', error);
        if (error.code === '42P01') {
          return res.status(200).json([]);
        }
        throw error;
      }
      
      console.log(`[Shopify] Found ${data?.length || 0} connected shops`);
      res.json(data || []);
    } catch (error: any) {
      console.error('[Shopify] Error in /api/shopify/shops:', error.message);
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
  
  // New endpoint to get the Auth URL (to be called by client before opening popup)
  app.get('/api/shopify/auth-url', (req, res) => {
    const { shop } = req.query;
    if (!shop) return res.status(400).json({ error: 'Missing shop parameter' });

    const cleanShop = String(shop)
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    // In AI Studio, SHOPIFY_APP_URL might not be set, so we use the request host
    // Standardize to prefer VITE_ prefix if set
    const baseAppUrl = (process.env.VITE_SHOPIFY_APP_URL || process.env.SHOPIFY_APP_URL || `${protocol}://${host}`).replace(/\/+$/, '');
    
    const callbackPath = '/api/shopify/callback';
    const redirectUri = `${baseAppUrl}${callbackPath}`;
    const scopes = 'read_products,read_orders,write_products';
    const state = crypto.randomBytes(16).toString('hex');

    const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    console.log('[Shopify] Auth-URL requested for:', cleanShop);
    console.log('[Shopify] Generated Redirect URI:', redirectUri);
    
    res.json({ url: authUrl });
  });

  // STEP 1 - Auth Initiation (Legacy support, but preferred way is /auth-url)
  app.get('/api/shopify/auth', (req, res) => {
    const { shop } = req.query;
    if (!shop) return res.status(400).send('Missing shop parameter');

    const cleanShop = String(shop)
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const baseAppUrl = process.env.VITE_SHOPIFY_APP_URL || process.env.SHOPIFY_APP_URL || `${protocol}://${host}`;
    
    const redirectUri = `${baseAppUrl.replace(/\/+$/, '')}/api/shopify/callback`;
    const scopes = 'read_products,read_orders,write_products';
    const state = crypto.randomBytes(16).toString('hex');

    const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    console.log('[Shopify] Initiating legacy OAuth for:', cleanShop);
    console.log('[Shopify] Redirect URI:', redirectUri);
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
      console.log(`[Shopify] Attempting to save shop: ${cleanShop} with token: ${accessToken ? '***' + accessToken.slice(-4) : 'undefined'}`);
      const { data: dbData, error: dbError } = await supabase.from('shops').upsert({
        shop_domain: cleanShop,
        access_token: accessToken,
        installed_at: new Date().toISOString()
      }, { onConflict: 'shop_domain' }).select();

      if (dbError) {
        console.error('[Shopify] Supabase save error:', dbError);
        return res.status(500).send(`
          <html>
            <body style="background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
              <h1 style="color: #ff4444;">Erreur de Stockage Base de Données (Server)</h1>
              <p>La boutique a été autorisée par Shopify, mais nous n'avons pas pu enregistrer les accès dans Supabase.</p>
              <pre style="background: #111; padding: 1rem; border-radius: 8px; border: 1px solid #333; font-size: 12px;">${JSON.stringify(dbError, null, 2)}</pre>
              <p>Vérifiez vos variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY.</p>
              <button onclick="window.close()" style="background: #fff; color: #000; padding: 10px 20px; border-radius: 8px; cursor: pointer; border: none; font-weight: bold;">Fermer</button>
            </body>
          </html>
        `);
      }
      
      console.log('[Shopify] Shop saved successfully:', dbData);

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

      // Send success message to parent window and close popup
      // This follows AI Studio OAuth integration guidelines
      res.send(`
        <html>
          <head>
            <title>Installation Réussie</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0A0A0B; color: #fff; }
              .card { background: #111; padding: 2.5rem; border-radius: 24px; border: 1px solid #222; text-align: center; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
              .icon { font-size: 48px; margin-bottom: 1rem; }
              .spinner { border: 3px solid rgba(255, 255, 255, 0.1); border-left-color: #00ff88; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 1.5rem auto; }
              @keyframes spin { to { transform: rotate(360deg); } }
              button { background: #fff; color: #000; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon">✅</div>
              <h2 style="margin: 0; font-weight: 900;">Boutique Connectée !</h2>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 1rem;">La boutique <strong>${cleanShop}</strong> a été installée avec succès sur Dropshap.</p>
              <div class="spinner"></div>
              <p id="msg" style="font-size: 12px; color: #555;">Fermeture automatique...</p>
              <button onclick="window.close()">Fermer la fenêtre</button>
            </div>
            <script>
              // Try to notify parent
              if (window.opener) {
                window.opener.postMessage({ type: 'SHOPIFY_AUTH_SUCCESS', shop: '${cleanShop}' }, '*');
                setTimeout(() => {
                  window.close();
                }, 2000);
              } else {
                document.getElementById('msg').innerText = "Vous pouvez maintenant fermer cette fenêtre.";
                document.querySelector('.spinner').style.display = 'none';
              }
            </script>
          </body>
        </html>
      `);
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
    if (!SHOPIFY_CLIENT_SECRET) {
      console.error('[Webhook] Critical: SHOPIFY_CLIENT_SECRET is not set. Cannot verify webhook.');
      return res.status(500).send('Secret missing');
    }

    const hash = crypto
      .createHmac('sha256', SHOPIFY_CLIENT_SECRET)
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
      
      const imageSource = product.photo_produit || product.image_url || product.photo_url;
      const isBase64 = imageSource?.startsWith('data:image');
      
      const restProduct = {
        product: {
          title: product.product_name || product.name || 'Produit sans titre',
          body_html: `<strong>Variante:</strong> ${product.variant || 'Standard'}<br><strong>Description:</strong> Produit importé via Dropshap.`,
          vendor: product.supplier_name || 'Dropshap Supplier',
          product_type: product.category || 'Général',
          status: 'active',
          variants: [
            {
              price: product.label_price || 0,
              sku: product.product_code || product.code || `sku-${product.id}`,
              inventory_management: 'shopify',
              inventory_policy: 'deny'
            }
          ],
          images: imageSource 
            ? [isBase64 ? { attachment: imageSource.split(',')[1] } : { src: imageSource }] 
            : []
        }
      };

      console.log(`[Shopify] Pushing product to ${shopDomain}:`, restProduct.product.title, isBase64 ? '(Base64 Image)' : '(URL Image)');

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
  const baseAppUrl = process.env.VITE_SHOPIFY_APP_URL || SHOPIFY_APP_URL || '';
  if (!baseAppUrl) {
    console.warn('[Webhooks] Skip registration: No SHOPIFY_APP_URL defined');
    return null;
  }

  const query = `
    mutation {
      webhookSubscriptionCreate(
        topic: PRODUCTS_CREATE,
        webhookSubscription: {
          callbackUrl: "${baseAppUrl.replace(/\/+$/, '')}/api/webhooks/shopify",
          format: JSON
        }
      ) {
        userErrors { field message }
        webhookSubscription { id }
      }
      ordersCreate: webhookSubscriptionCreate(
        topic: ORDERS_CREATE,
        webhookSubscription: {
          callbackUrl: "${baseAppUrl.replace(/\/+$/, '')}/api/webhooks/shopify",
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
