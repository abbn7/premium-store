import { Suspense } from 'react';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getSettings } from '@/lib/actions/settings';
import ProductsClient from './ProductsClient';

export const metadata = {
  title: 'All Products',
  description: 'Browse our complete collection of premium products.',
};

export default async function ProductsPage() {
  const [products, categories, settings] = await Promise.all([
    getProducts({ activeOnly: true }),
    getCategories(true),
    getSettings(),
  ]);

  return (
    <Suspense fallback={<div className="page-loading"><div className="spinner spinner-lg" /></div>}>
      <ProductsClient
        products={products}
        categories={categories}
        currencySymbol={settings?.currency_symbol || '$'}
      />
    </Suspense>
  );
}
