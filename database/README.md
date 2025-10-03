# Database Schema Export Tools

This folder contains tools to export your complete Supabase database schema including tables, functions, triggers, and RLS policies.

## Files Generated

- **`COMPLETE_DATABASE_SETUP.sql`** - Complete database schema with all components
- **Backup files** - Timestamped backups of previous exports

## Available Scripts

### 1. NPM Scripts (Recommended)

```bash
# Export schema using manual method (most reliable)
npm run export-schema

# Export schema using Supabase CLI (requires CLI setup)
npm run export-schema-cli
```

### 2. PowerShell Script

```powershell
# Run from project root directory
.\database\export-database-schema.ps1
```

### 3. Direct Node.js Scripts

```bash
# Manual schema export (more reliable)
node database/export-schema-direct.js

# CLI-based export (requires supabase CLI)
node database/export-schema.js
```

## Prerequisites

1. **Environment Variables**: Make sure your `.env` file contains:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Dependencies**: The scripts use the `dotenv` package (already installed)

3. **Supabase CLI** (optional): For CLI-based export method
   ```bash
   # Install via scoop
   scoop install supabase
   
   # Login to Supabase
   supabase login
   ```

## What's Included in the Export

### Database Structure
- ✅ Tables with constraints and indexes
- ✅ Functions and stored procedures
- ✅ Triggers for automatic updates
- ✅ Row Level Security (RLS) policies
- ✅ Extensions (uuid-ossp, pgcrypto)
- ✅ Proper permissions and grants

### Key Components
- **Profiles Table**: User management with roles
- **Products Table**: Product catalog with categories
- **Orders Table**: Order management with status tracking
- **Order Items Table**: Order line items
- **Admin Functions**: `is_admin_user()`, revenue tracking, stock monitoring
- **Security Policies**: Complete RLS setup for data protection

## Usage Scenarios

### 1. New Database Setup
Use the generated `COMPLETE_DATABASE_SETUP.sql` file to set up a new Supabase project:

1. Create a new Supabase project
2. Go to SQL Editor in Supabase Dashboard
3. Copy and paste the contents of `COMPLETE_DATABASE_SETUP.sql`
4. Execute the script

### 2. Schema Backup
Regular exports serve as backups of your database schema:
- Run `npm run export-schema` before major changes
- Keep versioned backups for rollback capability

### 3. Team Collaboration
Share the schema file with team members:
- Include in version control
- Use for local development setup
- Document database changes

## Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Ensure `.env` file exists in project root
   - Check that `EXPO_PUBLIC_SUPABASE_URL` is set correctly

2. **Supabase CLI Errors**
   - The script will fallback to manual schema generation
   - CLI method is optional, manual method is preferred

3. **Permission Errors**
   - Ensure your Supabase user has proper permissions
   - Use service key if available (not stored in version control)

### Manual Method vs CLI Method

- **Manual Method** (default): Generates schema from known structure
- **CLI Method**: Attempts to dump from live database using Supabase CLI

The manual method is more reliable and includes all necessary components for the SeaFood App.

## File Structure

```
database/
├── COMPLETE_DATABASE_SETUP.sql      # Main schema file
├── export-schema-direct.js          # Manual export script
├── export-schema.js                 # CLI export script  
├── export-database-schema.ps1       # PowerShell wrapper
├── ADD_MISSING_ADMIN_FUNCTION.sql   # Admin function setup
├── backup_scripts/                  # Previous backup scripts
└── README.md                        # This file
```

## Security Notes

- Never commit service keys to version control
- Use anon keys for read-only operations
- RLS policies are included for data protection
- Admin functions use SECURITY DEFINER for safe execution

## Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your `.env` file configuration
3. Try the manual export method if CLI fails
4. Review the generated SQL file for completeness