# 📱 Build APK Guide for SeaFood App

This guide shows you multiple ways to convert your React Native Expo app into an APK file.

## 🚀 **Method 1: EAS Build (Recommended)**

### Prerequisites
- ✅ EAS CLI installed (already done)
- ✅ Expo account (created during setup)
- ✅ Project configured for EAS (done)

### Build APK Commands

```bash
# Build APK for testing (recommended)
eas build -p android --profile apk

# Alternative: Preview build (also creates APK)
eas build -p android --profile preview

# Production build (creates AAB for Play Store)
eas build -p android
```

### Step-by-Step Process

1. **Login to EAS (if not already logged in)**
   ```bash
   eas login
   ```

2. **Build APK for testing**
   ```bash
   eas build -p android --profile apk
   ```

3. **Wait for build to complete** (5-15 minutes)
   - You'll get a link to download the APK
   - APK will be available in your Expo dashboard

4. **Download and install APK**
   - Use the provided download link
   - Transfer to Android device
   - Enable "Install from unknown sources"
   - Install the APK

## 🎯 **Method 2: Expo Development Build**

For development and testing:

```bash
# Create development build
eas build --profile development --platform android

# Install on device and use with Expo Go
npx expo start --dev-client
```

## 📦 **Method 3: Local Build (Advanced)**

If you need to build locally:

### Prerequisites
- Android Studio installed
- Android SDK configured
- Java 17+ installed

### Steps
1. **Eject to bare React Native**
   ```bash
   npx expo eject
   ```

2. **Build using Gradle**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

3. **Find APK**
   - Located in `android/app/build/outputs/apk/release/`

## 🛠️ **Build Configuration Files**

### app.json Configuration
```json
{
  "expo": {
    "android": {
      "package": "com.devacommerce.seafoodapp",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE", 
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### eas.json Build Profiles
```json
{
  "build": {
    "apk": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 📋 **Build Profiles Explained**

| Profile | Purpose | Output | Signing |
|---------|---------|---------|---------|
| `apk` | Testing APK | APK file | Debug |
| `preview` | Internal testing | APK file | Debug |
| `production` | Play Store | AAB file | Release |
| `development` | Dev client | APK file | Debug |

## 🚀 **Quick Start Commands**

```bash
# 1. Build APK for testing (fastest)
eas build -p android --profile apk

# 2. Check build status
eas build:list

# 3. Download APK when ready
# Use the link provided in terminal or check:
# https://expo.dev/accounts/[username]/projects/DevaSeaFood/builds
```

## 📱 **Installing APK on Android Device**

### Method 1: Direct Download
1. Open the EAS build link on your Android device
2. Download the APK
3. Install directly

### Method 2: Transfer from Computer
1. Download APK to computer
2. Transfer via USB or cloud storage
3. Enable "Install from unknown sources" in Android settings
4. Install the APK

### Method 3: QR Code
1. EAS provides a QR code for each build
2. Scan with Android device
3. Download and install

## 🔧 **Troubleshooting**

### Common Issues

#### Build Fails
```bash
# Check build logs
eas build:list --status=errored

# View specific build
eas build:view [build-id]
```

#### Environment Variables
```bash
# Add secrets for build
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
```

#### App Crashes
- Check Metro bundler logs
- Verify all dependencies are compatible
- Test with Expo Go first

### Build Size Optimization
```json
// In app.json
{
  "expo": {
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableSeparateBuildPerCPUArchitecture": true
    }
  }
}
```

## 📊 **Build Types Comparison**

### APK vs AAB
| Format | Use Case | Size | Distribution |
|--------|----------|------|--------------|
| APK | Testing, sideload | Larger | Direct install |
| AAB | Play Store | Smaller | Google Play only |

### When to Use Each
- **APK**: Testing, demo, sideloading
- **AAB**: Play Store submission (required)

## 🎯 **Recommended Workflow**

### Development Phase
1. Use Expo Go for quick testing
2. Build APK for device testing
3. Share APK with testers

### Production Phase
1. Build AAB for Play Store
2. Upload to Google Play Console
3. Release to users

## 📈 **Next Steps After APK**

### For Testing
- Install on multiple devices
- Test all app features
- Collect feedback

### For Distribution
- Consider Google Play Store
- Set up app signing
- Prepare store listing

## 🔒 **Security Notes**

- APKs are signed with debug key (not for production)
- Use Play Store for public distribution
- Keep signing keys secure
- Enable Play App Signing

## 💡 **Pro Tips**

1. **Build Caching**: EAS caches dependencies for faster builds
2. **Multiple Profiles**: Use different profiles for different purposes
3. **Auto-versioning**: Enable `autoIncrement` for automatic version bumps
4. **Build Webhooks**: Set up notifications for build completion

---

## 🚀 **Start Building Now**

```bash
# Quick APK build command
eas build -p android --profile apk
```

Your APK will be ready in 5-15 minutes! 🎉