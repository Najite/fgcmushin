import React, { useState } from 'react';
import { Clock, MapPin, X, ChevronUp, ArrowUpRight, Minus } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';

interface FloatingServicePillProps {
  onOpenPlanVisit: () => void;
}

export const FloatingServicePill: React.FC<FloatingServicePillProps> = ({ onOpenPlanVisit }) => {
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  return (
    <aside
      aria-label="Service times and quick directions"
      className="floating-pill-wrap"
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
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'var(--fgc-blue-border)',
          boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top 4-Color Church Emblem Gradient Ribbon */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--fgc-gradient-4color)', zIndex: 10 }} />

        <div className="double-bezel-inner" style={{ padding: isMinimized ? '0.65rem 1rem' : '1.25rem', background: '#FFFFFF' }}>
          {isMinimized ? (
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', cursor: 'pointer' }}
              onClick={() => setIsMinimized(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="quad-beacon" aria-hidden="true">
                  <span className="quad-dot red"></span>
                  <span className="quad-dot blue"></span>
                  <span className="quad-dot gold"></span>
                  <span className="quad-dot purple"></span>
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sunday: 7:30 & 9:30 AM</span>
              </div>
              <ChevronUp size={16} color="var(--fgc-blue)" />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--fgc-blue-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-blue)' }}>
                    <Clock size={12} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fgc-blue)' }}>
                    Join Us This Sunday
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={() => setIsMinimized(true)}
                    title="Minimize"
                    aria-label="Minimize"
                    style={{ color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => setIsClosed(true)}
                    title="Close"
                    aria-label="Close"
                    style={{ color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                7:30 AM & 9:30 AM
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1rem' }}>
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

      <style>{`
        @media (max-width: 768px) {
          .floating-pill-wrap {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};
