#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');

/**
 * Validate the exported database schema
 */
class SchemaValidator {
  constructor() {
    this.schemaFile = path.join(__dirname, 'COMPLETE_DATABASE_SETUP.sql');
    this.requiredComponents = {
      extensions: ['uuid-ossp', 'pgcrypto'],
      tables: ['profiles', 'products', 'orders', 'order_items'],
      functions: ['is_admin_user', 'update_updated_at_column', 'get_today_revenue', 'get_low_stock_count'],
      triggers: ['update_profiles_updated_at', 'update_products_updated_at', 'update_orders_updated_at'],
      policies: ['Users can view own profile', 'Admins can view all profiles', 'Anyone can view active products'],
      indexes: ['idx_profiles_role', 'idx_products_category', 'idx_orders_user_id']
    };
  }

  /**
   * Read and validate the schema file
   */
  validateSchema() {
    try {
      console.log('🔍 Validating database schema...\n');

      if (!fs.existsSync(this.schemaFile)) {
        console.error('❌ Schema file not found:', this.schemaFile);
        console.error('Please run: npm run export-schema');
        return false;
      }

      const schemaContent = fs.readFileSync(this.schemaFile, 'utf8');
      const results = {
        extensions: this.checkExtensions(schemaContent),
        tables: this.checkTables(schemaContent),
        functions: this.checkFunctions(schemaContent),
        triggers: this.checkTriggers(schemaContent),
        policies: this.checkPolicies(schemaContent),
        indexes: this.checkIndexes(schemaContent)
      };

      this.displayResults(results);
      return this.allComponentsValid(results);

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  checkExtensions(content) {
    console.log('📦 Checking Extensions...');
    const results = [];
    
    this.requiredComponents.extensions.forEach(ext => {
      const found = content.includes(`CREATE EXTENSION IF NOT EXISTS "${ext}"`);
      results.push({ name: ext, found, type: 'extension' });
      console.log(`  ${found ? '✅' : '❌'} ${ext}`);
    });
    
    return results;
  }

  checkTables(content) {
    console.log('\n📋 Checking Tables...');
    const results = [];
    
    this.requiredComponents.tables.forEach(table => {
      const found = content.includes(`CREATE TABLE IF NOT EXISTS public.${table}`);
      results.push({ name: table, found, type: 'table' });
      console.log(`  ${found ? '✅' : '❌'} ${table}`);
    });
    
    return results;
  }

  checkFunctions(content) {
    console.log('\n⚙️ Checking Functions...');
    const results = [];
    
    this.requiredComponents.functions.forEach(func => {
      const found = content.includes(`CREATE OR REPLACE FUNCTION public.${func}`);
      results.push({ name: func, found, type: 'function' });
      console.log(`  ${found ? '✅' : '❌'} ${func}()`);
    });
    
    return results;
  }

  checkTriggers(content) {
    console.log('\n🔄 Checking Triggers...');
    const results = [];
    
    this.requiredComponents.triggers.forEach(trigger => {
      const found = content.includes(`CREATE TRIGGER ${trigger}`);
      results.push({ name: trigger, found, type: 'trigger' });
      console.log(`  ${found ? '✅' : '❌'} ${trigger}`);
    });
    
    return results;
  }

  checkPolicies(content) {
    console.log('\n🔐 Checking RLS Policies...');
    const results = [];
    
    this.requiredComponents.policies.forEach(policy => {
      const found = content.includes(`"${policy}"`);
      results.push({ name: policy, found, type: 'policy' });
      console.log(`  ${found ? '✅' : '❌'} ${policy}`);
    });
    
    return results;
  }

  checkIndexes(content) {
    console.log('\n📊 Checking Indexes...');
    const results = [];
    
    this.requiredComponents.indexes.forEach(index => {
      const found = content.includes(`CREATE INDEX IF NOT EXISTS ${index}`);
      results.push({ name: index, found, type: 'index' });
      console.log(`  ${found ? '✅' : '❌'} ${index}`);
    });
    
    return results;
  }

  displayResults(results) {
    console.log('\n📈 Validation Summary:');
    console.log('='.repeat(50));

    const allResults = [
      ...results.extensions,
      ...results.tables,
      ...results.functions,
      ...results.triggers,
      ...results.policies,
      ...results.indexes
    ];

    const totalCount = allResults.length;
    const foundCount = allResults.filter(r => r.found).length;
    const missingCount = totalCount - foundCount;

    console.log(`Total Components: ${totalCount}`);
    console.log(`✅ Found: ${foundCount}`);
    console.log(`❌ Missing: ${missingCount}`);
    console.log(`📊 Coverage: ${((foundCount/totalCount) * 100).toFixed(1)}%`);

    if (missingCount > 0) {
      console.log('\n⚠️  Missing Components:');
      allResults
        .filter(r => !r.found)
        .forEach(r => console.log(`  - ${r.name} (${r.type})`));
    }
  }

  allComponentsValid(results) {
    const allResults = [
      ...results.extensions,
      ...results.tables,
      ...results.functions,
      ...results.triggers,
      ...results.policies,
      ...results.indexes
    ];

    return allResults.every(r => r.found);
  }

  /**
   * Get schema file statistics
   */
  getSchemaStats() {
    try {
      const stats = fs.statSync(this.schemaFile);
      const content = fs.readFileSync(this.schemaFile, 'utf8');
      
      console.log('\n📊 Schema File Statistics:');
      console.log('='.repeat(50));
      console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`Lines: ${content.split('\n').length}`);
      console.log(`Last Modified: ${stats.mtime.toISOString()}`);
      
      // Count SQL statements
      const createTables = (content.match(/CREATE TABLE/g) || []).length;
      const createFunctions = (content.match(/CREATE OR REPLACE FUNCTION/g) || []).length;
      const createPolicies = (content.match(/CREATE POLICY/g) || []).length;
      const createIndexes = (content.match(/CREATE INDEX/g) || []).length;
      
      console.log(`Tables: ${createTables}`);
      console.log(`Functions: ${createFunctions}`);
      console.log(`Policies: ${createPolicies}`);
      console.log(`Indexes: ${createIndexes}`);
      
    } catch (error) {
      console.error('❌ Could not get schema statistics:', error.message);
    }
  }

  /**
   * Main validation process
   */
  run() {
    console.log('🎯 Database Schema Validation\n');
    
    const isValid = this.validateSchema();
    this.getSchemaStats();
    
    console.log('\n' + '='.repeat(50));
    
    if (isValid) {
      console.log('🎉 Schema validation passed! All components found.');
      console.log('✅ Your database schema is complete and ready to use.');
    } else {
      console.log('⚠️  Schema validation completed with missing components.');
      console.log('💡 Consider re-running the export or manually adding missing components.');
    }
    
    console.log('\n💡 Next steps:');
    console.log('  1. Review the COMPLETE_DATABASE_SETUP.sql file');
    console.log('  2. Test the schema in a development environment');
    console.log('  3. Use the schema to set up new database instances');
    
    return isValid;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const validator = new SchemaValidator();
  const isValid = validator.run();
  process.exit(isValid ? 0 : 1);
}

module.exports = SchemaValidator;