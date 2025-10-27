# 🐟 Deva SeaFood - Backend Migration Plan

## 📋 Executive Summary

This document outlines the complete migration strategy from **Supabase** to a custom **Express.js + Neon PostgreSQL** backend for the Deva SeaFood mobile application.

**Current Architecture:** React Native (Expo) → Supabase (Auth + Database + RLS)  
**Target Architecture:** React Native (Expo) → Express.js REST API → Neon PostgreSQL

---

## 🎯 Migration Objectives

1. **Full Control**: Complete ownership of backend logic and database management
2. **Custom Business Logic**: Implement complex operations without RLS limitations
3. **Enhanced Security**: Custom JWT authentication with role-based access control
4. **Better Performance**: Optimized queries and caching strategies
5. **Scalability**: Easier horizontal scaling and microservices integration
6. **Cost Management**: Predictable pricing with Neon's serverless PostgreSQL

---

## 📊 Current Application Analysis

### **Application Overview**
- **Type:** E-commerce Mobile App for Seafood Business
- **Platform:** React Native (Expo)
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Image Handling:** Cloudinary CDN
- **Current Backend:** Supabase (PostgreSQL + Auth + Storage)

### **User Roles**
1. **Customer** - Browse products, place orders, manage cart, view order history
2. **Admin** - Manage products, orders, customers, view reports and analytics

### **Core Features**

#### 🔐 Authentication Module
- Email/Password registration and login
- Role-based access (Customer/Admin)
- Profile creation and management
- Session handling with AsyncStorage
- Auto-logout on app restart (development mode)

#### 🛍️ Customer Features
- Product catalog with category filtering
- Product detail view
- Shopping cart management
DEVA-SEAFOOD/
├── SeaFood_App/                 # Existing mobile app (this repository)
├── seafood-backend/             # Backend project (new)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # Neon DB connection
│   │   │   ├── cloudinary.ts        # Cloudinary config
│   │   │   └── env.ts               # Environment variables
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   ├── role.middleware.ts   # Role-based access control
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts  # Global error handler
│   │   │   └── rateLimiter.middleware.ts
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── product.model.ts
│   │   │   ├── order.model.ts
│   │   │   ├── orderItem.model.ts
│   │   │   └── cart.model.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   └── admin.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── admin.service.ts
│   │   │   └── cloudinary.service.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.ts
│   │   │   ├── product.validator.ts
│   │   │   ├── order.validator.ts
│   │   │   └── user.validator.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.util.ts
│   │   │   ├── password.util.ts
│   │   │   ├── response.util.ts
│   │   │   └── logger.util.ts
│   │   │
│   │   ├── types/
│   │   │   ├── user.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── order.types.ts
│   │   │   └── express.d.ts
│   │   │
│   │   ├── db/
│   │   │   ├── schema.sql            # Database schema
│   │   │   ├── migrations/           # Migration files
│   │   │   └── seeds/                # Seed data
│   │   │
│   │   ├── app.ts                    # Express app setup
│   │   └── server.ts                 # Server entry point
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   └── README.md
- Refresh token rotation strategy

#### **Validation & Security**
- **express-validator** or **Zod** for input validation
- **helmet** for security headers
- **cors** for cross-origin requests
- **express-rate-limit** for rate limiting
- **compression** for response compression

#### **File Upload**
- Continue using **Cloudinary** (already integrated)
- **multer** for handling multipart/form-data

#### **Logging & Monitoring**
- **winston** or **pino** for structured logging
- **morgan** for HTTP request logging
- Error tracking with custom middleware

#### **Development Tools**
- **nodemon** for auto-restart
- **dotenv** for environment variables
- **eslint** + **prettier** for code quality

---

## 📁 Backend Project Structure

