import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  onOpenPlanVisit: () => void;
  announcementText?: string;
  isActive?: boolean;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onOpenPlanVisit,
  announcementText,
  isActive = true
}) => {
  if (!isActive) return null;

  const text = announcementText || 'Welcome to FGC Mushin DHQ • Sunday Celebration Services at 7:30 AM & 9:30 AM';
  return (
    <div
      onClick={onOpenPlanVisit}
      className="announcement-bar-wrap"
      style={{
        background: 'linear-gradient(90deg, #1E4E85 0%, #2866AD 50%, #A32371 100%)',
        color: '#FFFFFF',
        padding: '0.5rem 1rem',
        fontSize: '0.825rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem 0.75rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 50,
        letterSpacing: '0.01em',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
        <Sparkles size={14} style={{ color: '#F3A645', flexShrink: 0 }} />
        <span>{text}</span>
      </div>
      <span
        className="announcement-cta-desktop"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#F3A645',
          fontWeight: 700,
          textDecoration: 'underline',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        <span>Plan Your Sunday Visit</span>
        <ArrowRight size={13} />
      </span>

      <style>{`
        @media (max-width: 640px) {
          .announcement-cta-desktop {
            display: none !important;
          }
          .announcement-bar-wrap {
            padding: 0.45rem 0.75rem !important;
            font-size: 0.775rem !important;
          }
        }
      `}</style>
    </div>
  );
};
