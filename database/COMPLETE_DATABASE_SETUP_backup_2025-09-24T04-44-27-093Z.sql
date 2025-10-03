-- ============================================================================
-- SEAFOOD APP - COMPLETE DATABASE SETUP
-- ============================================================================
-- This file contains all database schema, policies, functions, and sample data
-- Execute this in Supabase SQL Editor for a fresh installation
-- Created by analyzing: current_db.sql, policies.sql, revenue_functions.sql, updates.sql
-- 
-- EXECUTION ORDER:
-- 1. Tables and schema
-- 2. Indexes 
-- 3. Functions
-- 4. Triggers
-- 5. Row Level Security policies
-- 6. Sample data
-- ============================================================================

-- ============================================================================
-- PART 1: CORE TABLES (ordered by dependencies)
-- ============================================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'customer'::text CHECK (role = ANY (ARRAY['customer'::text, 'admin'::text])),
  -- Address fields for delivery
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  landmark text,
  country text DEFAULT 'India',
  address_type text DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price > 0::numeric),
  category text NOT NULL CHECK (category = ANY (ARRAY['Fresh Fish'::text, 'Prawns & Shrimp'::text, 'Crabs'::text, 'Dried Fish'::text, 'Fish Curry Cut'::text])),
  image_url text,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  unit text NOT NULL DEFAULT 'kg'::text CHECK (unit = ANY (ARRAY['kg'::text, 'piece'::text, 'gram'::text])),
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

-- 3. Cart items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id)
);

-- 4. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0::numeric),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'out_for_delivery'::text, 'delivered'::text, 'cancelled'::text])),
  payment_method text NOT NULL DEFAULT 'cod'::text CHECK (payment_method = ANY (ARRAY['cod'::text, 'online'::text])),
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text])),
  delivery_address jsonb NOT NULL,
  delivery_phone text NOT NULL,
  delivery_notes text,
  verification_code text,
  delivery_date timestamp with time zone,
  order_number varchar(20),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 5. Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  quantity_kg numeric NOT NULL CHECK (quantity_kg > 0),
  price_per_kg numeric NOT NULL CHECK (price_per_kg > 0::numeric),
  subtotal numeric NOT NULL CHECK (subtotal > 0::numeric),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- 6. Daily statistics table
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_orders integer NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  pending_orders integer NOT NULL DEFAULT 0,
  delivered_orders integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_stats_pkey PRIMARY KEY (id)
);

-- 7. Order counts table (for daily order numbering)
CREATE TABLE IF NOT EXISTS public.order_counts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_counts_pkey PRIMARY KEY (id),
  CONSTRAINT order_counts_date_unique UNIQUE (date)
);

-- ============================================================================
-- PART 2: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_postal_code ON public.profiles(postal_code);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON public.daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_order_counts_date ON public.order_counts(date);