```
seafood-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Neon DB connection
│   │   ├── cloudinary.ts        # Cloudinary config
│   │   └── env.ts               # Environment variables
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── role.middleware.ts   # Role-based access control
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts  # Global error handler
│   │   └── rateLimiter.middleware.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── order.model.ts
│   │   ├── orderItem.model.ts
│   │   └── cart.model.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── product.controller.ts
│   │   ├── order.controller.ts
│   │   ├── cart.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   ├── cart.service.ts
│   │   ├── admin.service.ts
│   │   └── cloudinary.service.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── product.routes.ts
│   │   ├── order.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── order.validator.ts
│   │   └── user.validator.ts
│   │
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   ├── response.util.ts
│   │   └── logger.util.ts
│   │
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── express.d.ts
│   │
│   ├── db/
│   │   ├── schema.sql            # Database schema
│   │   ├── migrations/           # Migration files
│   │   └── seeds/                # Seed data
│   │
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

---

## 🗃️ Database Migration Strategy

### **Step 1: Neon Database Setup**

1. **Create Neon Project**
   - Sign up at https://neon.tech
   - Create new project: `deva-seafood-prod`
   - Note connection string

2. **Connection String Format**
   ```
   postgres://[user]:[password]@[host]/[database]?sslmode=require
   ```

3. **Configure Pooling**
   ```typescript
   import { Pool, neonConfig } from '@neondatabase/serverless';
   import ws from 'ws';
   
   neonConfig.webSocketConstructor = ws;
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: true,
     max: 10 // Connection pool size
   });
   ```

### **Step 2: Schema Migration**

**Migrate from Supabase schema to Neon:**

```sql
-- Core Tables (adapted from COMPLETE_DATABASE_SETUP.sql)

-- Users table (replaces auth.users + profiles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  
  -- Address fields
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  landmark TEXT,
  address_type VARCHAR(20) DEFAULT 'home',
  
  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  
  CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin')),
  CONSTRAINT users_address_type_check CHECK (address_type IN ('home', 'work', 'other'))
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  unit VARCHAR(20) DEFAULT 'kg',
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT products_price_check CHECK (price > 0),
  CONSTRAINT products_stock_check CHECK (stock_quantity >= 0),
  CONSTRAINT products_category_check CHECK (
    category IN ('fish', 'crab', 'prawn', 'other', 'Fresh Fish', 'Prawns & Shrimp', 'Crabs', 'Dried Fish', 'Fish Curry Cut')
  )
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  
  -- Delivery information
  delivery_address JSONB NOT NULL,
  delivery_phone VARCHAR(20) NOT NULL,
  delivery_notes TEXT,
  verification_code VARCHAR(10),
  
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT orders_total_check CHECK (total_amount > 0),
  CONSTRAINT orders_status_check CHECK (
    status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')
  ),
  CONSTRAINT orders_payment_status_check CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  )
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT order_items_price_check CHECK (price > 0),
  CONSTRAINT order_items_subtotal_check CHECK (subtotal > 0)
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  quantity INTEGER NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT cart_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT cart_items_unique UNIQUE (user_id, product_id)
);

-- Refresh tokens table (for JWT refresh strategy)
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT refresh_tokens_unique UNIQUE (token)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_cart_user_id ON cart_items(user_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
    LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER generate_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION generate_order_number();
```

### **Step 3: Data Migration Script**

Create a migration script to transfer existing data from Supabase to Neon:

```typescript
// migrate-data.ts
import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';

async function migrateData() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const neonPool = new Pool({ connectionString: NEON_URL });
  
  // 1. Migrate profiles to users (manual password reset needed)
  // 2. Migrate products
  // 3. Migrate orders
  // 4. Migrate order_items
  
  console.log('Migration completed!');
}
```

---

## 🔌 API Design

### **Base URL**
```
Development: http://localhost:3000/api/v1
Production: https://api.devaseafood.com/api/v1
```

### **Authentication Endpoints**

#### POST `/auth/register`
Register new user (customer or admin)

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "9876543210",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "full_name": "John Doe",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### POST `/auth/login`
Login with email and password

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "full_name": "John Doe",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### POST `/auth/refresh`
Refresh access token

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### POST `/auth/logout`
Logout and invalidate refresh token

**Headers:** `Authorization: Bearer {accessToken}`

#### POST `/auth/forgot-password`
Request password reset

#### POST `/auth/reset-password`
Reset password with token

---

### **User/Profile Endpoints**

#### GET `/users/profile`
Get current user profile

**Headers:** `Authorization: Bearer {accessToken}`

#### PUT `/users/profile`
Update user profile

**Request:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "9876543210",
  "address_line1": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001"
}
```

#### GET `/users/me`
Get current user details (alias for /profile)

---

### **Product Endpoints**

#### GET `/products`
Get all active products

