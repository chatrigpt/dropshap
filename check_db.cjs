const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env', override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key starting with:', supabaseKey ? supabaseKey.substring(0, 10) : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking tables in Supabase...');
  
  const tables = ['profiles', 'products', 'transactions', 'admin_stats', 'shops'];
  
  for (const table of tables) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Range': '0-0'
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.log(`Table ${table}: ERROR ${response.status} - ${text}`);
      } else {
        const json = await response.json();
        const count = json.length;
        console.log(`Table ${table}: OK - Count: ${count}`);
      }
    } catch (e) {
      console.log(`Table ${table}: FETCH ERROR`, e);
    }
  }
}

checkTables();
