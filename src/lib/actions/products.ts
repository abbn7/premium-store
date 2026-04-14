'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function getProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  activeOnly?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-low' | 'price-high' | 'featured';
}) {
  const supabase = createServerClient();
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories!inner(*),
      images:product_images(*),
      reviews:reviews(rating)
    `);

  if (options?.activeOnly !== false) {
    query = query.eq('is_active', true);
  }
  if (options?.featured) {
    query = query.eq('is_featured', true);
  }
  if (options?.categorySlug) {
    query = query.eq('categories.slug', options.categorySlug);
  }
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }
  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }
  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }

  // Handle sorting
  switch (options?.sort) {
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'featured':
    default:
      query = query.order('is_featured', { ascending: false }).order('sort_order', { ascending: true });
      break;
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(product => {
    const reviews = product.reviews || [];
    const avg_rating = reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0;
    return {
      ...product,
      avg_rating: Math.round(avg_rating * 10) / 10,
      review_count: reviews.length,
      images: (product.images || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
    };
  });
}

export async function getProductBySlug(slug: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      reviews:reviews(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  const reviews = data.reviews || [];
  const avg_rating = reviews.length > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    ...data,
    avg_rating: Math.round(avg_rating * 10) / 10,
    review_count: reviews.length,
    images: (data.images || []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
    reviews: (reviews).filter((r: { is_approved: boolean }) => r.is_approved),
  };
}

export async function createProduct(formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get('name') as string;
  const slug = generateSlug(name);
  const price = parseFloat(formData.get('price') as string) || 0;
  const compareAtPrice = formData.get('compare_at_price')
    ? parseFloat(formData.get('compare_at_price') as string)
    : null;

  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description: formData.get('description') as string || null,
      price,
      compare_at_price: compareAtPrice,
      category_id: (formData.get('category_id') as string) || null,
      stock_quantity: parseInt(formData.get('stock_quantity') as string) || 0,
      is_featured: formData.get('is_featured') === 'true',
      is_active: formData.get('is_active') !== 'false',
      badge_text: (formData.get('badge_text') as string) || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, data };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string) || 0;
  const compareAtPrice = formData.get('compare_at_price')
    ? parseFloat(formData.get('compare_at_price') as string)
    : null;

  const updates: Record<string, unknown> = {
    name,
    slug: generateSlug(name),
    description: formData.get('description') as string || null,
    price,
    compare_at_price: compareAtPrice,
    category_id: (formData.get('category_id') as string) || null,
    stock_quantity: parseInt(formData.get('stock_quantity') as string) || 0,
    is_featured: formData.get('is_featured') === 'true',
    is_active: formData.get('is_active') !== 'false',
    badge_text: (formData.get('badge_text') as string) || null,
  };

  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating product:', error);
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function toggleProductFeatured(id: string, isFeatured: boolean) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .update({ is_featured: isFeatured })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
