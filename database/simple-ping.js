#!/usr/bin/env node

/**
 * Supabase keep-alive ping with actual database query
 * Fetches products to ensure real database activity
 */

const https = require('https');

async function simplePing() {
  return new Promise((resolve, reject) => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables');
      process.exit(1);
    }
    
    // Extract just the hostname
    const url = new URL(supabaseUrl.trim());
    
    console.log(`🏓 Pinging Supabase database at ${url.hostname}`);
    
    // Step 1: Health check
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ Health check response: ${res.statusCode}`);
      // After health check, query the database
      queryProducts();
    });
    
    req.on('error', (error) => {
      console.log(`⚠️ Health check failed: ${error.message}`);
      // Try database query anyway
      queryProducts();
    });
    
    req.on('timeout', () => {
      console.log('⚠️ Health check timeout');
      // Try database query anyway
      queryProducts();
    });
    
    req.end();
    
    function queryProducts() {
      console.log('� Fetching products from database...');
      
      const queryOptions = {
        hostname: url.hostname,
        port: 443,
        path: '/rest/v1/products?select=id,name&limit=2',
        method: 'GET',
        headers: {
          'apikey': supabaseKey.trim(),
          'Authorization': `Bearer ${supabaseKey.trim()}`
        },
        timeout: 10000
      };
      
      const queryReq = https.request(queryOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const products = JSON.parse(data);
              console.log(`✅ Database query successful! Fetched ${products.length} product(s)`);
              if (products.length > 0) {
                console.log(`   📦 Sample: ${products[0].name || 'Product ' + products[0].id}`);
              }
              resolve(res.statusCode);
            } catch (error) {
              console.log(`⚠️ Response parsing error: ${error.message}`);
              resolve(res.statusCode);
            }
          } else {
            console.log(`⚠️ Database query returned status: ${res.statusCode}`);
            resolve(res.statusCode);
          }
        });
      });
      
      queryReq.on('error', (error) => {
        console.log(`❌ Database query failed: ${error.message}`);
        reject(error);
      });
      
      queryReq.on('timeout', () => {
        console.log('❌ Database query timeout');
        reject(new Error('Query timeout'));
      });
      
      queryReq.end();
    }
  });
}

// Run the ping
simplePing()
  .then(() => {
    console.log('🎉 Ping completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ping failed:', error.message);
    process.exit(1);
  });