**Query Params:**
- `category` (optional): Filter by category
- `search` (optional): Search by name
- `page` (default: 1)
- `limit` (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### GET `/products/:id`
Get single product details

#### GET `/products/category/:category`
Get products by category

#### POST `/products` [ADMIN]
Create new product

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "name": "Fresh Sea Bass",
  "description": "Premium quality",
  "price": 450.00,
  "category": "Fresh Fish",
  "stock_quantity": 50,
  "unit": "kg",
  "image_url": "cloudinary_url"
}
```

#### PUT `/products/:id` [ADMIN]
Update product

#### DELETE `/products/:id` [ADMIN]
Delete/deactivate product

---

### **Cart Endpoints**

#### GET `/cart`
Get user's cart items

**Headers:** `Authorization: Bearer {accessToken}`

#### POST `/cart`
Add item to cart

**Request:**
```json
{
  "product_id": "uuid",
  "quantity": 2
}
```

#### PUT `/cart/:id`
Update cart item quantity

#### DELETE `/cart/:id`
Remove item from cart

#### DELETE `/cart`
Clear entire cart

---

### **Order Endpoints**

#### GET `/orders`
Get user's orders (with pagination)

**Headers:** `Authorization: Bearer {accessToken}`

**Query Params:**
- `status` (optional)
- `page`, `limit`

#### GET `/orders/:id`
Get order details with items

#### POST `/orders`
Create new order

**Request:**
```json
{
  "payment_method": "cod",
  "delivery_address": {
    "street": "123 Main St",
    "area": "Andheri",
    "city": "Mumbai",
    "pincode": "400053",
    "landmark": "Near Mall"
  },
  "delivery_phone": "9876543210",
  "delivery_notes": "Call before delivery",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-20251024-0001",
      "verification_code": "1234",
      "total_amount": 900.00,
      "status": "pending"
    }
  }
}
```

#### PUT `/orders/:id/cancel`
Cancel order (customer only if pending)

---

### **Admin Endpoints**

#### GET `/admin/dashboard`
Get dashboard statistics

**Headers:** `Authorization: Bearer {accessToken}` (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrders": 150,
      "totalProducts": 45,
      "totalCustomers": 89,
      "totalRevenue": 125000.00,
      "pendingOrders": 12,
      "lowStockItems": 5,
      "revenueToday": 5600.00
    }
  }
}
```

#### GET `/admin/orders`
Get all orders with filters

**Query Params:**
- `status`, `payment_status`
- `from_date`, `to_date`
- `page`, `limit`

#### PUT `/admin/orders/:id`
Update order status

**Request:**
```json
{
  "status": "confirmed",
  "payment_status": "paid",
  "delivery_date": "2025-10-26T10:00:00Z"
}
```

#### GET `/admin/customers`
Get all customers

#### GET `/admin/customers/:id`
Get customer details with order history

#### GET `/admin/reports/revenue`
Get revenue reports

**Query Params:**
- `period`: daily, weekly, monthly, yearly
- `from_date`, `to_date`

#### GET `/admin/reports/products`
Get product performance reports

#### GET `/admin/products/low-stock`
Get low stock products

---

## 🔒 Authentication & Authorization Implementation

### **JWT Strategy**

**Access Token:**
- Short-lived (15 minutes - 1 hour)
- Contains user ID, role, email
- Used for API requests

**Refresh Token:**
- Long-lived (7-30 days)
- Stored in database
- Used to generate new access tokens
- Invalidated on logout

**Token Structure:**
```typescript
interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  iat: number;
  exp: number;
}
```

### **Middleware Implementation**

```typescript
// auth.middleware.ts
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// role.middleware.ts
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

export const requireCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Customer access required' 
    });
  }
  next();
};
```

---

## 📱 Mobile App Changes

### **Environment Variables**

