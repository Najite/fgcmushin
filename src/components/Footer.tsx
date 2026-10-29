import React from 'react';
import { MapPin, Clock, ArrowUpRight, BarChart3 } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';

interface FooterProps {
  onOpenPlanVisit: () => void;
  onOpenGiving: () => void;
  onOpenPrayer: () => void;
  onSelectSection: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPlanVisit,
  onOpenGiving,
  onOpenPrayer,
  onSelectSection,
  onOpenAdmin
}) => {
  return (
    <footer style={{ background: '#F3EFEA', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
      {/* 4-Color Church Emblem Gradient Ribbon */}
      <div className="top-color-ribbon" aria-hidden="true" />
      <div className="container-max" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)', paddingBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '2.5rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Column 1: Brand & Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '11px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0
                }}
              >
                <img
                  src="/logo.png"
                  alt="Church Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', display: 'block', lineHeight: 1.1 }}>
                  FGC MUSHIN
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                  District Headquarters
                </span>
              </div>
            </div>

            <p className="footer-brand-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Foursquare Gospel Church Mushin District Headquarters — Jesus Christ, the Same Yesterday, Today, and Forever. A vibrant family following Jesus together.
            </p>

            {/* Social Icons Inline SVGs with 44x44px touch targets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
              {/* Instagram */}
              <a
                href={CHURCH_INFO.socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  touchAction: 'manipulation'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={CHURCH_INFO.socials.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  touchAction: 'manipulation'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={CHURCH_INFO.socials.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  touchAction: 'manipulation'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Gathering Times & Campus */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fgc-blue)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Sunday Gatherings
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Clock size={16} color="var(--fgc-blue)" style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>7:30 AM & 9:30 AM</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1st & 2nd Celebration Services (with Children Church)</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Clock size={16} color="var(--fgc-red)" style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Wednesdays 6:00 PM</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Faith & Power Service & Bible Study</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
                <MapPin size={16} color="var(--fgc-gold-dark)" style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>District Headquarters</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{CHURCH_INFO.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Connect */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-teal)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              <li>
                <button onClick={() => onSelectSection('welcome')} style={{ color: 'inherit', padding: '0.3rem 0', width: '100%', textAlign: 'left' }}>
                  Who We Are
                </button>
              </li>
              <li>
                <button onClick={() => onSelectSection('ministries')} style={{ color: 'inherit', padding: '0.3rem 0', width: '100%', textAlign: 'left' }}>
                  Ministries & Generations
                </button>
              </li>
              <li>
                <button onClick={() => onSelectSection('sermons')} style={{ color: 'inherit', padding: '0.3rem 0', width: '100%', textAlign: 'left' }}>
                  Message Archive & Teaching
                </button>
              </li>
              <li>
                <button onClick={() => onSelectSection('events')} style={{ color: 'inherit', padding: '0.3rem 0', width: '100%', textAlign: 'left' }}>
                  Events & Outreach Calendar
                </button>
              </li>
              <li>
                <button onClick={onOpenGiving} style={{ color: 'inherit', padding: '0.3rem 0', width: '100%', textAlign: 'left' }}>
                  Generosity & Tithes
                </button>
              </li>
              <li>
                <button onClick={onOpenPrayer} style={{ color: 'var(--accent-gold)', fontWeight: 600, padding: '0.3rem 0', width: '100%', textAlign: 'left' }}>
                  Submit Prayer Request
                </button>
              </li>
              {onOpenAdmin && (
                <li style={{ paddingTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)' }}>
                  <button
                    onClick={onOpenAdmin}
                    style={{
                      color: 'var(--fgc-blue)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.3rem 0'
                    }}
                  >
                    <BarChart3 size={14} />
                    <span>Staff Ministry Dashboard</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: First Time VIP CTA */}
          <div
            className="double-bezel"
            style={{
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div className="double-bezel-inner" style={{ padding: '1.75rem', background: '#FFFFFF' }}>
              <h5 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Joining Us This Sunday?
              </h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Let us know you're coming so our host team can prepare your welcome packet and save your parking spot.
              </p>
              <button
                onClick={onOpenPlanVisit}
                className="btn-island btn-teal"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Plan Your Visit</span>
                <div className="btn-icon-bubble" style={{ width: '22px', height: '22px' }}>
                  <ArrowUpRight size={13} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} Foursquare Gospel Church Mushin District Headquarters. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>Privacy Policy</span>
            <span>Terms of Worship</span>
            <span>Child Protection Policy</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  color: 'var(--fgc-blue)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'underline'
                }}
              >
                <BarChart3 size={13} />
                <span>Staff Ministry Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-brand-desc {
            font-size: 0.88rem !important;
            line-height: 1.5 !important;
          }
        }
      `}</style>
    </footer>
  );
};
