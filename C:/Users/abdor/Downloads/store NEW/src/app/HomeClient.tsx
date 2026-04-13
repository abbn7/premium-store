'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '@/components/shop/HeroSection';
import ProductCard from '@/components/shop/ProductCard';
import TrustBadges from '@/components/shop/TrustBadges';
import Newsletter from '@/components/shop/Newsletter';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren from '@/components/animations/StaggerChildren';
import type { SiteSettings, Product, Category, Review } from '@/types';

interface HomeClientProps {
  settings: SiteSettings | null;
  featuredProducts: Product[];
  latestProducts: Product[];
  categories: Category[];
  reviews: Review[];
}

export default function HomeClient({
  settings,
  featuredProducts,
  latestProducts,
  categories,
  reviews,
}: HomeClientProps) {
  const currencySymbol = settings?.currency_symbol || '$';
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : latestProducts;

  return (
    <>
      {/* Hero Section */}
      <HeroSection settings={settings} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Featured/Latest Products */}
      {displayProducts.length > 0 && (
        <section className="section" id="featured-products">
          <div className="container">
            <FadeIn>
              <div className="section-header">
                <p className="section-eyebrow">
                  {featuredProducts.length > 0 ? 'Curated For You' : 'New Arrivals'}
                </p>
                <h2 className="section-title">
                  {featuredProducts.length > 0 ? 'Featured Products' : 'Latest Products'}
                </h2>
                <p className="section-desc">
                  Handpicked selections that embody quality and distinction
                </p>
              </div>
            </FadeIn>

            <StaggerChildren className="grid grid-cols-4 gap-6">
              {displayProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  index={i}
                />
              ))}
            </StaggerChildren>

            <FadeIn delay={0.3}>
              <div className="text-center" style={{ marginTop: 'var(--space-10)' }}>
                <Link href="/products" className="btn btn-secondary">
                  View All Products
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section" style={{ background: 'var(--color-bg-alt)' }} id="categories-section">
          <div className="container">
            <FadeIn>
              <div className="section-header">
                <p className="section-eyebrow">Browse By</p>
                <h2 className="section-title">Shop By Category</h2>
                <p className="section-desc">
                  Explore our carefully organized collections
                </p>
              </div>
            </FadeIn>

            <StaggerChildren className="grid grid-cols-3 gap-6">
              {categories.slice(0, 6).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  <Link href={`/products?category=${cat.slug}`}>
                    <div className="category-card" id={`category-${cat.slug}`}>
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(135deg, hsl(${30 + i * 20}, 30%, 25%) 0%, hsl(${30 + i * 20}, 40%, 45%) 100%)`,
                        }} />
                      )}
                      <div className="category-card-overlay">
                        <h3 className="category-card-name">{cat.name}</h3>
                        <span className="category-card-count">
                          {cat.product_count || 0} Products
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <section className="section" id="promo-section">
        <div className="container">
          <FadeIn>
            <div className="promo-banner">
              <div className="promo-banner-bg">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1A1612 0%, #3D3225 40%, #725A38 70%, #8B6F47 100%)',
                }} />
              </div>
              <div className="promo-banner-content">
                <p className="hero-eyebrow" style={{ color: 'var(--color-accent-light)' }}>
                  Limited Time Offer
                </p>
                <h3 className="promo-banner-title">
                  Exclusive Collection Available Now
                </h3>
                <p className="promo-banner-desc">
                  Discover our latest arrivals with special introductory pricing. Premium quality you can feel.
                </p>
                <Link href="/products" className="btn btn-primary" style={{ background: '#fff', color: '#1A1612' }}>
                  Shop the Collection
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="section" style={{ background: 'var(--color-bg-alt)' }} id="reviews-section">
          <div className="container">
            <FadeIn>
              <div className="section-header">
                <p className="section-eyebrow">What People Say</p>
                <h2 className="section-title">Customer Reviews</h2>
                <p className="section-desc">
                  Hear from those who have experienced our products
                </p>
              </div>
            </FadeIn>

            <StaggerChildren className="grid grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div
                  key={review.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  <div className="review-card" id={`review-${review.id}`}>
                    <div className="review-card-stars">
                      {Array.from({ length: 5 }, (_, j) => (
                        <span key={j} style={{ opacity: j < review.rating ? 1 : 0.3 }}>
                          ★
                        </span>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="review-card-text">&ldquo;{review.comment}&rdquo;</p>
                    )}
                    <p className="review-card-author">{review.customer_name}</p>
                  </div>
                </motion.div>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* Empty State Message */}
      {displayProducts.length === 0 && categories.length === 0 && (
        <section className="section">
          <div className="container">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3 className="empty-state-title">Store is Being Set Up</h3>
              <p className="empty-state-desc">
                Products and categories will appear here once the store admin adds them through the dashboard.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
