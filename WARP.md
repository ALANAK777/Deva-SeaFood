# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is "Deva Sea Food" - a React Native seafood marketplace app built with Expo, featuring role-based authentication (Customer/Admin), product management, cart functionality, and order processing. The app uses Supabase as the backend database and Cloudinary for image storage.

## Development Commands

### Core Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator  
- `npm run web` - Run web version

### Platform-Specific Development
- `npx expo start --android` - Start with Android focus
- `npx expo start --ios` - Start with iOS focus
- `npx expo start --web` - Start web development server
- `npx expo start --clear` - Start with cleared cache

### Build and Deploy
- `npx expo build` - Build the app for distribution
- `npx expo publish` - Publish update to Expo
- `eas build --platform android` - Build Android APK (requires EAS CLI)
- `eas build --platform ios` - Build iOS app (requires EAS CLI)

## Architecture Overview

### Tech Stack
- **Frontend**: React Native with Expo SDK ~53.0.22
- **State Management**: Redux Toolkit with React-Redux
- **Navigation**: React Navigation v7 (Native Stack & Bottom Tabs)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Image Storage**: Cloudinary
- **Form Handling**: React Hook Form
- **UI Components**: Custom components with React Native Vector Icons

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── modals/         # Modal components (Toast, Confirm, Input, Custom)
│   └── ui/             # UI components (LoadingSpinner)
├── hooks/              # Custom React hooks
│   ├── redux.ts        # Typed Redux hooks
│   └── useModal.ts     # Modal management hook
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx     # Root navigation logic
│   ├── AuthStack.tsx        # Authentication flow
│   ├── CustomerStack.tsx    # Customer app navigation
│   ├── AdminStack.tsx       # Admin app navigation
│   └── types.ts            # Navigation type definitions
├── screens/            # Screen components
│   ├── admin/          # Admin-specific screens
│   └── customer/       # Customer-specific screens
├── services/           # API and external services
│   ├── supabase.ts     # Supabase client and types
│   ├── auth.ts         # Main authentication service
│   ├── adminService.ts      # Admin-specific operations
│   ├── productService.ts    # Product management
│   ├── cartService.ts       # Cart operations
│   ├── orderService.ts      # Order processing
│   ├── profileService.ts    # User profile management
│   └── cloudinaryService.ts # Image upload
├── store/              # Redux store configuration
│   ├── index.ts        # Store configuration
│   ├── authSlice.ts    # Authentication state
│   ├── productSlice.ts # Product catalog state
│   ├── cartSlice.ts    # Shopping cart state
│   └── profileSlice.ts # User profile state
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and constants
    └── constants.ts    # App constants and configuration
```

### Key Architectural Patterns

#### Application Flow
The app follows a structured initialization flow:
1. **Splash Screen**: Always shown first for 3 seconds with "Deva Sea Food" branding
2. **Authentication Check**: After splash, checks if user is logged in
3. **Route Decision**: Navigates to appropriate stack based on auth status

**Note**: Recent fixes ensure splash screen properly transitions without infinite loading

#### Role-Based Navigation
The app uses a three-tier navigation system after splash:
1. **AppNavigator**: Root navigator that shows splash first, then decides between Auth, Customer, or Admin flows
2. **AuthStack**: Login/Register screens for unauthenticated users
3. **CustomerStack/AdminStack**: Role-specific navigation with bottom tabs

#### State Management with Redux Toolkit
- **authSlice**: Manages user authentication, token storage, and role-based access
- **productSlice**: Handles product catalog, filtering, and search
- **cartSlice**: Shopping cart operations with local storage persistence
- **profileSlice**: User profile data and updates

#### Database Schema (Supabase)
Key tables:
- **profiles**: User data with role-based access (customer/admin)
- **products**: Seafood catalog with categories, pricing, and stock
- **cart_items**: Shopping cart persistence across sessions
- **orders**: Order tracking with status management
- **order_items**: Detailed order line items
- **daily_stats**: Analytics for admin dashboard

#### Service Layer Architecture
Services handle all external API calls and business logic:
- Authentication flows with Supabase Auth
- Product CRUD operations with image upload to Cloudinary
- Cart synchronization between local state and database
- Order processing with verification codes
- Profile management with phone/address updates

## Development Guidelines

### Database Development
- Schema files are in `/database/` directory
- Main schema: `My_db.sql` (reference only, not executable)
- Migration files available for schema updates
- Use `supabase.ts` types for type safety

### Authentication Flow
- Role-based authentication (customer/admin)
- Token-based sessions with AsyncStorage persistence
- Automatic auth state checking on app launch
- Email confirmation can be disabled via database scripts

### Product Management
- Products are categorized by seafood type (Fresh Fish, Prawns & Shrimp, Crabs, Dried Fish, Fish Curry Cut)
- Pricing is per kilogram with decimal quantity support
- **Image Upload**: Full integration with Cloudinary for cloud storage
  - Camera capture with square cropping
  - Gallery selection with editing
  - Manual URL entry (iOS)
  - Automatic optimization and cloud upload
  - Local fallback if cloud upload fails
- Stock management with availability flags
- Admin-only product creation and editing

### Order Processing
- Multi-step checkout process
- COD (Cash on Delivery) and online payment support
- Order status tracking (pending → confirmed → preparing → out_for_delivery → delivered)
- Verification codes for order confirmation

### State Persistence
- Redux state persists authentication and cart data
- AsyncStorage keys defined in `STORAGE_KEYS` constant
- Cart items sync between local storage and Supabase

### Constants and Configuration
All app constants are centralized in `src/utils/constants.ts`:
- **App branding**: APP_NAME set to "Deva Sea Food"
- Colors, sizes, and styling constants
- Fish categories and order status enums
- API endpoints with environment variable support
- Storage keys for AsyncStorage (prefixed with `@deva_sea_food_*`)

## Environment Setup
Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_RAZORPAY_KEY`: Razorpay payment gateway key

