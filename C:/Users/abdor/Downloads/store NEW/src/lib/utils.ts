export function formatPrice(price: number, symbol: string = '$'): string {
  return `${symbol}${price.toFixed(2)}`;
}

export function calculateDiscount(price: number, compareAt: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getSupabaseImageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStockStatus(quantity: number): { label: string; class: string } {
  if (quantity <= 0) return { label: 'Out of Stock', class: 'out-of-stock' };
  if (quantity <= 5) return { label: `Only ${quantity} left`, class: 'low-stock' };
  return { label: 'In Stock', class: 'in-stock' };
}
