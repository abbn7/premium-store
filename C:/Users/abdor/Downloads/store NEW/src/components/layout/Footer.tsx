'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import type { SiteSettings } from '@/types';

interface FooterProps {
  settings: SiteSettings | null;
}

export default function Footer({ settings }: FooterProps) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdmin();
  const router = useRouter();

  const storeName = settings?.store_name || 'Store';
  const storeDesc = settings?.store_description || 'Premium products for those who appreciate quality.';

  const handleAdminLogin = () => {
    if (login(adminEmail)) {
      setShowAdminModal(false);
      setAdminEmail('');
      setError('');
      router.push('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <>
      <footer className="footer" id="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-name">{storeName}</div>
              <p className="footer-brand-desc">{storeDesc}</p>
              <div className="footer-social">
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" id="social-instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                )}
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" id="social-facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                )}
                {settings?.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter" id="social-twitter">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                    </svg>
                  </a>
                )}
                {settings?.tiktok_url && (
                  <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok" id="social-tiktok">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                    </svg>
                  </a>
                )}
                {settings?.whatsapp_url && (
                  <a href={settings.whatsapp_url} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" id="social-whatsapp">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Quick Links</h4>
              <nav className="footer-links">
                <Link href="/">Home</Link>
                <Link href="/products">All Products</Link>
                <Link href="/products?featured=true">Featured</Link>
              </nav>
            </div>

            <div>
              <h4 className="footer-heading">Support</h4>
              <nav className="footer-links">
                <Link href="/products">Browse Products</Link>
                <a href={settings?.whatsapp_url || '#'} target="_blank" rel="noopener noreferrer">Contact Us</a>
              </nav>
            </div>

            <div>
              <h4 className="footer-heading">Policies</h4>
              <nav className="footer-links">
                <span style={{ cursor: 'default' }}>Shipping Info</span>
                <span style={{ cursor: 'default' }}>Return Policy</span>
                <span style={{ cursor: 'default' }}>Privacy Policy</span>
              </nav>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</span>
            <span className="footer-dev-credit">
              Developed by{' '}
              <a href="https://wa.me/message/64L5CHSAIA2DA1" target="_blank" rel="noopener noreferrer">
                abdelhaned nada
              </a>
              <button
                className="admin-secret-btn"
                onClick={() => setShowAdminModal(true)}
                aria-label="."
                id="admin-secret-trigger"
                style={{ marginLeft: '6px' }}
              />
            </span>
          </div>
        </div>
      </footer>

      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
              Access Required
            </h3>
            <div className="input-group">
              <label className="input-label">Enter credentials</label>
              <input
                type="text"
                className="input-field"
                value={adminEmail}
                onChange={(e) => { setAdminEmail(e.target.value); setError(''); }}
                placeholder="Enter admin email"
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                autoFocus
                id="admin-email-input"
              />
              {error && (
                <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdminModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleAdminLogin} id="admin-login-btn">
                Access
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
