import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  onOpenPlanVisit: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onOpenPlanVisit }) => {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #005F68 0%, #008793 50%, #1A56DB 100%)',
      color: '#FFFFFF',
      padding: '0.55rem 1rem',
      fontSize: '0.825rem',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      position: 'relative',
      zIndex: 50,
      letterSpacing: '0.01em'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Sparkles size={14} style={{ color: '#FFE082' }} />
        <span>Night to Shine Volunteer & Guest Registration Is Now Open!</span>
      </div>
      <button 
        onClick={onOpenPlanVisit}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#FFE082',
          fontWeight: 700,
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: '4px'
        }}
      >
        <span>Plan Your Sunday Visit</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};