Update `.env`:
```env
# Backend API
EXPO_PUBLIC_API_URL=https://api.devaseafood.com/api/v1
# or for development
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1

# Cloudinary (keep existing)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dr8csfvlj
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fishapp_unsigned

# Remove Supabase configs
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### **API Service Updates**

Create new `src/services/api.ts`:
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried, try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_REFRESH_TOKEN);
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });
        
        await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, data.tokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.USER_TOKEN,
          STORAGE_KEYS.USER_REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA
        ]);
        // Navigate to login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### **Update Service Files**

#### `src/services/auth.ts`
```typescript
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', credentials);
    
    // Store tokens
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, data.data.tokens.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_REFRESH_TOKEN, data.data.tokens.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));
    
    return data;
  },
  
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', credentials);
    
    // Store tokens
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, data.data.tokens.accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_REFRESH_TOKEN, data.data.tokens.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user));
    
    return data;
  },
  
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA
      ]);
    }
  },
  
  async getCurrentUser(): Promise<User> {
    const { data } = await api.get('/users/me');
    return data.data.user;
  }
};
```

#### `src/services/productService.ts`
```typescript
import api from './api';

export const productService = {
  async getProducts(category?: string): Promise<Product[]> {
    const params = category && category !== 'all' ? { category } : {};
    const { data } = await api.get('/products', { params });
    return data.data.products;
  },
  
  async getProduct(id: string): Promise<Product> {
    const { data } = await api.get(`/products/${id}`);
    return data.data.product;
  },
  
  // Admin methods
  async createProduct(productData: CreateProductData): Promise<Product> {
    const { data } = await api.post('/products', productData);
    return data.data.product;
  },
  
  async updateProduct(id: string, updates: UpdateProductData): Promise<Product> {
    const { data } = await api.put(`/products/${id}`, updates);
    return data.data.product;
  },
  
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};
```

#### `src/services/orderService.ts`
```typescript
import api from './api';

export const orderService = {
  async getOrders(params?: { status?: string; page?: number }): Promise<Order[]> {
    const { data } = await api.get('/orders', { params });
    return data.data.orders;
  },
  
  async getOrder(id: string): Promise<Order> {
    const { data } = await api.get(`/orders/${id}`);
    return data.data.order;
  },
  
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const { data } = await api.post('/orders', orderData);
    return data.data.order;
  },
  
  async cancelOrder(id: string): Promise<Order> {
    const { data } = await api.put(`/orders/${id}/cancel`);
    return data.data.order;
  }
};
```

#### `src/services/cartService.ts`
```typescript
import api from './api';

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const { data } = await api.get('/cart');
    return data.data.items;
  },
  
  async addToCart(productId: string, quantity: number): Promise<CartItem> {
    const { data } = await api.post('/cart', { product_id: productId, quantity });
    return data.data.item;
  },
  
  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const { data } = await api.put(`/cart/${id}`, { quantity });
    return data.data.item;
  },
  
  async removeFromCart(id: string): Promise<void> {
    await api.delete(`/cart/${id}`);
  },
  
  async clearCart(): Promise<void> {
    await api.delete('/cart');
  }
};
```

#### `src/services/adminService.ts`
```typescript
import api from './api';

