import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getSettings } from '@/lib/actions/settings';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const storeName = settings?.store_name || 'Store';
  
  return {
    title: {
      default: `${storeName} — Premium Products`,
      template: `%s | ${storeName}`,
    },
    description: settings?.store_description || 'Discover our curated collection of premium products.',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AnnouncementBar settings={settings} />
        <Header settings={settings} />
        <main>{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
