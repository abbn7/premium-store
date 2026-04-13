'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
  index?: number;
}

export default function ProductCard({ product, currencySymbol = '$', index = 0 }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const secondImage = product.images?.[1];
  const discount = product.compare_at_price 
    ? calculateDiscount(product.price, product.compare_at_price) 
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(rating) ? '' : 'empty'}`}>
        ★
      </span>
    ));
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            delay: index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className="product-card"
      id={`product-card-${product.slug}`}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="product-card-image">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                fill
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{ objectFit: 'cover' }}
              />
              {secondImage && (
                <Image
                  src={secondImage.image_url}
                  alt={secondImage.alt_text || product.name}
                  fill
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ 
                    objectFit: 'cover', 
                    opacity: 0, 
                    transition: 'opacity 0.4s ease' 
                  }}
                  className="product-card-hover-image"
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0'; }}
                />
              )}
            </>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)'
            }}>
              No Image
            </div>
          )}

          <div className="product-card-badges">
            {product.badge_text && (
              <span className={`badge ${
                product.badge_text.toLowerCase() === 'sale' ? 'badge-sale' :
                product.badge_text.toLowerCase() === 'new' ? 'badge-new' :
                product.badge_text.toLowerCase() === 'hot' ? 'badge-hot' :
                'badge-limited'
              }`}>
                {product.badge_text}
              </span>
            )}
            {discount > 0 && !product.badge_text && (
              <span className="badge badge-sale">-{discount}%</span>
            )}
          </div>
        </div>
      </Link>

      <div className="product-card-info">
        {product.category && (
          <span className="product-card-category">{product.category.name}</span>
        )}

        {product.review_count && product.review_count > 0 ? (
          <div className="product-card-rating">
            {renderStars(product.avg_rating || 0)}
            <span className="count">({product.review_count})</span>
          </div>
        ) : null}

        <h3 className="product-card-name">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="product-card-price">
          <span className="current-price">{formatPrice(product.price, currencySymbol)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <>
              <span className="original-price">{formatPrice(product.compare_at_price, currencySymbol)}</span>
              <span className="discount-pct">-{discount}%</span>
            </>
          )}
        </div>

        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <p style={{ 
            fontSize: 'var(--text-xs)', 
            color: 'var(--color-warning)', 
            marginTop: 'var(--space-2)',
            fontWeight: 500
          }}>
            Only {product.stock_quantity} left in stock
          </p>
        )}
      </div>
    </motion.div>
  );
}
