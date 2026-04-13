'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getReviews(productId?: string, approvedOnly: boolean = true) {
  const supabase = createServerClient();
  let query = supabase
    .from('reviews')
    .select('*, product:products(name, slug)')
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }
  if (approvedOnly) {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data || [];
}

export async function getAllReviews() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, product:products(name, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }
  return data || [];
}

export async function createReview(formData: FormData) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('reviews')
    .insert({
      product_id: formData.get('product_id') as string,
      customer_name: formData.get('customer_name') as string,
      rating: parseInt(formData.get('rating') as string),
      comment: (formData.get('comment') as string) || null,
      is_approved: formData.get('is_approved') === 'true',
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function approveReview(id: string, approved: boolean) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('reviews')
    .update({ is_approved: approved })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteReview(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
