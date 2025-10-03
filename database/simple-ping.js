#!/usr/bin/env node

/**
 * Ultra-simple Supabase ping using just the health endpoint
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
    
    console.log(`🏓 Simple ping to ${url.hostname}`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      console.log(`✅ Health check response: ${res.statusCode}`);
      resolve(res.statusCode);
    });
    
    req.on('error', (error) => {
      console.log(`❌ Health check failed: ${error.message}`);
      // Try the REST API endpoint instead
      tryRestAPI();
    });
    
    req.on('timeout', () => {
      console.log('❌ Health check timeout');
      tryRestAPI();
    });
    
    req.end();
    
    function tryRestAPI() {
      console.log('🔄 Trying REST API endpoint...');
      
      const restOptions = {
        hostname: url.hostname,
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        headers: {
          'apikey': supabaseKey.trim()
        },
        timeout: 5000
      };
      
      const restReq = https.request(restOptions, (res) => {
        console.log(`✅ REST API response: ${res.statusCode}`);
        resolve(res.statusCode);
      });
      
      restReq.on('error', (error) => {
        console.log(`❌ REST API failed: ${error.message}`);
        reject(error);
      });
      
      restReq.end();
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