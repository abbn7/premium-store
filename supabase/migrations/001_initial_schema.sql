-- ═══════════════════════════════════════════════════════════════
-- STORE — E-Commerce Database Schema
-- Migration 001: Initial Schema
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- SITE SETTINGS (single row for global config)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL DEFAULT 'Store',
  store_description TEXT DEFAULT 'Welcome to our premium store',
  logo_url TEXT,
  hero_title TEXT DEFAULT 'Elevate Your Style',
  hero_subtitle TEXT DEFAULT 'Discover our curated collection of premium products designed for those who appreciate quality and craftsmanship.',
  hero_image_url TEXT,
  instagram_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  twitter_url TEXT DEFAULT '',
  tiktok_url TEXT DEFAULT '',
  whatsapp_url TEXT DEFAULT '',
  announcement_text TEXT DEFAULT 'Free shipping on orders over $100',
  currency TEXT DEFAULT 'USD',
  currency_symbol TEXT DEFAULT '$',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO site_settings (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- CATEGORIES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock_quantity INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  badge_text TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- PRODUCT IMAGES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- BANNERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES (Performance)
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view active content)
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read active products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read active banners" ON banners FOR SELECT USING (true);

-- Service role full access (for admin operations via service key)
CREATE POLICY "Service role full access site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access product_images" ON product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access banners" ON banners FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKET
-- ═══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: public read
CREATE POLICY "Public read product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Storage policy: anyone can upload (admin will be validated at app level)
CREATE POLICY "Allow upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Storage policy: anyone can update their uploads
CREATE POLICY "Allow update product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

-- Storage policy: anyone can delete
CREATE POLICY "Allow delete product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: Auto-update updated_at on products
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
