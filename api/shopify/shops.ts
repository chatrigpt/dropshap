import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('shops')
      .select('shop_domain, installed_at');
    
    if (error) throw error;
    res.status(200).json(data || []);
  } catch (error: any) {
    console.error('Error fetching shops:', error.message);
    res.status(500).json({ error: 'Failed to fetch connected shops', details: error.message });
  }
}
