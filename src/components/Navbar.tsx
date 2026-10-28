import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Heart, MapPin, Clock } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';

interface NavbarProps {
  onOpenPlanVisit: () => void;
  onOpenGiving: () => void;
  onOpenPrayer: () => void;
  onSelectSection: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPlanVisit,
  onOpenGiving,
  onOpenPrayer,
  onSelectSection,
  onOpenAdmin
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
              <div className="navbar-brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
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
                className="btn-island btn-teal navbar-cta-btn"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
              >
                <span className="navbar-cta-text-full">Plan A Visit</span>
                <span className="navbar-cta-text-short">Visit</span>
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
            zIndex: 999,
            background: 'rgba(250, 248, 245, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1.5rem 2.5rem',
            overflowY: 'auto'
          }}
        >
          <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Top Bar inside Menu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img src="/logo.png" alt="Church Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>FGC MUSHIN</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-teal)' }}>DISTRICT HEADQUARTERS</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => handleNavClick('welcome')}
                style={{ textAlign: 'left', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0.35rem 0' }}
              >
                <span style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', marginRight: '0.5rem', fontWeight: 800 }}>01.</span>
                Who We Are
              </button>
              <button
                onClick={() => handleNavClick('ministries')}
                style={{ textAlign: 'left', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0.35rem 0' }}
              >
                <span style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', marginRight: '0.5rem', fontWeight: 800 }}>02.</span>
                Ministries (Kids, YTH, YA)
              </button>
              <button
                onClick={() => handleNavClick('sermons')}
                style={{ textAlign: 'left', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0.35rem 0' }}
              >
                <span style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', marginRight: '0.5rem', fontWeight: 800 }}>03.</span>
                Watch Messages
              </button>
              <button
                onClick={() => handleNavClick('events')}
                style={{ textAlign: 'left', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0.35rem 0' }}
              >
                <span style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', marginRight: '0.5rem', fontWeight: 800 }}>04.</span>
                Upcoming Gatherings
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGiving();
                }}
                style={{ textAlign: 'left', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0.35rem 0' }}
              >
                <span style={{ color: 'var(--accent-teal)', fontSize: '0.9rem', marginRight: '0.5rem', fontWeight: 800 }}>05.</span>
                Generosity & Giving
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPrayer();
                }}
                style={{ textAlign: 'left', fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent-gold)', padding: '0.35rem 0' }}
              >
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginRight: '0.5rem', fontWeight: 800 }}>06.</span>
                Request Prayer & Care
              </button>
            </div>

            {/* Mobile Actions Card */}
            <div
              className="double-bezel"
              style={{
                padding: '1.25rem',
                background: '#FFFFFF',
                borderRadius: '16px',
                marginTop: 'auto',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                <Clock size={15} color="var(--accent-teal)" />
                <span>Sundays: 7:30 AM & 9:30 AM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <MapPin size={15} color="var(--accent-teal)" />
                <span>{CHURCH_INFO.address}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPlanVisit();
                  }}
                  className="btn-island btn-teal"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  <span>Plan Your Sunday Visit</span>
                  <div className="btn-icon-bubble">
                    <ArrowUpRight size={14} />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenGiving();
                  }}
                  className="btn-island btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  <Heart size={14} color="var(--accent-gold)" />
                  <span>Give Online</span>
                </button>
              </div>

              {onOpenAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.35rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    textDecoration: 'underline'
                  }}
                >
                  Staff CMS Portal
                </button>
              )}
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
        @media (max-width: 859px) {
          .navbar-cta-btn {
            display: none !important;
          }
          .navbar-brand-text {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};
