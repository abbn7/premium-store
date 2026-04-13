'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function uploadImage(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = createAdminClient();
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No file provided' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl };
}

export async function addProductImage(productId: string, imageUrl: string, isPrimary: boolean = false, sortOrder: number = 0) {
  const supabase = createAdminClient();

  // If setting as primary, unset other primaries
  if (isPrimary) {
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      image_url: imageUrl,
      is_primary: isPrimary,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}

export async function removeProductImage(imageId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
