import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Heart, MapPin, Clock } from 'lucide-react';
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
      setIsScrolled(window.scrollY > 30);
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
          top: '0.85rem',
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
              ? 'rgba(255, 255, 255, 0.94)'
              : 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: isScrolled ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            boxShadow: isScrolled
              ? '0 12px 35px -8px rgba(0, 0, 0, 0.12)'
              : '0 4px 20px -4px rgba(0, 0, 0, 0.06)'
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
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
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>
                  FGC MUSHIN
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>
                  DISTRICT HEADQUARTERS
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
                fontWeight: 600
              }}
              className="desktop-links"
            >
              <button
                onClick={() => handleNavClick('welcome')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Who We Are
              </button>
              <button
                onClick={() => handleNavClick('ministries')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Ministries
              </button>
              <button
                onClick={() => handleNavClick('sermons')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Messages
              </button>
              <button
                onClick={() => handleNavClick('events')}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Events
              </button>
              <button
                onClick={onOpenGiving}
                style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
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
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Fullscreen Mega-Menu Overlay in Light Theme */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 35,
            background: 'rgba(250, 248, 245, 0.98)',
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
                <span className="quad-beacon" aria-hidden="true">
                  <span className="quad-dot red"></span>
                  <span className="quad-dot blue"></span>
                  <span className="quad-dot gold"></span>
                  <span className="quad-dot purple"></span>
                </span>
                <span>Welcome to FGC Mushin DHQ</span>
              </div>
              <h2 className="heading-h2 font-serif" style={{ fontSize: '2.4rem', lineHeight: 1.15, color: 'var(--text-primary)' }}>
                Making Jesus known to <span className="italic-serif">Everyone,</span> Everywhere.
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
              <button
                onClick={() => handleNavClick('welcome')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}
              >
                01. Who We Are
              </button>
              <button
                onClick={() => handleNavClick('ministries')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}
              >
                02. Ministries (Kids, YTH, YA)
              </button>
              <button
                onClick={() => handleNavClick('sermons')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}
              >
                03. Watch Messages
              </button>
              <button
                onClick={() => handleNavClick('events')}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}
              >
                04. Upcoming Events
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGiving();
                }}
                style={{ textAlign: 'left', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}
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
                background: '#FFFFFF',
                borderRadius: '20px',
                marginBottom: '2rem'
              }}
            >
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Join Us In Person
              </h4>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--accent-teal)" />
                <span>Sundays at 9:00 AM & 11:15 AM</span>
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
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
