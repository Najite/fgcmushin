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
    <section id="ministries" className="section-padding" style={{ position: 'relative', background: '#FFFFFF' }}>
      <div className="container-max">
        {/* Header Tagline & Title */}
        <div className="reveal-item" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="eyebrow-pill" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>COMMUNITY FOR ALL GENERATIONS</span>
          </div>
          <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            There is a place here for <span className="italic-serif">Everybody.</span>
          </h2>
          <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            From your little ones to teenagers, college students, and seasoned adults, discover life-giving groups where you can truly belong.
          </p>
        </div>

        {/* 4-Card Doppelrand Grid in Luminous Light Theme */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {MINISTRIES.map((ministry, idx) => (
            <div
              key={ministry.id}
              className={`double-bezel reveal-scale-card reveal-stagger-${(idx % 4) + 1}`}
              style={{ cursor: 'pointer', background: '#FAF8F5' }}
              onClick={() => setSelectedMinistry(ministry)}
            >
              <div
                className="double-bezel-inner"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#FFFFFF',
                  overflow: 'hidden'
                }}
              >
                {/* Image Container with Age Badge */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={ministry.image}
                    alt={ministry.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s var(--ease-spring)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                    <span
                      className="eyebrow-pill"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        color: 'var(--accent-teal-dark)',
                        borderColor: 'rgba(0, 118, 129, 0.25)',
                        fontSize: '0.725rem'
                      }}
                    >
                      {ministry.ageGroup}
                    </span>
                  </div>
                </div>

                {/* Content Info */}
                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.25 }}>
                      {ministry.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--accent-teal)', fontWeight: 600, marginBottom: '0.65rem' }}>
                      {ministry.tagline}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {ministry.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} color="var(--accent-teal)" />
                      <span>{ministry.schedule}</span>
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--accent-teal-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-teal)'
                      }}
                    >
                      <ArrowUpRight size={15} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ministry Detail Modal in Light Theme */}
      {selectedMinistry && (
        <div
          className="modal-backdrop-animate"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(21, 26, 33, 0.65)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedMinistry(null)}
        >
          <div
            className="double-bezel modal-dialog-animate"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="double-bezel-inner" style={{ background: '#FFFFFF', padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span className="eyebrow-pill" style={{ marginBottom: '0.5rem' }}>
                    {selectedMinistry.ageGroup}
                  </span>
                  <h3 className="heading-h2" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
                    {selectedMinistry.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMinistry(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)'
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
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-teal-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)' }}>
                        <Check size={13} />
                      </div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Ministry Lead
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
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
