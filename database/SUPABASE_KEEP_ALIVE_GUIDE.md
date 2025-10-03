# Preventing Supabase Database Pausing

Supabase free tier projects pause after **1 week of inactivity**. Here are multiple solutions to prevent this issue.

## 🚨 Why Does Supabase Pause?

**Free Tier Limitations:**
- Projects pause after 1 week of no database activity
- Resume takes 1-2 minutes when accessed again
- Automatic resource management for cost efficiency

## 🎯 Solutions (Choose One)

### Option 1: Upgrade to Pro Plan (Best Solution)

**Benefits:**
- ✅ Never pauses
- ✅ Better performance
- ✅ More storage (8GB vs 500MB)
- ✅ More concurrent connections
- ✅ Priority support

**Cost:** $25/month per project

**How to upgrade:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → Billing
4. Choose Pro plan

### Option 2: Automated Keep-Alive (Free)

Use the included scripts to automatically ping your database:

#### Manual Ping
```bash
# Test database connection
npm run db-ping
```

#### Continuous Keep-Alive
```bash
# Keep database active (runs every 12 hours)
npm run db-keep-alive

# Custom interval (every 6 hours)
node database/keep-alive.js --periodic --interval 6
```

#### GitHub Actions (Automated)
The included workflow file `.github/workflows/supabase-keep-alive.yml` will:
- ✅ Ping your database every 6 hours
- ✅ Run automatically in the cloud
- ✅ No local computer needed

**Setup GitHub Actions:**
1. Push your code to GitHub
2. Go to GitHub repository → Settings → Secrets and variables → Actions
3. Add these secrets:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your anon key
4. The workflow will run automatically

### Option 3: Local Task Scheduler

#### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily, repeat every 12 hours
4. Action: Start a program
   - Program: `node`
   - Arguments: `"C:\path\to\your\project\database\keep-alive.js"`
   - Start in: `"C:\path\to\your\project"`

#### Linux/Mac Cron Job
```bash
# Edit crontab
crontab -e

# Add this line (runs every 12 hours)
0 */12 * * * cd /path/to/your/project && node database/keep-alive.js
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db-ping` | Single database ping test |
| `npm run db-keep-alive` | Continuous keep-alive (12h interval) |
| `node database/keep-alive.js --periodic --interval 6` | Custom interval |

## 📊 Monitoring

### Check Database Status
1. Go to Supabase Dashboard
2. Your project should show "Active" status
3. If paused, it will show "Paused" with a resume button

### GitHub Actions Monitoring
1. Go to your GitHub repository
2. Click "Actions" tab
3. Monitor "Supabase Keep Alive" workflow runs

## 🔧 Troubleshooting

### Database Still Pausing?
- **Check interval**: Ensure pings happen at least every 6 days
- **Verify credentials**: Make sure Supabase URL and key are correct
- **Check logs**: Review GitHub Actions logs for errors

### Script Not Working?
```bash
# Test manually
npm run db-ping

# Check environment variables
echo $EXPO_PUBLIC_SUPABASE_URL
```

### GitHub Actions Failing?
- Verify repository secrets are set correctly
- Check workflow file syntax
- Review action logs for specific errors

## 💡 Best Practices

### For Development
- Use local keep-alive script during active development
- Set shorter intervals (4-6 hours) for critical projects

### For Production
- **Recommended**: Upgrade to Pro plan
- **Alternative**: Use GitHub Actions for automated pings
- Monitor regularly to ensure scripts are working

### Security Notes
- Never commit Supabase service keys to version control
- Use GitHub Secrets for environment variables
- Use anon keys for read-only operations like keep-alive

## 📈 Cost Comparison

| Solution | Monthly Cost | Reliability | Effort |
|----------|--------------|-------------|---------|
| Pro Plan | $25 | 100% | Low |
| GitHub Actions | Free | 95% | Medium |
| Local Scripts | Free | 80% | High |

## 🎯 Recommended Approach

### For Personal Projects
1. Start with GitHub Actions (free)
2. Upgrade to Pro if project becomes critical

### For Business/Production
1. **Always use Pro plan**
2. More reliable and professional
3. Better performance and support

## 📞 Need Help?

If you continue experiencing issues:
1. Check Supabase status page
2. Review their documentation
3. Contact Supabase support
4. Consider upgrading to Pro for guaranteed uptime

---

**Quick Start:**
```bash
# Test if your database is active
npm run db-ping

# Start automated keep-alive
npm run db-keep-alive
```