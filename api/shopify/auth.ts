import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing shop parameter');

  // Sanitize shop domain (remove https:// or http:// and trailing slashes)
  const cleanShop = String(shop)
    .replace(/^https?:\/\//i, '') // Remove protocol
    .replace(/\/+$/, '');         // Remove trailing slashes

  const scopes = 'read_products,read_orders,write_products';
  
  // Use environment variable or determine from request
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  const appUrl = SHOPIFY_APP_URL || `${protocol}://${host}`;
  const redirectUri = `${appUrl}/api/shopify/callback`;
  
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = `https://${cleanShop}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
  
  res.redirect(authUrl);
}