export const adminService = {
  async getDashboard(): Promise<AdminStats> {
    const { data } = await api.get('/admin/dashboard');
    return data.data.stats;
  },
  
  async getOrders(params?: any): Promise<Order[]> {
    const { data } = await api.get('/admin/orders', { params });
    return data.data.orders;
  },
  
  async updateOrder(id: string, updates: any): Promise<Order> {
    const { data } = await api.put(`/admin/orders/${id}`, updates);
    return data.data.order;
  },
  
  async getCustomers(): Promise<Customer[]> {
    const { data } = await api.get('/admin/customers');
    return data.data.customers;
  },
  
  async getReports(type: string, params?: any): Promise<any> {
    const { data } = await api.get(`/admin/reports/${type}`, { params });
    return data.data;
  }
};
```

### **Remove Supabase Dependencies**

1. Remove `@supabase/supabase-js` from package.json
2. Delete `src/services/supabase.ts`
3. Update imports across all files
4. Remove Supabase-specific code (RLS, auth.uid(), etc.)

---

## 🚀 Migration Execution Plan

### **Phase 1: Backend Development (Week 1-2)**

#### Week 1: Core Setup
- [ ] Initialize Express.js project with TypeScript
- [ ] Set up Neon database and test connection
- [ ] Create database schema and run migrations
- [ ] Implement authentication (JWT, bcrypt)
- [ ] Create user registration and login endpoints
- [ ] Implement middleware (auth, error handling, validation)
- [ ] Set up logging and monitoring

#### Week 2: Core Features
- [ ] Implement product endpoints (CRUD)
- [ ] Implement cart endpoints
- [ ] Implement order endpoints
- [ ] Implement user profile endpoints
- [ ] Implement admin endpoints
- [ ] Add Cloudinary integration for images
- [ ] Write unit tests
- [ ] API documentation with Swagger/Postman

### **Phase 2: Mobile App Updates (Week 2-3)**

- [ ] Create new API service layer
- [ ] Update authentication flow
- [ ] Update product service
- [ ] Update cart service
- [ ] Update order service
- [ ] Update admin service
- [ ] Update profile service
- [ ] Remove Supabase dependencies
- [ ] Test all features thoroughly

### **Phase 3: Data Migration (Week 3)**

- [ ] Export data from Supabase
- [ ] Create migration scripts
- [ ] Migrate users (note: password reset required)
- [ ] Migrate products
- [ ] Migrate orders and order items
- [ ] Verify data integrity
- [ ] Test with production data

### **Phase 4: Testing & Deployment (Week 4)**

#### Backend Deployment
- [ ] Set up CI/CD pipeline
- [ ] Deploy to cloud platform (Vercel, Railway, Render, AWS)
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure rate limiting and security
- [ ] Set up monitoring and alerts

#### Mobile App Deployment
- [ ] Update environment variables
- [ ] Test with production API
- [ ] Build new APK/IPA
- [ ] Submit to app stores (if applicable)
- [ ] Monitor for issues

#### Post-Launch
- [ ] Monitor API performance
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Fix bugs and optimize
- [ ] Document learnings

---

## 🔧 Development Environment Setup

### **Backend Setup**

```bash
# 1. Create monorepo root and backend directory
# (Windows PowerShell alternative shown below)
mkdir DEVA-SEAFOOD
mkdir DEVA-SEAFOOD/seafood-backend
cd DEVA-SEAFOOD/seafood-backend

# PowerShell alternative:
# New-Item -ItemType Directory -Path .\DEVA-SEAFOOD\seafood-backend -Force

# 2. Initialize Node.js project
npm init -y

# 3. Install dependencies
npm install express @neondatabase/serverless
npm install bcryptjs jsonwebtoken
npm install express-validator
npm install helmet cors compression morgan
npm install dotenv ws

# 4. Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D @types/cors @types/compression @types/morgan
npm install -D nodemon ts-node
npm install -D eslint prettier

# 5. Initialize TypeScript
npx tsc --init

# 6. Create project structure
mkdir -p src/{config,middleware,models,controllers,services,routes,validators,utils,types,db}
```

### **package.json Scripts**

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

### **Environment Variables**

Create `.env`:
```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=dr8csfvlj
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:19000,exp://192.168.1.100:19000

# Logging
LOG_LEVEL=debug
```

---

## 📊 Performance Optimization

### **Database Optimization**

1. **Indexes**: Already defined in schema
2. **Connection Pooling**: Use Neon's pooling
3. **Query Optimization**: Use EXPLAIN ANALYZE
4. **Caching**: Redis for frequently accessed data

### **API Optimization**

1. **Response Compression**: Use compression middleware
2. **Pagination**: Implement on all list endpoints
3. **Field Selection**: Allow clients to select fields
4. **Caching Headers**: Set appropriate cache headers
5. **Rate Limiting**: Prevent abuse

### **Mobile App Optimization**

1. **Request Batching**: Combine multiple requests
2. **Image Optimization**: Use Cloudinary transformations
3. **Offline Support**: Cache data locally
4. **Lazy Loading**: Load data as needed

---

## 🛡️ Security Considerations

### **Backend Security**

1. **Environment Variables**: Never commit secrets
2. **Input Validation**: Validate all inputs
3. **SQL Injection**: Use parameterized queries
4. **XSS Protection**: Sanitize outputs
5. **CSRF Protection**: Use tokens for state-changing operations
6. **Rate Limiting**: Prevent brute force attacks
7. **Helmet.js**: Set security headers
8. **CORS**: Configure properly
9. **HTTPS Only**: Force SSL in production
10. **Dependencies**: Keep updated and audit regularly

### **Authentication Security**

1. **Password Hashing**: bcrypt with salt rounds >= 10
2. **JWT Security**: Short expiration, secure secret
3. **Refresh Tokens**: Store in database, allow revocation
4. **Password Policy**: Enforce strong passwords
5. **Account Lockout**: After failed attempts
6. **Email Verification**: Verify user emails
7. **Password Reset**: Secure token-based flow

---

## 📈 Monitoring & Logging

### **Logging Strategy**

```typescript
// logger.util.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### **Monitoring Tools**

