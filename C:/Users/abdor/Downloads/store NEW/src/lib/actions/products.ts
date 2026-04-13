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
}) {
  const supabase = createServerClient();
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      reviews:reviews(rating)
    `)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (options?.activeOnly !== false) {
    query = query.eq('is_active', true);
  }
  if (options?.featured) {
    query = query.eq('is_featured', true);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Calculate average rating for each product
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

export async function getProductsByCategory(categorySlug: string) {
  const supabase = createServerClient();

  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return [];

  return getProducts();
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
