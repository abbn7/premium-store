import { getProductBySlug } from '@/lib/actions/products';
import { getSettings } from '@/lib/actions/settings';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description || `Buy ${product.name}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
  ]);

  if (!product) notFound();

  return (
    <ProductDetailClient
      product={product}
      currencySymbol={settings?.currency_symbol || '$'}
      whatsappUrl={settings?.whatsapp_url || ''}
    />
  );
}
