import React from 'react';
import { MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';

interface FooterProps {
  onOpenPlanVisit: () => void;
  onOpenGiving: () => void;
  onOpenPrayer: () => void;
  onSelectSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPlanVisit,
  onOpenGiving,
  onOpenPrayer,
  onSelectSection
}) => {
  return (
    <footer style={{ background: '#040508', borderTop: '1px solid var(--border-subtle)', position: 'relative' }}>
      <div className="container-max" style={{ paddingTop: '5rem', paddingBottom: '3.5rem' }}>
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem'
          }}
        >
          {/* Column 1: Brand & Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #008793 0%, #1A56DB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 135, 147, 0.4)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3V21M7 8H17" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M4 19C4 14.5817 7.58172 11 12 11C16.4183 11 20 14.5817 20 19" stroke="#FFE082" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="1 3" />
                </svg>
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                HAVEN CHURCH
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              A diverse, life-giving church family learning to follow Jesus together, love people, and change the world.
            </p>

            {/* Social Icons Inline SVGs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
              {/* Instagram */}
              <a
                href={CHURCH_INFO.socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Gathering Times & Campus */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Sunday Gatherings
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Clock size={16} color="var(--accent-teal)" style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>9:00 AM & 11:15 AM</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Kids Ministry (Infants - 5th Grade)</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Clock size={16} color="var(--accent-teal)" style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Wednesdays 7:00 PM</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Haven YTH & Community Groups</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem' }}>
                <MapPin size={16} color="var(--accent-teal)" style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Sanctuary Campus</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{CHURCH_INFO.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Connect */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.925rem', color: 'var(--text-muted)' }}>
              <li>
                <button onClick={() => onSelectSection('welcome')} style={{ color: 'inherit' }}>
                  Who We Are
                </button>
              </li>
              <li>
                <button onClick={() => onSelectSection('ministries')} style={{ color: 'inherit' }}>
                  Ministries & Generations
                </button>
              </li>
              <li>
                <button onClick={() => onSelectSection('sermons')} style={{ color: 'inherit' }}>
                  Message Archive & Teaching
                </button>
              </li>
              <li>
                <button onClick={() => onSelectSection('events')} style={{ color: 'inherit' }}>
                  Events & Outreach Calendar
                </button>
              </li>
              <li>
                <button onClick={onOpenGiving} style={{ color: 'inherit' }}>
                  Generosity & Tithes
                </button>
              </li>
              <li>
                <button onClick={onOpenPrayer} style={{ color: 'var(--accent-gold)' }}>
                  Submit Prayer Request
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: First Time VIP CTA */}
          <div
            className="double-bezel"
            style={{
              background: 'rgba(0, 135, 147, 0.12)',
              borderColor: 'rgba(0, 135, 147, 0.25)'
            }}
          >
            <div className="double-bezel-inner" style={{ padding: '1.75rem', background: '#0C1017' }}>
              <h5 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Joining Us This Sunday?
              </h5>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
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
            &copy; {new Date().getFullYear()} Haven Church Inc. All rights reserved. 501(c)(3) Non-Profit Organization.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Worship</span>
            <span>Child Protection Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
