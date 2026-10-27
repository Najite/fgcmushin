import React from 'react';
import { ArrowUpRight, Heart, Users, Sparkles, Compass } from 'lucide-react';

interface WelcomeSectionProps {
  onOpenPlanVisit: () => void;
  onOpenPrayer: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onOpenPlanVisit, onOpenPrayer }) => {
  return (
    <section id="welcome" className="section-padding" style={{ position: 'relative', background: '#FFFFFF' }}>
      <div className="container-max">
        {/* Top Header Tag */}
        <div className="reveal-item" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="eyebrow-pill" style={{ marginBottom: '1rem' }}>
            <Users size={14} />
            <span>WE’RE PEOPLE JUST LIKE YOU</span>
          </div>
          <h2
            className="heading-h2 font-serif"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              maxWidth: '850px',
              margin: '0 auto',
              color: 'var(--text-primary)'
            }}
          >
            Looking for a life-changing <span className="italic-serif">performance?</span> Neither are we.
          </h2>
        </div>

        {/* Editorial Split Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
            marginBottom: '4.5rem'
          }}
        >
          {/* Left: Double-Bezel Nested Photo Frame with Rotating Circular Badge */}
          <div className="reveal-item reveal-stagger-1" style={{ position: 'relative' }}>
            <div className="double-bezel" style={{ background: '#FAF8F5' }}>
              <div
                className="double-bezel-inner"
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  overflow: 'hidden'
                }}
              >
                <img
                  src="/images/community-welcome.jpg"
                  alt="Haven Church community laughing together"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s var(--ease-spring)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 65%, rgba(15, 20, 28, 0.75) 100%)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1.25rem',
                    left: '1.5rem',
                    right: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#FFE082', fontWeight: 700 }}>
                      Sunday Morning Fellowship
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                      Hot Coffee & Warm Smiles
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Rotating Circular Badge (Light Mode) */}
            <div
              style={{
                position: 'absolute',
                top: '-25px',
                right: '-20px',
                zIndex: 10
              }}
              className="rotating-badge-container"
            >
              <svg className="rotating-text-svg" viewBox="0 0 120 120">
                <path
                  id="circlePathLight"
                  d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
                  fill="none"
                />
                <text fill="#007681" fontSize="9.2" fontWeight="800" letterSpacing="0.16em">
                  <textPath href="#circlePathLight" startOffset="0%">
                    JOIN US SUNDAYS • 9:00 & 11:15 AM •
                  </textPath>
                </text>
              </svg>
              <div className="rotating-center-trigger">
                <Sparkles size={20} color="#FFFFFF" />
              </div>
            </div>
          </div>

          {/* Right: Authentic Narrative & Values */}
          <div className="reveal-item reveal-stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3
              style={{
                fontSize: 'clamp(1.75rem, 2.5vw, 2.4rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.25
              }}
            >
              Instead of hosting a show, we simply desire to <span style={{ color: 'var(--accent-teal)' }}>meet with Jesus.</span>
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Seriously. Every week at Haven, Christians and non-Christians, seekers and skeptics, the fired-up and the burned-out all come together to learn the ins and outs of Jesus’ great invitation into a new life.
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.975rem', lineHeight: 1.7 }}>
              You don’t have to clean up your life before walking through our doors. No secret handshakes, no awkward tests. Just a real family praying for one another, learning the Scriptures, and learning what it means to be truly known.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem' }}>
              <button
                onClick={onOpenPlanVisit}
                className="btn-island btn-teal"
              >
                <span>Plan Your First Sunday</span>
                <div className="btn-icon-bubble">
                  <ArrowUpRight size={15} />
                </div>
              </button>

              <button
                onClick={onOpenPrayer}
                className="btn-island btn-ghost"
              >
                <span>Need Prayer Today?</span>
                <div className="btn-icon-bubble">
                  <Heart size={14} color="var(--accent-teal)" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars Bento Cards (Light Theme Doppelrand) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {/* Pillar 1 */}
          <div className="double-bezel reveal-item reveal-stagger-1">
            <div className="double-bezel-inner" style={{ padding: '2.25rem 2rem', background: '#FFFFFF' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--accent-teal-subtle)',
                  border: '1px solid rgba(0, 118, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-teal)',
                  marginBottom: '1.25rem'
                }}
              >
                <Users size={22} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Everyone Is Welcome
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Whoever you are, whatever your past, there is a seat saved at the table for you. We embrace real people with radical grace.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="double-bezel reveal-item reveal-stagger-2">
            <div className="double-bezel-inner" style={{ padding: '2.25rem 2rem', background: '#FFFFFF' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(29, 78, 216, 0.08)',
                  border: '1px solid rgba(29, 78, 216, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-royal)',
                  marginBottom: '1.25rem'
                }}
              >
                <Compass size={22} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Everyone Has A Next Step
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Faith isn’t a destination—it’s a journey. From baptism and small groups to leadership, we walk alongside you in growth.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="double-bezel reveal-item reveal-stagger-3">
            <div className="double-bezel-inner" style={{ padding: '2.25rem 2rem', background: '#FFFFFF' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--accent-gold-subtle)',
                  border: '1px solid rgba(180, 83, 9, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                  marginBottom: '1.25rem'
                }}
              >
                <Heart size={22} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                Everyone Can Make A Difference
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                God has wired you with distinct gifts to serve others. When we love our city with tangible care, lives are transformed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
