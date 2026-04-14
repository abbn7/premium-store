'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, calculateDiscount, getStockStatus } from '@/lib/utils';
import FadeIn from '@/components/animations/FadeIn';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';

interface ProductDetailClientProps {
  product: Product;
  currencySymbol: string;
  whatsappUrl: string;
}

export default function ProductDetailClient({ product, currencySymbol, whatsappUrl }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const images = product.images || [];
  const discount = product.compare_at_price
    ? calculateDiscount(product.price, product.compare_at_price)
    : 0;
  const stock = getStockStatus(product.stock_quantity);
  const currentImage = images[selectedImage];

  const handleBuyNow = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in purchasing: ${product.name} (${formatPrice(product.price, currencySymbol)})`
    );
    const url = whatsappUrl || `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? 'var(--color-accent-light)' : 'var(--color-border)', fontSize: 'var(--text-lg)' }}>
        ★
      </span>
    ));
  };

  return (
    <div className="container">
      <div className="product-detail" id="product-detail">
        {/* Gallery */}
        <FadeIn direction="left">
          <div className="product-gallery">
            {images.length > 1 && (
              <div className="product-gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    className={`product-gallery-thumb ${i === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                    id={`thumb-${i}`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      width={72}
                      height={90}
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="product-gallery-main">
              <AnimatePresence mode="wait">
                {currentImage ? (
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                  >
                    <Image
                      src={currentImage.image_url}
                      alt={currentImage.alt_text || product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                      priority
                    />
                  </motion.div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                  }}>
                    No Image Available
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>

        {/* Info */}
        <FadeIn direction="right" delay={0.1}>
          <div className="product-info">
            <div className="product-info-breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <Link href="/products">Products</Link>
              {product.category && (
                <>
                  <span>/</span>
                  <Link href={`/products?category=${product.category.slug}`}>
                    {product.category.name}
                  </Link>
                </>
              )}
            </div>

            {product.badge_text && (
              <span className={`badge ${
                product.badge_text.toLowerCase() === 'sale' ? 'badge-sale' :
                product.badge_text.toLowerCase() === 'new' ? 'badge-new' :
                'badge-limited'
              }`} style={{ marginBottom: 'var(--space-4)', alignSelf: 'flex-start' }}>
                {product.badge_text}
              </span>
            )}

            <h1 className="product-info-name">{product.name}</h1>

            {product.review_count && product.review_count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {renderStars(product.avg_rating || 0)}
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  ({product.review_count} review{product.review_count !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <div className="product-info-price">
              <span className="price">{formatPrice(product.price, currencySymbol)}</span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="original">{formatPrice(product.compare_at_price, currencySymbol)}</span>
                  <span className="discount">-{discount}% OFF</span>
                </>
              )}
            </div>

            <div className="product-info-stock">
              <span className={`dot ${stock.class}`} />
              <span style={{ color: stock.class === 'in-stock' ? 'var(--color-success)' : stock.class === 'low-stock' ? 'var(--color-warning)' : 'var(--color-error)' }}>
                {stock.label}
              </span>
            </div>

            {product.description && (
              <p className="product-info-desc">{product.description}</p>
            )}

            <div className="product-actions" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: 'var(--space-2) var(--space-4)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >-</button>
                  <span style={{ padding: '0 var(--space-2)', minWidth: '2rem', textAlign: 'center' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    style={{ padding: 'var(--space-2) var(--space-4)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >+</button>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => addItem(product, quantity)}
                  disabled={product.stock_quantity <= 0}
                  style={{ flex: 1 }}
                >
                  Add to Cart
                </button>
              </div>
              <button
                className="btn btn-secondary btn-lg"
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                id="buy-now-btn"
              >
                Buy on WhatsApp
              </button>
            </div>

            {/* Product Features */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 'var(--space-4)',
              paddingTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-border)',
            }}>
              {[
                { icon: '📦', text: 'Free Shipping' },
                { icon: '🔄', text: 'Easy Returns' },
                { icon: '🔒', text: 'Secure Checkout' },
                { icon: '⭐', text: 'Premium Quality' },
              ].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="section" id="product-reviews">
          <FadeIn>
            <div className="section-header">
              <p className="section-eyebrow">Customer Feedback</p>
              <h2 className="section-title" style={{ fontSize: 'var(--text-3xl)' }}>
                Reviews ({product.reviews.length})
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-3 gap-6">
            {product.reviews.map((review, i) => (
              <FadeIn key={review.id} delay={i * 0.1}>
                <div className="review-card">
                  <div className="review-card-stars">
                    {Array.from({ length: 5 }, (_, j) => (
                      <span key={j} style={{ opacity: j < review.rating ? 1 : 0.3 }}>★</span>
                    ))}
                  </div>
                  {review.comment && (
                    <p className="review-card-text">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  <p className="review-card-author">{review.customer_name}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
