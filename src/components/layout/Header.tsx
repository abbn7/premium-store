'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import type { SiteSettings } from '@/types';
import { useCart } from '@/hooks/useCart';

interface HeaderProps {
  settings: SiteSettings | null;
}

export default function Header({ settings }: HeaderProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const storeName = settings?.store_name || 'Store';

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} id="main-header">
      <div className="container">
        <div className="header-inner">
          <Link href="/" className="header-logo" id="header-logo">
            {storeName}
          </Link>

          <nav className="header-nav" id="main-nav">
            <Link href="/">Home</Link>
            <Link href="/products">Shop</Link>
            <Link href="/products?featured=true">Featured</Link>
          </nav>

          <div className="header-actions">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Open cart"
            >
              <span className="text-xl">🛒</span>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalItems}
                </span>
              )}
            </button>
            <ThemeToggle />
            <button
              className={`mobile-menu-btn ${mobileOpen ? 'active' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} id="mobile-menu">
        <Link href="/" onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/products" onClick={() => setMobileOpen(false)}>Shop</Link>
        <Link href="/products?featured=true" onClick={() => setMobileOpen(false)}>Featured</Link>
      </div>
    </header>
  );
}
