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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(2rem, 5vw, 3.5rem)',
            alignItems: 'center',
            marginBottom: '4.5rem'
          }}
        >
          {/* Left: Double-Bezel Nested Photo Frame with Rotating Circular Badge & Curtain Unveil */}
          <div className="reveal-curtain-photo reveal-stagger-1" style={{ position: 'relative' }}>
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
                  alt="FGC Mushin church family fellowship"
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
              Seriously. Every week at FGC Mushin District Headquarters, believers, seekers, and families from all walks of life come together to experience the life-transforming power and peace of Jesus Christ.
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

        {/* The Fourfold Gospel: The 4 Quadrants of the Church Emblem */}
        <div style={{ marginTop: '3.5rem', marginBottom: '2.5rem' }}>
          <div className="reveal-item" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <span className="quad-beacon" aria-hidden="true">
                <span className="quad-dot red"></span>
                <span className="quad-dot blue"></span>
                <span className="quad-dot gold"></span>
                <span className="quad-dot purple"></span>
              </span>
              <span>THE FOURFOLD GOSPEL</span>
            </div>
            <h3 className="heading-h2 font-serif" style={{ fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              The Four Pillars of <span className="italic-serif">Our Faith.</span>
            </h3>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              The four symbols and colors on our official emblem represent the four distinct offices of Jesus Christ in our lives and ministry:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1.25rem'
            }}
          >
            {/* 1. Jesus the Savior (Red - Cross) */}
            <div className="double-bezel reveal-scale-card reveal-stagger-1" style={{ position: 'relative' }}>
              <div
                className="double-bezel-inner"
                style={{
                  padding: '2.25rem 1.85rem 2rem',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Quadrant color line */}
                <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: '3.5px', background: 'var(--fgc-red)', borderRadius: '0 0 3px 3px' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'var(--fgc-red-subtle)',
                      border: '1px solid var(--fgc-red-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--fgc-red)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="3" x2="12" y2="21" />
                      <line x1="6" y1="8" x2="18" y2="8" />
                    </svg>
                  </div>
                  <span className="eyebrow-pill red" style={{ fontSize: '0.68rem', padding: '0.25rem 0.65rem' }}>
                    Romans 10:9
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fgc-red-dark)', marginBottom: '0.25rem' }}>
                  The Cross • Scarlet Red
                </div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem', lineHeight: 1.2 }}>
                  Jesus Our Savior
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  He gave His life on the cross and rose again. Through faith in Jesus Christ, everyone receives eternal salvation, forgiveness, and new life.
                </p>
              </div>
            </div>

            {/* 2. Jesus the Healer (Blue - Cup) */}
            <div className="double-bezel reveal-scale-card reveal-stagger-2" style={{ position: 'relative' }}>
              <div
                className="double-bezel-inner"
                style={{
                  padding: '2.25rem 1.85rem 2rem',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Quadrant color line */}
                <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: '3.5px', background: 'var(--fgc-blue)', borderRadius: '0 0 3px 3px' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'var(--fgc-blue-subtle)',
                      border: '1px solid var(--fgc-blue-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--fgc-blue)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12v5a6 6 0 0 1-12 0V3z" />
                      <path d="M12 14v6" />
                      <path d="M8 20h8" />
                    </svg>
                  </div>
                  <span className="eyebrow-pill blue" style={{ fontSize: '0.68rem', padding: '0.25rem 0.65rem' }}>
                    1 Peter 2:24
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fgc-blue-dark)', marginBottom: '0.25rem' }}>
                  The Cup • Azure Blue
                </div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem', lineHeight: 1.2 }}>
                  Jesus Our Healer
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  Christ’s finished sacrifice provides divine physical, emotional, and spiritual wholeness for the entire person today through active prayer.
                </p>
              </div>
            </div>

            {/* 3. Jesus the Baptizer with the Holy Spirit (Gold - Dove) */}
            <div className="double-bezel reveal-scale-card reveal-stagger-3" style={{ position: 'relative' }}>
              <div
                className="double-bezel-inner"
                style={{
                  padding: '2.25rem 1.85rem 2rem',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Quadrant color line */}
                <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: '3.5px', background: 'var(--fgc-gold)', borderRadius: '0 0 3px 3px' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'var(--fgc-gold-subtle)',
                      border: '1px solid var(--fgc-gold-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--fgc-gold-dark)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 14c2-4 6-6 10-6 2 0 4 1 6 3-2 1-4 2-5 4-2 3-5 5-9 5a4 4 0 0 1-2-6z" />
                      <path d="M10 8l-2-5 5 2" />
                    </svg>
                  </div>
                  <span className="eyebrow-pill gold" style={{ fontSize: '0.68rem', padding: '0.25rem 0.65rem' }}>
                    Acts 1:8
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fgc-gold-dark)', marginBottom: '0.25rem' }}>
                  The Dove • Holy Gold
                </div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem', lineHeight: 1.2 }}>
                  Jesus Our Baptizer
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  He baptizes believers with the Holy Spirit and with fire, empowering us with supernatural boldness, spiritual gifts, and daily guidance.
                </p>
              </div>
            </div>

            {/* 4. Jesus the Soon-Coming King (Purple - Crown) */}
            <div className="double-bezel reveal-scale-card reveal-stagger-4" style={{ position: 'relative' }}>
              <div
                className="double-bezel-inner"
                style={{
                  padding: '2.25rem 1.85rem 2rem',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {/* Quadrant color line */}
                <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: '3.5px', background: 'var(--fgc-purple)', borderRadius: '0 0 3px 3px' }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: 'var(--fgc-purple-subtle)',
                      border: '1px solid var(--fgc-purple-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--fgc-purple)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
                    </svg>
                  </div>
                  <span className="eyebrow-pill purple" style={{ fontSize: '0.68rem', padding: '0.25rem 0.65rem' }}>
                    1 Thess 4:16
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fgc-purple-dark)', marginBottom: '0.25rem' }}>
                  The Crown • Royal Purple
                </div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem', lineHeight: 1.2 }}>
                  Jesus the Soon-Coming King
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                  He will visibly return in great glory and power. We live with joyful anticipation, readying our hearts and serving with kingdom purpose.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Community Values Banner Strip */}
        <div
          className="reveal-item"
          style={{
            marginTop: '2.5rem',
            padding: '1.5rem 2rem',
            background: 'var(--bg-surface-elevated)',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--fgc-blue-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-blue)' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Everyone is Welcome</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>A seat at the table with radical grace</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--fgc-gold-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-gold-dark)' }}>
              <Compass size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Everyone Has A Next Step</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Discipleship, baptism, and spiritual growth</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--fgc-purple-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fgc-purple)' }}>
              <Heart size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Everyone Can Make A Difference</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Using distinct God-given gifts to serve</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