## Recent Updates & Project Cleanup

### App Rebranding (Latest)
- **App name changed** from "Fish Market" to "Deva Sea Food"
- Updated in `app.json`, `package.json`, constants, and all screens
- **Splash screen** now displays "Deva Sea Food" with tagline "Fresh Seafood, Delivered Daily"
- **Storage keys** updated to `@deva_sea_food_*` format
- **Fixed splash screen infinite loading issue** - now properly transitions to auth screens

### Previous Cleanup
The project has been cleaned up to remove:
- Duplicate authentication services (`auth_new.ts`, `mockAuth.ts`)
- Duplicate navigation type definitions
- Empty files and unused dependencies
- Only production-ready files remain

## Database Files
- `database/supabase_schema.sql` - Main executable schema for Supabase (includes all latest updates)
- `database/update_schema.sql` - Schema updates for existing databases (run if you already have database set up)
- `database/sample_data.sql` - Sample data for testing (optional)

### Database Setup Instructions
**For New Database:**
1. Run `database/supabase_schema.sql` in Supabase SQL Editor
2. Optionally run `database/sample_data.sql` for test data

**For Existing Database (if you have authentication errors):**
1. Run `database/update_schema.sql` in Supabase SQL Editor
2. This adds the missing INSERT policy for profiles table

## Testing Notes
- No formal testing framework is currently set up
- Manual testing should cover both customer and admin user flows
- Test authentication flows with both roles
- Verify cart persistence across app restarts
- Test order creation and status updates
- Use sample_data.sql to populate database for testing

### Splash Screen Flow Testing
- **✅ Fixed**: App now properly shows "Deva Sea Food" splash screen first (3 seconds)
- After splash, authentication check begins without infinite loading
- For new users: splash → login/register screen ("Join Deva Sea Food today")
- For returning users: splash → auth check → appropriate dashboard
- **Tagline**: "Fresh Seafood, Delivered Daily" appears on splash
- **No more infinite loading**: Splash properly transitions to auth screens
- Test app restart behavior to ensure splash always appears first

## Troubleshooting

### Common Issues & Solutions

**Splash Screen Issues**:
- If splash screen loads infinitely: Check `AppNavigator.tsx` auth flow logic
- If splash doesn't show: Verify `showSplash` state is properly managed
- If app name doesn't update: Clear app cache and rebuild

**Environment Issues**:
- If Supabase connection fails: Verify `.env` file has correct credentials
- If app doesn't start: Run `npm install` and restart Metro bundler
- If storage keys conflict: Clear AsyncStorage or update storage key constants

**Development Commands**:
- Clear cache: `npx expo start --clear`
- Reset Metro cache: `npx react-native start --reset-cache`
- Rebuild app: `npx expo run:android` or `npx expo run:ios`