- **Application Monitoring**: New Relic, Datadog, or Sentry
- **Database Monitoring**: Neon built-in monitoring
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Log Aggregation**: Loggly, Papertrail, or CloudWatch

---

## 💰 Cost Estimation

### **Neon PostgreSQL**
- **Free Tier**: 3GB storage, 1 project
- **Pro**: $19/month - 10GB, better performance
- **Business**: Custom pricing

### **Backend Hosting**
- **Vercel**: Free tier available, $20+/month for production
- **Railway**: $5-20/month
- **Render**: Free tier, $7+/month for production
- **AWS EC2/ECS**: $20-100/month depending on size

### **Total Estimated Cost**
- **Development**: $0-10/month
- **Production (Small)**: $30-50/month
- **Production (Medium)**: $100-200/month

---

## 🎯 Success Criteria

### **Technical**
- [ ] All API endpoints functional and tested
- [ ] Response times < 500ms for 95th percentile
- [ ] 99.9% uptime
- [ ] Zero data loss during migration
- [ ] All security measures implemented

### **Business**
- [ ] Seamless user experience (no disruption)
- [ ] All existing features working
- [ ] Improved performance
- [ ] Reduced costs vs. Supabase

### **User Experience**
- [ ] Login/registration works flawlessly
- [ ] Orders can be placed without issues
- [ ] Admin panel fully functional
- [ ] No data inconsistencies

---

## 🚨 Rollback Plan

### **If Issues Arise**

1. **Keep Supabase Active**: Don't delete for 30 days
2. **Feature Flags**: Use flags to switch between backends
3. **Database Backup**: Regular backups of Neon DB
4. **Quick Revert**: Switch env variables to Supabase endpoints
5. **Communication**: Inform users of any issues immediately

---

## 📚 Additional Resources

### **Documentation to Create**

1. **API Documentation**: Swagger/OpenAPI spec
2. **Database Schema**: ER diagrams
3. **Deployment Guide**: Step-by-step deployment
4. **Development Guide**: How to contribute
5. **Troubleshooting Guide**: Common issues and solutions

### **Learning Resources**

- Express.js: https://expressjs.com/
- Neon Database: https://neon.tech/docs
- JWT Authentication: https://jwt.io/introduction
- TypeScript: https://www.typescriptlang.org/docs/

---

## ✅ Checklist Before Going Live

### **Backend**
- [ ] All endpoints tested and documented
- [ ] Error handling implemented everywhere
- [ ] Logging configured properly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database migrations tested
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] SSL certificate configured

### **Mobile App**
- [ ] All Supabase references removed
- [ ] New API service tested
- [ ] Error handling updated
- [ ] Environment variables updated
- [ ] App tested on real devices
- [ ] Performance acceptable
- [ ] Build succeeds without errors

### **Data Migration**
- [ ] All data migrated successfully
- [ ] Data integrity verified
- [ ] No orphaned records
- [ ] User accounts accessible
- [ ] Order history preserved

### **Deployment**
- [ ] Production database ready
- [ ] API deployed and accessible
- [ ] DNS configured (if custom domain)
- [ ] SSL working
- [ ] Mobile app updated with prod URLs
- [ ] Rollback plan ready

---

## 🎉 Conclusion

This migration from Supabase to Express.js + Neon DB will provide:

✅ **Full Control** over backend logic and data  
✅ **Better Performance** with optimized queries  
✅ **Enhanced Security** with custom authentication  
✅ **Scalability** for future growth  
✅ **Cost Efficiency** with predictable pricing  
✅ **Flexibility** to add complex features  

**Estimated Timeline**: 3-4 weeks  
**Estimated Effort**: 1 full-time developer  
**Risk Level**: Medium (with proper testing)  

**Next Steps**: 
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 (Backend Development)
4. Regular progress reviews

---

**Document Version**: 1.0  
**Created**: October 24, 2025  
**Author**: GitHub Copilot  
**Status**: Draft - Pending Review
