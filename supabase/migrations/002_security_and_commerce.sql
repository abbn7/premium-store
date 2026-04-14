-- ═══════════════════════════════════════════════════════════════
-- Migration 002: Security, Orders, and Advanced Commerce
-- ═══════════════════════════════════════════════════════════════

-- 1. AUTHENTICATION & USERS
-- Create a profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Color: Red, Size: XL"
  sku TEXT UNIQUE,
  price NUMERIC(10,2), -- Override product price if set
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_address JSONB,
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
  payment_method TEXT, -- cod, stripe, paypal
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  price_at_time NUMERIC(10,2) NOT NULL,
  name_at_time TEXT NOT NULL
);

-- 4. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- percentage, fixed_amount
  discount_value NUMERIC(10,2) NOT NULL,
  min_purchase_amount NUMERIC(10,2) DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS UPDATES & SECURITY
-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Product Variants: Public read
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Users can view items of their own orders
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Coupons: Public read for active coupons
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (is_active = true);

-- Admin Policies (for profiles with is_admin = true)
CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can do everything on variants" ON product_variants FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can do everything on orders" ON orders FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can do everything on order_items" ON order_items FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can do everything on coupons" ON coupons FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- FIX STORAGE SECURITY (restrict to admins)
DROP POLICY IF EXISTS "Allow upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete product images" ON storage.objects;

CREATE POLICY "Admins can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 6. TRIGGERS
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
