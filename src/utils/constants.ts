export const APP_CONSTANTS = {
  APP_NAME: 'Deva Sea Food',
  VERSION: '1.0.0',
  SPLASH_DURATION: 3000,
  
  // Colors
  COLORS: {
    PRIMARY: '#2196F3',
    SECONDARY: '#FF9800',
    SUCCESS: '#4CAF50',
    ERROR: '#F44336',
    WARNING: '#FF9800',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY: '#9E9E9E',
    LIGHT_GRAY: '#F5F5F5',
    DARK_GRAY: '#424242',
    BACKGROUND: '#F8F9FA',
    CARD_BACKGROUND: '#FFFFFF',
    BORDER: '#E0E0E0',
    TEXT_PRIMARY: '#212121',
    TEXT_SECONDARY: '#757575',
  },
  
  // Sizes
  SIZES: {
    PADDING: 16,
    MARGIN: 16,
    BORDER_RADIUS: 8,
    BUTTON_HEIGHT: 48,
    INPUT_HEIGHT: 48,
    HEADER_HEIGHT: 60,
  },
  
  // Fish Market Specific
  FISH_CATEGORIES: [
    'Fresh Fish',
    'Prawns & Shrimp', 
    'Crabs',
    'Dried Fish',
    'Fish Curry Cut'
  ],
  
  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  
  // Payment Methods
  PAYMENT_METHODS: {
    COD: 'cod',
    ONLINE: 'online',
  },
  
  // User Roles
  USER_ROLES: {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
  },
};

export const STORAGE_KEYS = {
  USER_TOKEN: '@deva_sea_food_token',
  USER_REFRESH_TOKEN: '@deva_sea_food_refresh_token',
  USER_ROLE: '@deva_sea_food_role',
  CART_ITEMS: '@deva_sea_food_cart',
  USER_DATA: '@deva_sea_food_user',
};

export const API_ENDPOINTS = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  RAZORPAY_KEY: process.env.EXPO_PUBLIC_RAZORPAY_KEY || '',
};
