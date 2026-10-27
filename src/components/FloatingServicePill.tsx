import React, { useState } from 'react';
import { Clock, MapPin, X, ChevronUp, ArrowUpRight } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';

interface FloatingServicePillProps {
  onOpenPlanVisit: () => void;
}

export const FloatingServicePill: React.FC<FloatingServicePillProps> = ({ onOpenPlanVisit }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  return (
    <aside
      aria-label="Service times and quick directions"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 45,
        maxWidth: isMinimized ? 'auto' : '360px',
        width: 'calc(100vw - 2.5rem)',
        pointerEvents: 'none'
      }}
    >
      <div
        className="double-bezel"
        style={{
          pointerEvents: 'auto',
          background: 'rgba(10, 14, 20, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(0, 135, 147, 0.4)',
          boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div className="double-bezel-inner" style={{ padding: isMinimized ? '0.65rem 1rem' : '1.25rem', background: '#0C1017' }}>
          {isMinimized ? (
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', cursor: 'pointer' }}
              onClick={() => setIsMinimized(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E5FF' }}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>Sunday Gatherings: 9 & 11:15 AM</span>
              </div>
              <ChevronUp size={16} color="var(--accent-teal-light)" />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-teal-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal-light)' }}>
                    <Clock size={12} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-teal-light)' }}>
                    Join Us This Sunday
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={() => setIsMinimized(true)}
                    title="Minimize"
                    style={{ color: 'var(--text-muted)', padding: '2px' }}
                  >
                    —
                  </button>
                  <button
                    onClick={() => setIsClosed(true)}
                    title="Close"
                    style={{ color: 'var(--text-muted)', padding: '2px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.25rem' }}>
                9:00 AM & 11:15 AM
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '1rem' }}>
                <MapPin size={13} color="var(--accent-teal)" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{CHURCH_INFO.address}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={onOpenPlanVisit}
                  className="btn-island btn-teal"
                  style={{ flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.825rem', justifyContent: 'center' }}
                >
                  <span>Plan Visit</span>
                  <div className="btn-icon-bubble" style={{ width: '22px', height: '22px' }}>
                    <ArrowUpRight size={12} />
                  </div>
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_INFO.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-island btn-ghost"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.825rem' }}
                >
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
