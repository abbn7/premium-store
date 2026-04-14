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
  
  const imageUrl = product.images?.[0]?.image_url;
  
  return {
    title: product.name,
    description: product.description || `Buy ${product.name}`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: imageUrl ? [imageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || '',
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSettings(),
  ]);

  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: any) => img.image_url),
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
      priceCurrency: settings?.currency || 'USD',
      price: product.price,
      availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        currencySymbol={settings?.currency_symbol || '$'}
        whatsappUrl={settings?.whatsapp_url || ''}
      />
    </>
  );
}
