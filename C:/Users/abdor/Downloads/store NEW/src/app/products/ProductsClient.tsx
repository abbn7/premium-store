'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProductCard from '@/components/shop/ProductCard';
import FadeIn from '@/components/animations/FadeIn';
import type { Product, Category } from '@/types';

interface ProductsClientProps {
  products: Product[];
  categories: Category[];
  currencySymbol: string;
}

export default function ProductsClient({ products, categories, currencySymbol }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const featuredParam = searchParams.get('featured');

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (featuredParam === 'true') {
      result = result.filter(p => p.is_featured);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category?.slug === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [products, selectedCategory, sortBy, featuredParam]);

  return (
    <>
      <section className="products-hero" id="products-hero">
        <div className="container">
          <FadeIn>
            <p className="section-eyebrow">Our Collection</p>
            <h1 className="section-title">
              {featuredParam === 'true' ? 'Featured Products' : 'All Products'}
            </h1>
            <p className="section-desc">
              Explore our complete range of premium products
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="container">
          {/* Category Filters */}
          {categories.length > 0 && (
            <FadeIn>
              <div className="category-filters" id="category-filters">
                <button
                  className={`category-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-filter-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </FadeIn>
          )}

          {/* Sort & Count */}
          <div className="products-filter-bar" id="products-filter-bar">
            <span className="filter-count">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              id="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              key={`${selectedCategory}-${sortBy}`}
            >
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  index={i}
                />
              ))}
            </motion.div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="empty-state-title">No products found</h3>
              <p className="empty-state-desc">
                Try selecting a different category or check back later for new additions.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
