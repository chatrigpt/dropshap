import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { shop, code } = req.query;

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
}
