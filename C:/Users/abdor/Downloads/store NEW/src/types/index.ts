export interface SiteSettings {
  id: string;
  store_name: string;
  store_description: string;
  logo_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  tiktok_url: string;
  whatsapp_url: string;
  announcement_text: string;
  currency: string;
  currency_symbol: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  product_count?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  badge_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface AdminSession {
  isAdmin: boolean;
  email: string;
}