-- ============================================================================
-- PART 3: HELPER FUNCTIONS
-- ============================================================================

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin (safe from RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to check admin access capability
CREATE OR REPLACE FUNCTION public.can_access_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Function to generate order numbers with daily auto-increment
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date date := CURRENT_DATE;
  current_count integer;
  new_order_number varchar(20);
BEGIN
  -- Get or create today's count (SECURITY DEFINER allows bypassing RLS)
  INSERT INTO public.order_counts (date, count)
  VALUES (today_date, 1)
  ON CONFLICT (date) 
  DO UPDATE SET 
    count = order_counts.count + 1,
    updated_at = now()
  RETURNING count INTO current_count;
  
  -- Generate order number: ORD-YYYYMMDD-XXX
  new_order_number := 'ORD-' || to_char(today_date, 'YYYYMMDD') || '-' || lpad(current_count::text, 3, '0');
  
  NEW.order_number := new_order_number;
  RETURN NEW;
END;
$$;

-- Function to get comprehensive admin statistics including accurate revenue
CREATE OR REPLACE FUNCTION public.get_admin_revenue_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  user_role text;
  total_revenue numeric := 0;
  today_revenue numeric := 0;
  delivered_orders_count integer := 0;
  today_delivered_count integer := 0;
BEGIN
  -- Check if user is admin
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Calculate total revenue from delivered orders
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COUNT(*)
  INTO total_revenue, delivered_orders_count
  FROM orders 
  WHERE status = 'delivered';
  
  -- Calculate today's revenue from delivered orders
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COUNT(*)
  INTO today_revenue, today_delivered_count
  FROM orders 
  WHERE status = 'delivered' 
    AND DATE(created_at) = CURRENT_DATE;
  
  -- Build result JSON
  SELECT json_build_object(
    'totalRevenue', total_revenue,
    'revenueToday', today_revenue,
    'deliveredOrdersCount', delivered_orders_count,
    'todayDeliveredCount', today_delivered_count,
    'averageOrderValue', CASE 
      WHEN delivered_orders_count > 0 THEN ROUND(total_revenue / delivered_orders_count, 2)
      ELSE 0 
    END,
    'calculatedAt', now()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get order status breakdown for debugging
CREATE OR REPLACE FUNCTION public.get_order_status_breakdown()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  user_role text;
BEGIN
  -- Check if user is admin
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get order status breakdown with revenue
  SELECT json_agg(
    json_build_object(
      'status', status,
      'count', count,
      'totalAmount', total_amount,
      'averageAmount', ROUND(avg_amount, 2)
    )
  ) INTO result
  FROM (
    SELECT 
      status,
      COUNT(*) as count,
      COALESCE(SUM(total_amount), 0) as total_amount,
      COALESCE(AVG(total_amount), 0) as avg_amount
    FROM orders 
    GROUP BY status
    ORDER BY status
  ) breakdown;
  
  RETURN result;
END;
$$;

-- Function to get payment status breakdown
CREATE OR REPLACE FUNCTION public.get_payment_status_breakdown()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  user_role text;
BEGIN
  -- Check if user is admin
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  
  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get payment status breakdown
  SELECT json_agg(
    json_build_object(
      'paymentStatus', payment_status,
      'orderStatus', status,
      'count', count,
      'totalAmount', total_amount
    )
  ) INTO result
  FROM (
    SELECT 
      payment_status,
      status,
      COUNT(*) as count,
      COALESCE(SUM(total_amount), 0) as total_amount
    FROM orders 
    GROUP BY payment_status, status
    ORDER BY payment_status, status
  ) breakdown;
  
  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_revenue_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_status_breakdown() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_payment_status_breakdown() TO authenticated;

-- ============================================================================
-- PART 4: TRIGGERS
-- ============================================================================

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_daily_stats_updated_at
  BEFORE UPDATE ON public.daily_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_order_counts_updated_at
  BEFORE UPDATE ON public.order_counts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-generate order numbers
DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_counts ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Public can view available products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;

DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Admins can view all carts" ON public.cart_items;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

DROP POLICY IF EXISTS "Admins can manage daily stats" ON public.daily_stats;
DROP POLICY IF EXISTS "Admins can manage order counts" ON public.order_counts;
DROP POLICY IF EXISTS "Admins can view order counts" ON public.order_counts;
DROP POLICY IF EXISTS "Allow trigger to manage order counts" ON public.order_counts;
DROP POLICY IF EXISTS "Allow trigger to update order counts" ON public.order_counts;

-- PROFILES TABLE POLICIES
-- Users can manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can manage all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin_user());

-- PRODUCTS TABLE POLICIES
-- Public can view available products
CREATE POLICY "Public can view available products" ON public.products
  FOR SELECT USING (is_available = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (public.is_admin_user());

-- CART_ITEMS TABLE POLICIES
-- Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (user_id = auth.uid());

-- Admins can view all carts
CREATE POLICY "Admins can view all carts" ON public.cart_items
  FOR SELECT USING (public.is_admin_user());

-- ORDERS TABLE POLICIES
-- Users can manage their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Admins can manage all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (public.is_admin_user());

-- ORDER_ITEMS TABLE POLICIES
-- Users can manage order items for their own orders
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id AND customer_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (public.is_admin_user());

-- DAILY_STATS TABLE POLICIES
-- Only admins can access daily stats
CREATE POLICY "Admins can manage daily stats" ON public.daily_stats
  FOR ALL USING (public.is_admin_user());

-- ORDER_COUNTS TABLE POLICIES
-- Only admins can manage order counts (SECURITY DEFINER function bypasses RLS)
CREATE POLICY "Admins can manage order counts" ON public.order_counts
  FOR ALL USING (public.is_admin_user());

-- ============================================================================
-- PART 6: SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert admin user profile (this user must exist in auth.users first)
-- You need to create this user through Supabase Auth first, then run this:
INSERT INTO public.profiles (id, email, full_name, phone, role, city, state, country) 
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, -- Replace with actual admin user ID
  'admin@seafood.com',
  'Admin User',
  '+1234567890',
  'admin',
  'Mumbai',
  'Maharashtra',
  'India'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin User',
  email = 'admin@seafood.com',
  phone = '+1234567890',
  updated_at = now();

-- Sample Products Data
INSERT INTO public.products (name, description, price, category, image_url, stock_quantity, unit, is_available) VALUES

-- FRESH FISH CATEGORY
('King Fish (Surmai)', 'Premium king fish steaks, fresh catch of the day. Perfect for frying or grilling with spices.', 450.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 25, 'kg', true),
('Pomfret Fish', 'Silver pomfret, fresh and cleaned. Ideal for Bengali fish curry or steamed preparations.', 800.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=400&fit=crop', 15, 'kg', true),
('Rohu Fish', 'Fresh rohu fish, perfect for traditional Indian fish curry. Sweet water fish with minimal bones.', 320.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 30, 'kg', true),
('Salmon Fish', 'Atlantic salmon fillets, rich in omega-3. Perfect for grilling and continental dishes.', 1200.00, 'Fresh Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 8, 'kg', true),

-- PRAWNS & SHRIMP CATEGORY
('Tiger Prawns Large', 'Fresh tiger prawns, large size. Perfect for prawns fry or biryani preparations.', 650.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 20, 'kg', true),
('Medium Prawns', 'Fresh medium-sized prawns, cleaned and deveined. Ideal for curry and masala preparations.', 480.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 25, 'kg', true),
('Jumbo Prawns', 'Extra large jumbo prawns. Premium quality for special occasions and restaurant-style dishes.', 950.00, 'Prawns & Shrimp', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&h=400&fit=crop', 12, 'kg', true),

-- CRABS CATEGORY
('Mud Crabs', 'Fresh mud crabs, live. Excellent for crab curry or steamed crab preparations.', 800.00, 'Crabs', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 10, 'kg', true),
('Blue Swimming Crabs', 'Fresh blue swimming crabs. Sweet meat perfect for crab masala and coastal preparations.', 600.00, 'Crabs', 'https://images.unsplash.com/photo-1558464690-5d6a5c7b8b6a?w=500&h=400&fit=crop', 15, 'kg', true),

-- DRIED FISH CATEGORY
('Dried Bombay Duck', 'Traditional dried bombay duck. Perfect for making bombil fry or curry preparations.', 320.00, 'Dried Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 30, 'kg', true),
('Dried Anchovies', 'Small dried anchovies, full of flavor. Great for making sambhar and South Indian curries.', 280.00, 'Dried Fish', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 25, 'kg', true),

-- FISH CURRY CUT CATEGORY
('Tuna Curry Cut', 'Fresh tuna cut into curry pieces. Perfect for fish curry and traditional preparations.', 420.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 18, 'kg', true),
('Kingfish Curry Cut', 'King fish cut into curry pieces. Ideal for spicy fish curry and Konkani preparations.', 380.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 22, 'kg', true),
('Mackerel Curry Cut', 'Fresh mackerel cut for curry. Rich in omega-3 and perfect for traditional fish curry.', 350.00, 'Fish Curry Cut', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=400&fit=crop', 20, 'kg', true);

-- Update timestamps for products
UPDATE public.products SET 
  created_at = now(),
  updated_at = now()
WHERE created_at IS NULL;

-- ============================================================================
-- PART 7: DATA MIGRATION (for existing databases)
-- ============================================================================

-- Generate order numbers for existing orders (if any)
DO $$
DECLARE
  order_record RECORD;
  order_date date;
  daily_count integer;
  new_order_number varchar(20);
BEGIN
  -- Only run if there are orders without order numbers
  IF EXISTS (SELECT 1 FROM public.orders WHERE order_number IS NULL) THEN
    FOR order_record IN 
      SELECT id, created_at 
      FROM public.orders 
      WHERE order_number IS NULL 
      ORDER BY created_at ASC
    LOOP
      order_date := order_record.created_at::date;
      
      -- Get current count for this date
      SELECT COALESCE(MAX(count), 0) + 1 
      INTO daily_count
      FROM public.order_counts 
      WHERE date = order_date;
      
      -- Insert or update count
      INSERT INTO public.order_counts (date, count)
      VALUES (order_date, daily_count)
      ON CONFLICT (date) 
      DO UPDATE SET count = daily_count;
      
      -- Generate order number
      new_order_number := 'ORD-' || to_char(order_date, 'YYYYMMDD') || '-' || lpad(daily_count::text, 3, '0');
      
      -- Update the order
      UPDATE public.orders 
      SET order_number = new_order_number 
      WHERE id = order_record.id;
    END LOOP;
    
    RAISE NOTICE 'Order numbers generated for existing orders';
  ELSE
    RAISE NOTICE 'All orders already have order numbers';
  END IF;
END $$;

-- ============================================================================
-- PART 8: VERIFICATION AND TESTING
-- ============================================================================

-- Verify all tables exist
DO $$
DECLARE
  missing_tables text[] := ARRAY[]::text[];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    missing_tables := missing_tables || 'profiles';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    missing_tables := missing_tables || 'products';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    missing_tables := missing_tables || 'orders';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
    missing_tables := missing_tables || 'order_items';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
    missing_tables := missing_tables || 'cart_items';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_stats') THEN
    missing_tables := missing_tables || 'daily_stats';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_counts') THEN
    missing_tables := missing_tables || 'order_counts';
  END IF;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ All required tables created successfully';
  END IF;
END $$;

-- Verify functions exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin_user') THEN
    RAISE NOTICE '❌ Missing function: is_admin_user()';
  ELSE
    RAISE NOTICE '✅ Function is_admin_user() exists';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_order_number') THEN
    RAISE NOTICE '❌ Missing function: generate_order_number()';
  ELSE
    RAISE NOTICE '✅ Function generate_order_number() exists';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_admin_revenue_stats') THEN
    RAISE NOTICE '❌ Missing function: get_admin_revenue_stats()';
  ELSE
    RAISE NOTICE '✅ Function get_admin_revenue_stats() exists';
  END IF;
END $$;

-- Test admin function (will return false for anonymous users, true for admin users)
SELECT public.is_admin_user() as current_user_is_admin;

-- Test sample data
SELECT 
  category,
  COUNT(*) as product_count,
  ROUND(AVG(price), 2) as avg_price
FROM public.products 
WHERE is_available = true
GROUP BY category
ORDER BY category;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

SELECT 'SeaFood App database setup completed successfully!' as status,
       'All tables, indexes, functions, triggers, and policies are ready.' as message,
       'Sample data has been inserted for testing.' as note,
       'You can now connect your app and start testing.' as next_step;

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. Replace the admin user ID in the sample data with your actual admin user ID
-- 2. Revenue calculations count 'delivered' orders (includes COD)
-- 3. Order numbers are auto-generated with format: ORD-YYYYMMDD-XXX
-- 4. All RLS policies are optimized to prevent recursion
-- 5. Address fields are included in profiles for delivery management
-- 6. Admin functions include detailed revenue and order analytics
-- ============================================================================