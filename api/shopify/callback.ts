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

  try {
    // Exchange code for access token
    const accessTokenResponse = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code
    });

    const accessToken = accessTokenResponse.data.access_token;

    // Store in Supabase
    const { error: dbError } = await supabase.from('shops').upsert({
      shop_domain: shop as string,
      access_token: accessToken,
      installed_at: new Date().toISOString()
    }, { onConflict: 'shop_domain' });

    if (dbError) {
      console.error('Error saving shop to Supabase:', dbError);
    }

    // Redirect back to the app board
    res.redirect('/dashboard/dropshipper#success=installed');
  } catch (error: any) {
    console.error('OAuth Callback Error:', error.response?.data || error.message);
    res.status(500).send('OAuth failed');
  }
}
