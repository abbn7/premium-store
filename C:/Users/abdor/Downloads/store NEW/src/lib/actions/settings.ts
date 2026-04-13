'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  return data;
}

export async function updateSettings(formData: FormData) {
  const supabase = createAdminClient();
  
  const updates: Record<string, string> = {};
  const fields = [
    'store_name', 'store_description', 'hero_title', 'hero_subtitle',
    'hero_image_url', 'instagram_url', 'facebook_url', 'twitter_url',
    'tiktok_url', 'whatsapp_url', 'announcement_text', 'currency',
    'currency_symbol', 'logo_url'
  ];

  fields.forEach(field => {
    const value = formData.get(field);
    if (value !== null) {
      updates[field] = value.toString();
    }
  });

  const { data: settings } = await supabase
    .from('site_settings')
    .select('id')
    .single();

  if (!settings) return { error: 'Settings not found' };

  const { error } = await supabase
    .from('site_settings')
    .update(updates)
    .eq('id', settings.id);

  if (error) {
    console.error('Error updating settings:', error);
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
