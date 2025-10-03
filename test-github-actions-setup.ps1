# Quick Test Script for GitHub Actions Setup

Write-Host "🎯 GitHub Actions Setup Test" -ForegroundColor Cyan
Write-Host ""

# Test local environment first
Write-Host "1. Testing local database connection..." -ForegroundColor Yellow

try {
    $currentDir = Get-Location
    $envFile = Join-Path $currentDir ".env"
    
    if (Test-Path $envFile) {
        Write-Host "✅ .env file found" -ForegroundColor Green
        
        # Test the ping script
        Write-Host "🏓 Running database ping test..." -ForegroundColor Yellow
        npm run db-ping
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Local ping test successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ Local ping test failed" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ .env file not found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing local setup: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Next Steps for GitHub Actions:" -ForegroundColor Yellow
Write-Host "   📖 Read: GITHUB_ACTIONS_SETUP.md" -ForegroundColor White
Write-Host "   🔗 Go to: https://github.com/ALANAK777/Deva-SeaFood/settings/secrets/actions" -ForegroundColor White
Write-Host "   🔐 Add repository secrets from your .env file" -ForegroundColor White
Write-Host "   ▶️ Test: Actions tab → Run workflow manually" -ForegroundColor White

Write-Host ""
Write-Host "3. Required GitHub Secrets:" -ForegroundColor Yellow
Write-Host "   • EXPO_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   • EXPO_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   • EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME (optional)" -ForegroundColor White
Write-Host "   • EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET (optional)" -ForegroundColor White

Write-Host ""
Write-Host "💡 Once setup, your database will be pinged every 6 hours automatically!" -ForegroundColor Cyan