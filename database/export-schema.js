#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Export complete Supabase database schema including:
 * - Tables structure
 * - Functions
 * - Triggers  
 * - Policies (RLS)
 * - Indexes
 * - Extensions
 */
class SupabaseSchemaExporter {
  constructor() {
    this.databaseDir = __dirname;
    this.outputFile = path.join(this.databaseDir, 'COMPLETE_DATABASE_SETUP.sql');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Check if Supabase CLI is installed and configured
   */
  checkSupabaseCLI() {
    try {
      console.log('🔍 Checking Supabase CLI installation...');
      const version = execSync('supabase --version', { encoding: 'utf8' });
      console.log('✅ Supabase CLI found:', version.trim());
      return true;
    } catch (error) {
      console.error('❌ Supabase CLI not found. Please install it first:');
      console.error('   scoop install supabase');
      return false;
    }
  }

  /**
   * Check if user is logged in to Supabase
   */
  checkSupabaseAuth() {
    try {
      console.log('🔍 Checking Supabase authentication...');
      execSync('supabase projects list', { encoding: 'utf8', stdio: 'pipe' });
      console.log('✅ Supabase authentication verified');
      return true;
    } catch (error) {
      console.error('❌ Not authenticated with Supabase. Please login first:');
      console.error('   supabase login');
      return false;
    }
  }

  /**
   * Get the project reference from environment or user input
   */
  getProjectReference() {
    // Try to get from environment variables first
    const projectRef = process.env.EXPO_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (projectRef) {
      console.log('✅ Found project reference from environment:', projectRef);
      return projectRef;
    }

    console.log('⚠️  Project reference not found in environment variables.');
    console.log('Please provide your Supabase project reference (from your project URL):');
    console.log('Example: if your URL is https://abcdefgh.supabase.co, then reference is "abcdefgh"');
    
    return null;
  }

  /**
   * Export database schema using Supabase CLI
   */
  async exportSchema(projectRef) {
    try {
      console.log('🚀 Starting database schema export...');
      
      // Create a comprehensive SQL export
      const exportCommand = `supabase db dump --project-id ${projectRef} --schema public --data-only=false`;
      
      console.log('📥 Exporting database schema...');
      const schemaSQL = execSync(exportCommand, { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large schemas
      });

      return schemaSQL;
    } catch (error) {
      console.error('❌ Failed to export schema:', error.message);
      throw error;
    }
  }

  /**
   * Export RLS policies separately for better organization
   */
  async exportPolicies(projectRef) {
    try {
      console.log('🔐 Exporting RLS policies...');
      
      // Export policies using pg_dump equivalent command
      const policiesCommand = `supabase db dump --project-id ${projectRef} --schema public --data-only=false --exclude-table-data='*'`;
      
      const policiesSQL = execSync(policiesCommand, { 
        encoding: 'utf8',
        maxBuffer: 5 * 1024 * 1024 // 5MB buffer
      });

      // Extract only policy-related statements
      const policyLines = policiesSQL
        .split('\n')
        .filter(line => 
          line.includes('CREATE POLICY') || 
          line.includes('ALTER TABLE') && line.includes('ENABLE ROW LEVEL SECURITY') ||
          line.includes('GRANT') ||
          line.includes('REVOKE')
        );

      return policyLines.join('\n');
    } catch (error) {
      console.error('⚠️  Could not export policies separately, they should be included in main schema');
      return '';
    }
  }

  /**
   * Format and organize the exported SQL
   */
  formatSQL(schemaSQL, policiesSQL = '') {
    const header = `-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Generated: ${new Date().toISOString()}
-- Project: SeaFood App
-- =====================================================

-- This file contains the complete database schema including:
-- • Tables and their structure
-- • Functions and stored procedures  
-- • Triggers and automation
-- • RLS policies and security
-- • Indexes and constraints
-- • Extensions and configurations

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- MAIN SCHEMA
-- =====================================================

`;

    const footer = `

-- =====================================================
-- RLS POLICIES (if not included above)
-- =====================================================

${policiesSQL}

-- =====================================================
-- FINAL SETUP
-- =====================================================

-- Ensure RLS is enabled on all necessary tables
-- (This should be handled by the schema above)

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- End of database setup
-- =====================================================
`;

    return header + schemaSQL + footer;
  }

  /**
   * Save the exported schema to file
   */
  saveToFile(content) {
    try {
      console.log('💾 Saving schema to file...');
      
      // Create backup of existing file if it exists
      if (fs.existsSync(this.outputFile)) {
        const backupFile = path.join(this.databaseDir, `COMPLETE_DATABASE_SETUP_backup_${this.timestamp}.sql`);
        fs.copyFileSync(this.outputFile, backupFile);
        console.log('📦 Created backup:', path.basename(backupFile));
      }

      // Write new schema file
      fs.writeFileSync(this.outputFile, content, 'utf8');
      console.log('✅ Schema exported successfully to:', path.basename(this.outputFile));
      
      // Show file stats
      const stats = fs.statSync(this.outputFile);
      console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      
    } catch (error) {
      console.error('❌ Failed to save file:', error.message);
      throw error;
    }
  }

  /**
   * Main export process
   */
  async run() {
    try {
      console.log('🎯 Starting Supabase Schema Export Process...\n');

      // Pre-flight checks
      if (!this.checkSupabaseCLI()) return;
      if (!this.checkSupabaseAuth()) return;

      // Get project reference
      const projectRef = this.getProjectReference();
      if (!projectRef) {
        console.error('❌ Project reference is required. Please set EXPO_PUBLIC_SUPABASE_URL in your .env file or provide it manually.');
        return;
      }

      // Export schema
      const schemaSQL = await this.exportSchema(projectRef);
      const policiesSQL = await this.exportPolicies(projectRef);

      // Format and save
      const formattedSQL = this.formatSQL(schemaSQL, policiesSQL);
      this.saveToFile(formattedSQL);

      console.log('\n🎉 Database schema export completed successfully!');
      console.log('📁 Output file:', this.outputFile);
      console.log('\n💡 You can now use this file to:');
      console.log('   • Set up new database instances');
      console.log('   • Share schema with team members');
      console.log('   • Keep track of database changes');
      console.log('   • Restore database structure');

    } catch (error) {
      console.error('\n❌ Export failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the exporter if this file is executed directly
if (require.main === module) {
  const exporter = new SupabaseSchemaExporter();
  exporter.run();
}

module.exports = SupabaseSchemaExporter;