'use client';

import { motion } from 'framer-motion';
import FadeIn from '@/components/animations/FadeIn';
import type { SiteSettings } from '@/types';

interface HeroSectionProps {
  settings: SiteSettings | null;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const title = settings?.hero_title || 'Elevate Your Style';
  const subtitle = settings?.hero_subtitle || 'Discover our curated collection of premium products designed for those who appreciate quality and craftsmanship.';
  const heroImage = settings?.hero_image_url;

  return (
    <section className="hero" id="hero-section">
      <div className="hero-bg">
        {heroImage ? (
          <img src={heroImage} alt="Hero" />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1A1612 0%, #3D3225 40%, #8B6F47 80%, #C4A67D 100%)',
          }} />
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: heroImage 
            ? 'linear-gradient(135deg, rgba(26,22,18,0.65) 0%, rgba(26,22,18,0.25) 50%, rgba(26,22,18,0.4) 100%)'
            : 'none'
        }} />
      </div>
      
      <div className="container">
        <div className="hero-content">
          <FadeIn delay={0.1} direction="none">
            <motion.p 
              className="hero-eyebrow"
              initial={{ opacity: 0, letterSpacing: '0.3em' }}
              animate={{ opacity: 1, letterSpacing: '0.12em' }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              Premium Collection
            </motion.p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <h1 className="hero-title">{title}</h1>
          </FadeIn>

          <FadeIn delay={0.5}>
            <p className="hero-desc">{subtitle}</p>
          </FadeIn>

          <FadeIn delay={0.7}>
            <div className="hero-actions">
              <a href="/products" className="btn btn-primary btn-lg">
                Shop Now
              </a>
              <a href="/products?featured=true" className="btn btn-secondary btn-lg">
                View Featured
              </a>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Subtle scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255,255,255,0.5)',
          zIndex: 1,
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </motion.div>
    </section>
  );
}
