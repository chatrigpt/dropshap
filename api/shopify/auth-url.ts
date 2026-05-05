import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { shop } = req.query;
  if (!shop) return res.status(400).json({ error: 'Missing shop parameter' });

  const cleanShop = String(shop)
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const baseAppUrl = (process.env.VITE_SHOPIFY_APP_URL || process.env.SHOPIFY_APP_URL || `${protocol}://${host}`).replace(/\/+$/, '');
  
  const redirectUri = `${baseAppUrl}/api/shopify/callback`;
  const scopes = 'read_products,read_orders,write_products';
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  
  console.log('[Shopify Serverless] Auth-URL requested for:', cleanShop);
  console.log('[Shopify Serverless] Redirect URI:', redirectUri);
  
  res.status(200).json({ url: authUrl });
}
