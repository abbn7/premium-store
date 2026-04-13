import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state-icon" style={{ fontSize: 'var(--text-7xl)', marginBottom: 'var(--space-4)' }}>
        404
      </div>
      <h1 className="empty-state-title">Page Not Found</h1>
      <p className="empty-state-desc">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
        Go Home
      </Link>
    </div>
  );
}
