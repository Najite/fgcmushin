import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Heart, Sparkles, MapPin, Clock } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';

interface NavbarProps {
  onOpenPlanVisit: () => void;
  onOpenGiving: () => void;
  onOpenPrayer: () => void;
  onSelectSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPlanVisit,
  onOpenGiving,
  onOpenPrayer,
  onSelectSection
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onSelectSection(id);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: '1rem',
          zIndex: 40,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '0 1rem',
          pointerEvents: 'none'
        }}
      >
        <nav
          className="double-bezel"
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '1180px',
            borderRadius: '9999px',
            padding: '4px',
            background: isScrolled
              ? 'rgba(10, 14, 20, 0.88)'
              : 'rgba(14, 19, 26, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: isScrolled ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.08)',
            boxShadow: isScrolled ? '0 16px 36px -10px rgba(0, 0, 0, 0.8)' : '0 8px 24px -10px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px'
            }}
          >
            {/* Logo Brand */}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('top');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                paddingLeft: '0.35rem'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #008793 0%, #1A56DB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 135, 147, 0.4)'
                }}
              >
                {/* Custom stylized Cross & Haven arch symbol */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3V21M7 8H17" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M4 19C4 14.5817 7.58172 11 12 11C16.4183 11 20 14.5817 20 19" stroke="#FFE082" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="1 3" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  HAVEN
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.18em', color: 'var(--text-muted)' }}>
                  CHURCH
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '1.8rem',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
              className="desktop-links"
            >
              <button
                onClick={() => handleNavClick('welcome')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Who We Are
              </button>
              <button
                onClick={() => handleNavClick('ministries')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Ministries
              </button>
              <button
                onClick={() => handleNavClick('sermons')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Messages
              </button>
              <button
                onClick={() => handleNavClick('events')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Events
              </button>
              <button
                onClick={onOpenGiving}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Give
              </button>
              <button
                onClick={onOpenPrayer}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-gold)',
                  fontSize: '0.85rem'
                }}
              >
                <Heart size={14} />
                <span>Prayer</span>
              </button>
            </div>

            {/* Right Action Island */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={onOpenPlanVisit}
                className="btn-island btn-teal"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
              >
                <span>Plan A Visit</span>
                <div className="btn-icon-bubble">
                  <ArrowUpRight size={14} />
                </div>
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-trigger"
                aria-label="Toggle Navigation Menu"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF'
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Fullscreen Mega-Menu Overlay (Mobile & Extended Navigation) */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 35,
            background: 'rgba(5, 7, 10, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '6rem 2rem 3rem',
            overflowY: 'auto'
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="eyebrow-pill" style={{ marginBottom: '1rem' }}>
                <Sparkles size={13} />
                <span>Welcome to Haven Church</span>
              </div>
              <h2 className="heading-h2 font-serif" style={{ fontSize: '2.4rem', lineHeight: 1.15 }}>
                Making Jesus known to <span className="italic-serif">Everyone,</span> Everywhere.
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
              <button
                onClick={() => handleNavClick('welcome')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}
              >
                01. Who We Are
              </button>
              <button
                onClick={() => handleNavClick('ministries')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}
              >
                02. Ministries (Kids, YTH, YA)
              </button>
              <button
                onClick={() => handleNavClick('sermons')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}
              >
                03. Watch Messages
              </button>
              <button
                onClick={() => handleNavClick('events')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}
              >
                04. Upcoming Events
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGiving();
                }}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}
              >
                05. Generosity & Giving
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPrayer();
                }}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-gold)' }}
              >
                06. Request Prayer & Care
              </button>
            </div>

            <div
              className="double-bezel"
              style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '20px',
                marginBottom: '2rem'
              }}
            >
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Join Us In Person
              </h4>
              <p style={{ fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--accent-teal)" />
                <span>Sundays at 9:00 AM & 11:15 AM</span>
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <MapPin size={16} color="var(--accent-teal)" />
                <span>{CHURCH_INFO.address}</span>
              </p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPlanVisit();
                }}
                className="btn-island btn-teal"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Plan Your Sunday Visit</span>
                <div className="btn-icon-bubble">
                  <ArrowUpRight size={15} />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for responsive breakpoints */}
      <style>{`
        @media (min-width: 860px) {
          .desktop-links {
            display: flex !important;
          }
          .mobile-trigger {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
