#!/usr/bin/env node

/**
 * Test script to verify Supabase connection
 */

const https = require('https');

const SUPABASE_URL = 'https://luvnlgfbykkyxhvvjpsl.supabase.co';

console.log('🔍 Testing Supabase connection...');
console.log(`📡 URL: ${SUPABASE_URL}`);

const url = new URL(SUPABASE_URL);

const options = {
  hostname: url.hostname,
  port: 443,
  path: '/rest/v1/',
  method: 'HEAD',
  timeout: 5000
};

const req = https.request(options, (res) => {
  console.log(`✅ Supabase is ACTIVE!`);
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`\n🎉 Your database is working and ready!`);
  process.exit(0);
});

req.on('error', (error) => {
  console.log(`❌ Supabase is still PAUSED or unreachable`);
  console.log(`📛 Error: ${error.message}`);
  console.log(`\n💡 Please restore your project at supabase.com`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log(`❌ Connection timeout`);
  console.log(`\n💡 Please check if your Supabase project is restored`);
  process.exit(1);
});

req.end();
