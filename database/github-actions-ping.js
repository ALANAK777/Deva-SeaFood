#!/usr/bin/env node

/**
 * Simplified keep-alive script for GitHub Actions
 * This script is optimized for CI/CD environments
 */

const https = require('https');

async function pingSupabase() {
  return new Promise((resolve, reject) => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      console.error('Required: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
      process.exit(1);
    }
    
    // Clean and validate the API key (remove any whitespace/invisible characters)
    const cleanApiKey = supabaseKey.trim().replace(/[\r\n\t]/g, '');
    const cleanUrl = supabaseUrl.trim();
    
    console.log(`🏓 Pinging Supabase database at ${new Date().toISOString()}`);
    console.log(`🔗 URL: ${cleanUrl}`);
    console.log(`🔑 API Key length: ${cleanApiKey.length} characters`);
    
    // Validate API key format (should be a long alphanumeric string)
    if (!/^[a-zA-Z0-9._-]+$/.test(cleanApiKey)) {
      console.error('❌ API key contains invalid characters');
      console.error('API key should only contain letters, numbers, dots, underscores, and hyphens');
      process.exit(1);
    }
    
    // Extract hostname from URL
    const url = new URL(cleanUrl);
    const hostname = url.hostname;
    
    const options = {
      hostname: hostname,
      port: 443,
      path: '/rest/v1/',  // Simple health check endpoint
      method: 'GET',
      headers: {
        'apikey': cleanApiKey,
        'Authorization': `Bearer ${cleanApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GitHub-Actions-Keep-Alive/1.0'
      },
      timeout: 10000 // 10 second timeout
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Database is active and responding');
          console.log(`📊 Response status: ${res.statusCode}`);
          resolve(true);
        } else {
          console.error(`❌ Unexpected response status: ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function main() {
  try {
    console.log('🎯 GitHub Actions Supabase Keep-Alive');
    console.log('=====================================');
    
    await pingSupabase();
    
    console.log('🎉 Keep-alive ping successful!');
    console.log('📅 Next automatic ping in 6 hours');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Keep-alive ping failed:', error.message);
    process.exit(1);
  }
}

main();