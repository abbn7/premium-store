'use client';

import FadeIn from '@/components/animations/FadeIn';

export default function Newsletter() {
  return (
    <section className="newsletter-section" id="newsletter-section">
      <div className="container">
        <FadeIn>
          <div className="newsletter-inner">
            <div className="section-eyebrow">Stay in Touch</div>
            <h2 className="section-title" style={{ fontSize: 'var(--text-3xl)' }}>
              Get Exclusive Updates
            </h2>
            <p className="section-desc">
              Be the first to know about new arrivals, exclusive offers, and special promotions.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                className="input-field"
                placeholder="Enter your email"
                id="newsletter-email"
              />
              <button className="btn btn-primary" id="newsletter-submit">
                Subscribe
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
