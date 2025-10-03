#!/usr/bin/env node

// Supabase Keep-Alive Script
// This script pings your Supabase database to prevent it from pausing

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

class SupabaseKeepAlive {
  constructor() {
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.error('❌ Missing Supabase credentials in .env file');
      process.exit(1);
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  /**
   * Ping the database with a simple query
   */
  async pingDatabase() {
    try {
      console.log(`🏓 Pinging Supabase database at ${new Date().toISOString()}`);
      
      // Simple query to keep the database active
      const { data, error } = await this.supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Ping failed:', error.message);
        return false;
      }
      
      console.log('✅ Database is active and responding');
      return true;
      
    } catch (error) {
      console.error('❌ Ping error:', error.message);
      return false;
    }
  }

  /**
   * Run a single ping
   */
  async runOnce() {
    console.log('🎯 Running single database ping...\n');
    const success = await this.pingDatabase();
    
    if (success) {
      console.log('\n🎉 Ping successful! Database is active.');
    } else {
      console.log('\n⚠️ Ping failed. Database might be paused or there\'s a connection issue.');
    }
  }

  /**
   * Run periodic pings to keep database active
   */
  async runPeriodic(intervalHours = 12) {
    console.log(`🎯 Starting periodic database pings every ${intervalHours} hours...\n`);
    
    // Run initial ping
    await this.pingDatabase();
    
    // Set up periodic pings
    const intervalMs = intervalHours * 60 * 60 * 1000; // Convert to milliseconds
    
    setInterval(async () => {
      await this.pingDatabase();
    }, intervalMs);
    
    console.log(`⏰ Keep-alive scheduled. Press Ctrl+C to stop.`);
  }
}

// Command line usage
async function main() {
  const args = process.argv.slice(2);
  const keepAlive = new SupabaseKeepAlive();
  
  if (args.includes('--periodic') || args.includes('-p')) {
    // Get interval from args or default to 12 hours
    const intervalIndex = args.findIndex(arg => arg === '--interval' || arg === '-i');
    const interval = intervalIndex !== -1 ? parseInt(args[intervalIndex + 1]) || 12 : 12;
    
    await keepAlive.runPeriodic(interval);
  } else {
    await keepAlive.runOnce();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = SupabaseKeepAlive;