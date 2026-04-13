'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function getCategories(activeOnly: boolean = true) {
  const supabase = createServerClient();
  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get product counts
  const { data: products } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true);

  const counts: Record<string, number> = {};
  (products || []).forEach(p => {
    if (p.category_id) {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    }
  });

  return (data || []).map(cat => ({
    ...cat,
    product_count: counts[cat.id] || 0,
  }));
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function createCategory(formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug: generateSlug(name),
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      parent_id: (formData.get('parent_id') as string) || null,
      is_active: formData.get('is_active') !== 'false',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, data };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      slug: generateSlug(name),
      description: (formData.get('description') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      is_active: formData.get('is_active') !== 'false',
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
