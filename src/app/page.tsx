import { getSettings } from '@/lib/actions/settings';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { getReviews } from '@/lib/actions/reviews';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [settings, products, categories, reviews] = await Promise.all([
    getSettings(),
    getProducts({ activeOnly: true }),
    getCategories(true),
    getReviews(undefined, true),
  ]);

  const featuredProducts = products.filter((p: { is_featured: boolean }) => p.is_featured).slice(0, 8);
  const latestProducts = products.slice(0, 8);

  return (
    <HomeClient
      settings={settings}
      featuredProducts={featuredProducts}
      latestProducts={latestProducts}
      categories={categories}
      reviews={reviews}
    />
  );
}
