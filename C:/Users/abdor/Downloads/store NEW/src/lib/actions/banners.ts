'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBanners(activeOnly: boolean = true) {
  const supabase = createServerClient();
  let query = supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
  return data || [];
}

export async function createBanner(formData: FormData) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('banners')
    .insert({
      title: formData.get('title') as string,
      subtitle: (formData.get('subtitle') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      link_url: (formData.get('link_url') as string) || null,
      is_active: formData.get('is_active') !== 'false',
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateBanner(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('banners')
    .update({
      title: formData.get('title') as string,
      subtitle: (formData.get('subtitle') as string) || null,
      image_url: (formData.get('image_url') as string) || null,
      link_url: (formData.get('link_url') as string) || null,
      is_active: formData.get('is_active') !== 'false',
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteBanner(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
