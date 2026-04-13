import type { SiteSettings } from '@/types';

interface AnnouncementBarProps {
  settings: SiteSettings | null;
}

export default function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const text = settings?.announcement_text;
  if (!text) return null;

  return (
    <div className="announcement-bar" id="announcement-bar">
      {text}
    </div>
  );
}
