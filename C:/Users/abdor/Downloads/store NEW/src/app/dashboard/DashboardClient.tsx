'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdmin } from '@/hooks/useAdmin';
import { getProducts, createProduct, updateProduct, deleteProduct, toggleProductActive, toggleProductFeatured } from '@/lib/actions/products';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/actions/categories';
import { getSettings, updateSettings } from '@/lib/actions/settings';
import { getAllReviews, createReview, approveReview, deleteReview } from '@/lib/actions/reviews';
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/lib/actions/banners';
import { uploadImage, addProductImage, removeProductImage } from '@/lib/actions/upload';
import { formatPrice } from '@/lib/utils';
import type { Product, Category, SiteSettings, Review, Banner } from '@/types';

type Tab = 'overview' | 'products' | 'categories' | 'settings' | 'reviews' | 'banners';

export default function DashboardClient() {
  const { logout } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | Category | Banner | null>(null);

  // Upload states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, s, r, b] = await Promise.all([
        getProducts({ activeOnly: false }),
        getCategories(false),
        getSettings(),
        getAllReviews(),
        getBanners(false),
      ]);
      setProducts(p);
      setCategories(c);
      setSettings(s);
      setReviews(r);
      setBanners(b);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ─── File Upload Handler ───────────────────────────
  const handleFileUpload = async (files: FileList) => {
    setUploadingImages(true);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append('file', files[i]);
      const result = await uploadImage(fd);
      if ('url' in result) {
        urls.push(result.url);
      }
    }
    setProductImages(prev => [...prev, ...urls]);
    setUploadingImages(false);
    return urls;
  };

  // ─── Product Handlers ─────────────────────────────
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    let result;
    if (editItem && 'price' in editItem) {
      result = await updateProduct(editItem.id, fd);
    } else {
      result = await createProduct(fd);
      if (result && 'data' in result && result.data && productImages.length > 0) {
        for (let i = 0; i < productImages.length; i++) {
          await addProductImage(result.data.id, productImages[i], i === 0, i);
        }
      }
    }

    if (result && 'error' in result) {
      showToast(result.error as string, 'error');
    } else {
      showToast(editItem ? 'Product updated' : 'Product created');
      setShowProductModal(false);
      setEditItem(null);
      setProductImages([]);
      await loadData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const result = await deleteProduct(id);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Product deleted');
      await loadData();
    }
  };

  // ─── Category Handlers ────────────────────────────
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    let result;
    if (editItem && 'slug' in editItem && !('price' in editItem)) {
      result = await updateCategory(editItem.id, fd);
    } else {
      result = await createCategory(fd);
    }

    if (result && 'error' in result) {
      showToast(result.error as string, 'error');
    } else {
      showToast(editItem ? 'Category updated' : 'Category created');
      setShowCategoryModal(false);
      setEditItem(null);
      await loadData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const result = await deleteCategory(id);
    if (result.error) showToast(result.error, 'error');
    else { showToast('Category deleted'); await loadData(); }
  };

  // ─── Settings Handler ─────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = await updateSettings(fd);
    if (result && 'error' in result) {
      showToast(result.error as string, 'error');
    } else {
      showToast('Settings saved');
      await loadData();
    }
  };

  // ─── Review Handlers ──────────────────────────────
  const handleApproveReview = async (id: string, approved: boolean) => {
    await approveReview(id, approved);
    showToast(approved ? 'Review approved' : 'Review hidden');
    await loadData();
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await deleteReview(id);
    showToast('Review deleted');
    await loadData();
  };

  const handleSaveReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = await createReview(fd);
    if (result && 'error' in result) {
      showToast(result.error as string, 'error');
    } else {
      showToast('Review added');
      setShowReviewModal(false);
      await loadData();
    }
  };

  // ─── Banner Handlers ──────────────────────────────
  const handleSaveBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    let result;
    if (editItem && 'title' in editItem && !('price' in editItem) && !('slug' in editItem)) {
      result = await updateBanner(editItem.id, fd);
    } else {
      result = await createBanner(fd);
    }
    if (result && 'error' in result) {
      showToast(result.error as string, 'error');
    } else {
      showToast(editItem ? 'Banner updated' : 'Banner created');
      setShowBannerModal(false);
      setEditItem(null);
      await loadData();
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await deleteBanner(id);
    showToast('Banner deleted');
    await loadData();
  };

  // ─── Image Management for existing products ──────
  const handleAddImagesToProduct = async (productId: string, files: FileList) => {
    const urls = await handleFileUpload(files);
    for (let i = 0; i < urls.length; i++) {
      await addProductImage(productId, urls[i], false, i);
    }
    await loadData();
    showToast('Images added');
  };

  const handleRemoveProductImage = async (imageId: string) => {
    await removeProductImage(imageId);
    await loadData();
    showToast('Image removed');
  };

  // ─── Nav Items ────────────────────────────────────
  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'overview', label: 'Overview',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    {
      key: 'products', label: 'Products',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    },
    {
      key: 'categories', label: 'Categories',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
    },
    {
      key: 'reviews', label: 'Reviews',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    },
    {
      key: 'banners', label: 'Banners',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    },
    {
      key: 'settings', label: 'Settings',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    },
  ];

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="admin-layout" id="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar" id="admin-sidebar">
        <div className="admin-sidebar-logo">
          {settings?.store_name || 'Store'} Admin
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveTab(item.key)}
              id={`nav-${item.key}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border-light)' }}>
          <button className="admin-nav-item" onClick={() => router.push('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            View Store
          </button>
          <button className="admin-nav-item" onClick={handleLogout} style={{ color: 'var(--color-error)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Dashboard Overview</h1>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-label">Total Products</div>
                <div className="stat-card-value">{products.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Active Products</div>
                <div className="stat-card-value">{products.filter(p => p.is_active).length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Categories</div>
                <div className="stat-card-value">{categories.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Reviews</div>
                <div className="stat-card-value">{reviews.length}</div>
              </div>
            </div>

            <div className="data-table-wrapper">
              <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Recent Products</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product-cell">
                          <div className="table-product-thumb">
                            {p.images?.[0] ? (
                              <Image src={p.images[0].image_url} alt={p.name} width={44} height={44} style={{ objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-alt)' }} />
                            )}
                          </div>
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{formatPrice(p.price, settings?.currency_symbol)}</td>
                      <td>{p.stock_quantity}</td>
                      <td>
                        <span className={`badge ${p.is_active ? 'badge-new' : 'badge-limited'}`}>
                          {p.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>No products yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ PRODUCTS TAB ═══ */}
        {activeTab === 'products' && (
          <>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Products ({products.length})</h1>
              <button className="btn btn-primary" onClick={() => { setEditItem(null); setProductImages([]); setShowProductModal(true); }} id="add-product-btn">
                + Add Product
              </button>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Featured</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-product-cell">
                          <div className="table-product-thumb">
                            {p.images?.[0] ? (
                              <Image src={p.images[0].image_url} alt={p.name} width={44} height={44} style={{ objectFit: 'cover' }} />
                            ) : <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-alt)' }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                            {p.badge_text && <span className="badge badge-sale" style={{ marginTop: '2px', fontSize: '10px' }}>{p.badge_text}</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{p.category?.name || '—'}</td>
                      <td>
                        {formatPrice(p.price, settings?.currency_symbol)}
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                            {formatPrice(p.compare_at_price, settings?.currency_symbol)}
                          </span>
                        )}
                      </td>
                      <td>{p.stock_quantity}</td>
                      <td>
                        <button
                          className={`toggle ${p.is_featured ? 'active' : ''}`}
                          onClick={() => toggleProductFeatured(p.id, !p.is_featured).then(loadData)}
                        />
                      </td>
                      <td>
                        <button
                          className={`toggle ${p.is_active ? 'active' : ''}`}
                          onClick={() => toggleProductActive(p.id, !p.is_active).then(loadData)}
                        />
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action-btn" title="Edit" onClick={() => { setEditItem(p); setProductImages([]); setShowProductModal(true); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <label className="table-action-btn" title="Add Images" style={{ cursor: 'pointer' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files && handleAddImagesToProduct(p.id, e.target.files)} />
                          </label>
                          <button className="table-action-btn danger" title="Delete" onClick={() => handleDeleteProduct(p.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12)' }}>No products yet. Click "Add Product" to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Product Images Preview for each product */}
            {products.filter(p => p.images && p.images.length > 0).length > 0 && (
              <div style={{ marginTop: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Product Images</h3>
                {products.filter(p => p.images && p.images.length > 0).map(p => (
                  <div key={p.id} style={{ marginBottom: 'var(--space-6)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{p.name}</p>
                    <div className="uploaded-images">
                      {p.images?.map(img => (
                        <div key={img.id} className="uploaded-image">
                          <Image src={img.image_url} alt={img.alt_text || ''} width={100} height={100} style={{ objectFit: 'cover' }} />
                          <button className="uploaded-image-remove" onClick={() => handleRemoveProductImage(img.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ CATEGORIES TAB ═══ */}
        {activeTab === 'categories' && (
          <>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Categories ({categories.length})</h1>
              <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowCategoryModal(true); }}>
                + Add Category
              </button>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Slug</th><th>Products</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{c.slug}</td>
                      <td>{c.product_count || 0}</td>
                      <td><span className={`badge ${c.is_active ? 'badge-new' : 'badge-limited'}`}>{c.is_active ? 'Active' : 'Hidden'}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action-btn" onClick={() => { setEditItem(c); setShowCategoryModal(true); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="table-action-btn danger" onClick={() => handleDeleteCategory(c.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12)' }}>No categories yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ REVIEWS TAB ═══ */}
        {activeTab === 'reviews' && (
          <>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Reviews ({reviews.length})</h1>
              <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>
                + Add Review
              </button>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.customer_name}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{((r as unknown as { product?: { name: string } }).product?.name) || '—'}</td>
                      <td style={{ color: 'var(--color-accent-light)' }}>{'★'.repeat(r.rating)}<span style={{ opacity: 0.3 }}>{'★'.repeat(5 - r.rating)}</span></td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment || '—'}</td>
                      <td>
                        <button className={`toggle ${r.is_approved ? 'active' : ''}`} onClick={() => handleApproveReview(r.id, !r.is_approved)} />
                      </td>
                      <td>
                        <button className="table-action-btn danger" onClick={() => handleDeleteReview(r.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12)' }}>No reviews yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ BANNERS TAB ═══ */}
        {activeTab === 'banners' && (
          <>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Banners ({banners.length})</h1>
              <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowBannerModal(true); }}>
                + Add Banner
              </button>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Title</th><th>Subtitle</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {banners.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 500 }}>{b.title}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{b.subtitle || '—'}</td>
                      <td><span className={`badge ${b.is_active ? 'badge-new' : 'badge-limited'}`}>{b.is_active ? 'Active' : 'Hidden'}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action-btn" onClick={() => { setEditItem(b); setShowBannerModal(true); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="table-action-btn danger" onClick={() => handleDeleteBanner(b.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {banners.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-12)' }}>No banners yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && settings && (
          <>
            <div className="admin-page-header">
              <h1 className="admin-page-title">Store Settings</h1>
            </div>
            <div className="card" style={{ maxWidth: '720px' }}>
              <div className="card-body">
                <form onSubmit={handleSaveSettings}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>General</h3>
                  <div className="input-group">
                    <label className="input-label">Store Name</label>
                    <input name="store_name" className="input-field" defaultValue={settings.store_name} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Store Description</label>
                    <textarea name="store_description" className="textarea" defaultValue={settings.store_description || ''} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="input-group">
                      <label className="input-label">Currency</label>
                      <input name="currency" className="input-field" defaultValue={settings.currency} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Currency Symbol</label>
                      <input name="currency_symbol" className="input-field" defaultValue={settings.currency_symbol} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Announcement Text</label>
                    <input name="announcement_text" className="input-field" defaultValue={settings.announcement_text} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Logo URL</label>
                    <input name="logo_url" className="input-field" defaultValue={settings.logo_url || ''} placeholder="https://..." />
                  </div>

                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-6)', marginTop: 'var(--space-8)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>Hero Section</h3>
                  <div className="input-group">
                    <label className="input-label">Hero Title</label>
                    <input name="hero_title" className="input-field" defaultValue={settings.hero_title} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Hero Subtitle</label>
                    <textarea name="hero_subtitle" className="textarea" defaultValue={settings.hero_subtitle || ''} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Hero Image URL</label>
                    <input name="hero_image_url" className="input-field" defaultValue={settings.hero_image_url || ''} placeholder="https://..." />
                  </div>

                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-6)', marginTop: 'var(--space-8)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>Social Media Links</h3>
                  <div className="input-group">
                    <label className="input-label">Instagram URL</label>
                    <input name="instagram_url" className="input-field" defaultValue={settings.instagram_url} placeholder="https://instagram.com/..." />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Facebook URL</label>
                    <input name="facebook_url" className="input-field" defaultValue={settings.facebook_url} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Twitter / X URL</label>
                    <input name="twitter_url" className="input-field" defaultValue={settings.twitter_url} placeholder="https://x.com/..." />
                  </div>
                  <div className="input-group">
                    <label className="input-label">TikTok URL</label>
                    <input name="tiktok_url" className="input-field" defaultValue={settings.tiktok_url} placeholder="https://tiktok.com/..." />
                  </div>
                  <div className="input-group">
                    <label className="input-label">WhatsApp URL</label>
                    <input name="whatsapp_url" className="input-field" defaultValue={settings.whatsapp_url} placeholder="https://wa.me/..." />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} id="save-settings-btn">
                    Save Settings
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ PRODUCT MODAL ═══ */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => { setShowProductModal(false); setEditItem(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
              {editItem ? 'Edit Product' : 'New Product'}
            </h3>
            <form onSubmit={handleSaveProduct}>
              <div className="input-group">
                <label className="input-label">Product Name *</label>
                <input name="name" className="input-field" defaultValue={editItem && 'name' in editItem ? editItem.name : ''} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea name="description" className="textarea" defaultValue={editItem && 'description' in editItem ? editItem.description || '' : ''} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label className="input-label">Price *</label>
                  <input name="price" type="number" step="0.01" className="input-field" defaultValue={editItem && 'price' in editItem ? editItem.price : ''} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Compare at Price</label>
                  <input name="compare_at_price" type="number" step="0.01" className="input-field" defaultValue={editItem && 'compare_at_price' in editItem ? editItem.compare_at_price || '' : ''} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select name="category_id" className="input-field" defaultValue={editItem && 'category_id' in editItem ? editItem.category_id || '' : ''}>
                    <option value="">None</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Stock Quantity</label>
                  <input name="stock_quantity" type="number" className="input-field" defaultValue={editItem && 'stock_quantity' in editItem ? editItem.stock_quantity : 0} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="input-group">
                  <label className="input-label">Badge Text</label>
                  <input name="badge_text" className="input-field" defaultValue={editItem && 'badge_text' in editItem ? editItem.badge_text || '' : ''} placeholder="New, Hot, Sale..." />
                </div>
                <div className="input-group">
                  <label className="input-label">Featured</label>
                  <select name="is_featured" className="input-field" defaultValue={editItem && 'is_featured' in editItem && editItem.is_featured ? 'true' : 'false'}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Active</label>
                  <select name="is_active" className="input-field" defaultValue={editItem && 'is_active' in editItem && editItem.is_active === false ? 'false' : 'true'}>
                    <option value="true">Active</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
              </div>

              {/* Image Upload (for new products only) */}
              {!editItem && (
                <div className="input-group">
                  <label className="input-label">Product Images</label>
                  <label className="image-uploader">
                    <div className="image-uploader-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div className="image-uploader-text">Click to upload images</div>
                    <div className="image-uploader-hint">PNG, JPG, WebP up to 5MB</div>
                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files && handleFileUpload(e.target.files)} />
                  </label>
                  {uploadingImages && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', marginTop: 'var(--space-2)' }}>Uploading...</p>}
                  {productImages.length > 0 && (
                    <div className="uploaded-images">
                      {productImages.map((url, i) => (
                        <div key={i} className="uploaded-image">
                          <Image src={url} alt="" width={100} height={100} style={{ objectFit: 'cover' }} />
                          <button type="button" className="uploaded-image-remove" onClick={() => setProductImages(prev => prev.filter((_, j) => j !== i))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowProductModal(false); setEditItem(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-product-btn">
                  {editItem ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CATEGORY MODAL ═══ */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => { setShowCategoryModal(false); setEditItem(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
              {editItem ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleSaveCategory}>
              <div className="input-group">
                <label className="input-label">Category Name *</label>
                <input name="name" className="input-field" defaultValue={editItem && 'name' in editItem ? editItem.name : ''} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea name="description" className="textarea" defaultValue={editItem && 'description' in editItem ? editItem.description || '' : ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Image URL</label>
                <input name="image_url" className="input-field" defaultValue={editItem && 'image_url' in editItem ? editItem.image_url || '' : ''} placeholder="https://..." />
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select name="is_active" className="input-field" defaultValue={editItem && 'is_active' in editItem && editItem.is_active === false ? 'false' : 'true'}>
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCategoryModal(false); setEditItem(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ REVIEW MODAL ═══ */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Add Review</h3>
            <form onSubmit={handleSaveReview}>
              <div className="input-group">
                <label className="input-label">Product *</label>
                <select name="product_id" className="input-field" required>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Customer Name *</label>
                <input name="customer_name" className="input-field" required />
              </div>
              <div className="input-group">
                <label className="input-label">Rating *</label>
                <select name="rating" className="input-field" required>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Comment</label>
                <textarea name="comment" className="textarea" />
              </div>
              <div className="input-group">
                <label className="input-label">Approved</label>
                <select name="is_approved" className="input-field">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ BANNER MODAL ═══ */}
      {showBannerModal && (
        <div className="modal-overlay" onClick={() => { setShowBannerModal(false); setEditItem(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
              {editItem ? 'Edit Banner' : 'New Banner'}
            </h3>
            <form onSubmit={handleSaveBanner}>
              <div className="input-group">
                <label className="input-label">Title *</label>
                <input name="title" className="input-field" defaultValue={editItem && 'title' in editItem ? editItem.title : ''} required />
              </div>
              <div className="input-group">
                <label className="input-label">Subtitle</label>
                <input name="subtitle" className="input-field" defaultValue={editItem && 'subtitle' in editItem ? editItem.subtitle || '' : ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Image URL</label>
                <input name="image_url" className="input-field" defaultValue={editItem && 'image_url' in editItem ? editItem.image_url || '' : ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Link URL</label>
                <input name="link_url" className="input-field" defaultValue={editItem && 'link_url' in editItem ? editItem.link_url || '' : ''} />
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select name="is_active" className="input-field" defaultValue={editItem && 'is_active' in editItem && editItem.is_active === false ? 'false' : 'true'}>
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowBannerModal(false); setEditItem(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
