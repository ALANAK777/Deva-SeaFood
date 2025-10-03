# 🔐 GitHub Actions Setup Guide

## Complete Setup for Supabase Keep-Alive with GitHub Actions

### ✅ **What's Already Done:**
- GitHub Actions workflow file created (`.github/workflows/supabase-keep-alive.yml`)
- Keep-alive script ready (`database/keep-alive.js`)
- NPM script configured (`npm run db-ping`)
- Code pushed to GitHub repository

### 🎯 **Next Steps:**

#### Step 1: Access GitHub Repository Settings
1. Go to your GitHub repository: https://github.com/ALANAK777/Deva-SeaFood
2. Click on **"Settings"** tab (top right of repository)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**

#### Step 2: Add Repository Secrets
Click **"New repository secret"** and add these secrets one by one:

**Secret 1: EXPO_PUBLIC_SUPABASE_URL**
- Name: `EXPO_PUBLIC_SUPABASE_URL`
- Value: `https://luvnlgfbykkyxhvvjpsl.supabase.co`

**Secret 2: EXPO_PUBLIC_SUPABASE_ANON_KEY**
- Name: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dm5sZ2ZieWtreXhodnZqcHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NDYxMjUsImV4cCI6MjA3NDIyMjEyNX0.JI9f679H2LNMYCWwEF5zmGpiq6Xw34C_TkHPVHkCScQ`

**Optional Secret 3: EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME**
- Name: `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Value: `dr8csfvlj`

**Optional Secret 4: EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET**
- Name: `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- Value: `fishapp_unsigned`

#### Step 3: Test the Workflow

**Manual Test:**
1. Go to **"Actions"** tab in your GitHub repository
2. Click on **"Supabase Keep Alive"** workflow
3. Click **"Run workflow"** button (top right)
4. Click **"Run workflow"** to trigger manually
5. Watch the workflow run and check for success ✅

#### Step 4: Monitor Automatic Runs

**Automatic Schedule:**
- The workflow runs every 6 hours automatically
- Times: 00:00, 06:00, 12:00, 18:00 UTC
- Check the **"Actions"** tab to see all runs

### 🎯 **Visual Setup Steps:**

```
GitHub Repository → Settings → Secrets and variables → Actions
                                     ↓
                            New repository secret
                                     ↓
                     Add all 4 environment variables
                                     ↓
                         Actions tab → Run workflow
                                     ↓
                            Monitor success ✅
```

### 📊 **What the Workflow Does:**

1. **Triggers every 6 hours** (prevents 7-day pause limit)
2. **Checks out your code** from the repository
3. **Sets up Node.js environment** and installs dependencies
4. **Runs the ping script** using your Supabase credentials
5. **Reports success/failure** in the Actions log

### 🔍 **Monitoring & Troubleshooting:**

#### Check Workflow Status:
- **Green checkmark ✅**: Successful ping
- **Red X ❌**: Failed ping (check logs)
- **Yellow dot 🟡**: Currently running

#### Common Issues:
1. **Missing secrets**: Add all required secrets in repository settings
2. **Wrong secret names**: Ensure exact spelling (`EXPO_PUBLIC_SUPABASE_URL`)
3. **Invalid credentials**: Verify Supabase URL and key are correct

#### View Logs:
1. Go to Actions tab
2. Click on any workflow run
3. Click on "keep-alive" job
4. Expand steps to see detailed logs

### 🎉 **Success Indicators:**

**In GitHub Actions logs, you should see:**
```
🏓 Pinging Supabase database to keep it active...
✅ Database is active and responding
🎉 Ping successful! Database is active.
✅ Keep-alive ping completed
🎉 Database keep-alive successful
```

### 📅 **Expected Schedule:**

| Time (UTC) | Your Local Time* | Action |
|------------|------------------|---------|
| 00:00 | Varies by timezone | Auto ping |
| 06:00 | Varies by timezone | Auto ping |
| 12:00 | Varies by timezone | Auto ping |
| 18:00 | Varies by timezone | Auto ping |

*Convert UTC to your local timezone

### 🚨 **Important Notes:**

1. **Free GitHub Actions**: 2,000 minutes/month (this uses ~1 minute per run)
2. **Database stays active**: Prevents the 7-day pause limit
3. **No local computer needed**: Runs entirely in GitHub's cloud
4. **Automatic**: Set it once, works forever
5. **Safe**: Uses read-only operations, no data modification

### 🔄 **Alternative: Change Schedule**

To modify the ping frequency, edit `.github/workflows/supabase-keep-alive.yml`:

```yaml
# Every 4 hours
- cron: '0 */4 * * *'

# Every 12 hours  
- cron: '0 */12 * * *'

# Daily at midnight
- cron: '0 0 * * *'
```

### 📞 **Need Help?**

1. **Check Actions tab** for workflow status
2. **Review logs** for specific error messages
3. **Verify secrets** are set correctly
4. **Test manually** using "Run workflow" button

---

## 🚀 **Quick Action Items:**

1. ✅ Go to: https://github.com/ALANAK777/Deva-SeaFood/settings/secrets/actions
2. ✅ Add the 4 repository secrets listed above
3. ✅ Go to Actions tab and run workflow manually to test
4. ✅ Monitor for automatic runs every 6 hours

**Your Supabase database will never pause again!** 🎉