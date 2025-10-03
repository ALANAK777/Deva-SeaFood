-- Fish Market App Database Schema
-- Complete database structure for SeaFood App
-- Execute this in Supabase SQL Editor for fresh installation

-- ============================================================================
-- CORE TABLES (ordered by dependencies)
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
-- INDEXES FOR PERFORMANCE
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
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to generate order numbers with daily auto-increment
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger AS $$
DECLARE
  today_date date := CURRENT_DATE;
  current_count integer;
  new_order_number varchar(20);
BEGIN
  -- Get or create today's count
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============================================================================
-- HELPER FUNCTIONS FOR SAFE ROLE CHECKING
-- ============================================================================

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_admin() TO authenticated;