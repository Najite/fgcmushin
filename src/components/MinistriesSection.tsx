import React, { useState } from 'react';
import { Sparkles, ArrowUpRight, Clock, X, Check } from 'lucide-react';
import { MINISTRIES } from '../data/churchData';
import type { Ministry } from '../types';

interface MinistriesSectionProps {
  onOpenPlanVisit: () => void;
}

export const MinistriesSection: React.FC<MinistriesSectionProps> = ({ onOpenPlanVisit }) => {
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  return (
    <section id="ministries" className="section-padding" style={{ position: 'relative' }}>
      <div className="container-max">
        {/* Header Tagline & Title */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="eyebrow-pill" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>COMMUNITY FOR ALL GENERATIONS</span>
          </div>
          <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', color: '#FFFFFF', marginBottom: '1rem' }}>
            There is a place here for <span className="italic-serif">Everybody.</span>
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            From your little ones to teenagers, college students, and seasoned adults, discover life-giving groups where you can truly belong.
          </p>
        </div>

        {/* 4-Card Doppelrand Grid (Motivation & Brooklake Aesthetic) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {MINISTRIES.map((ministry) => (
            <div
              key={ministry.id}
              className="double-bezel"
              style={{ cursor: 'pointer', height: '420px' }}
              onClick={() => setSelectedMinistry(ministry)}
            >
              <div
                className="double-bezel-inner"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                  overflow: 'hidden'
                }}
              >
                {/* Background Image with Ambient Gradient */}
                <img
                  src={ministry.image}
                  alt={ministry.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.6) contrast(1.1)',
                    transition: 'transform 0.6s var(--ease-spring)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />

                {/* Gradient Shade for Legibility */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(7, 9, 13, 0.45) 0%, rgba(7, 9, 13, 0.2) 30%, rgba(7, 9, 13, 0.92) 85%, #07090D 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Top Badge: Age Range */}
                <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="eyebrow-pill" style={{ background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(10px)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                    {ministry.ageGroup}
                  </span>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF'
                    }}
                  >
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                {/* Bottom Content Info */}
                <div style={{ position: 'relative', zIndex: 5 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem', lineHeight: 1.2 }}>
                    {ministry.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '0.65rem' }}>
                    {ministry.tagline}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} color="var(--accent-teal-light)" />
                    <span>{ministry.schedule}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ministry Detail Modal */}
      {selectedMinistry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedMinistry(null)}
        >
          <div
            className="double-bezel"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="double-bezel-inner" style={{ background: '#0F141C', padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span className="eyebrow-pill" style={{ marginBottom: '0.5rem' }}>
                    {selectedMinistry.ageGroup}
                  </span>
                  <h3 className="heading-h2" style={{ fontSize: '2rem', color: '#FFFFFF' }}>
                    {selectedMinistry.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMinistry(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <img
                src={selectedMinistry.image}
                alt={selectedMinistry.title}
                style={{
                  width: '100%',
                  height: '240px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  marginBottom: '1.5rem'
                }}
              />

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {selectedMinistry.description}
              </p>

              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  What To Expect:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedMinistry.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFFFFF', fontSize: '0.925rem' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent-teal-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal-light)' }}>
                        <Check size={12} />
                      </div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Ministry Lead
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {selectedMinistry.lead}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedMinistry(null);
                    onOpenPlanVisit();
                  }}
                  className="btn-island btn-teal"
                >
                  <span>Connect & Plan A Visit</span>
                  <div className="btn-icon-bubble">
                    <ArrowUpRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
