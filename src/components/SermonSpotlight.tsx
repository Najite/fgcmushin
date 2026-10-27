import React, { useState } from 'react';
import { Play, BookOpen, Clock, Calendar, Share2, Check } from 'lucide-react';
import { FEATURED_SERMON, RECENT_SERMONS } from '../data/churchData';
import type { Sermon } from '../types';

interface SermonSpotlightProps {
  onPlaySermon: (sermon: Sermon) => void;
  sermons?: Sermon[];
}

export const SermonSpotlight: React.FC<SermonSpotlightProps> = ({ onPlaySermon, sermons }) => {
  const sermonList = sermons && sermons.length > 0 ? sermons : RECENT_SERMONS;
  const initialSermon = sermons && sermons.length > 0 ? sermons[0] : FEATURED_SERMON;

  const [activeSermon, setActiveSermon] = useState<Sermon>(initialSermon);
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    if (sermons && sermons.length > 0) {
      // Keep current active if still in list, otherwise select first
      const exists = sermons.find(s => s.id === activeSermon.id);
      if (!exists) {
        setActiveSermon(sermons[0]);
      }
    }
  }, [sermons]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="sermons" className="section-padding" style={{ position: 'relative', background: '#F4EFEB' }}>
      <div className="container-max">
        {/* Section Header */}
        <div className="reveal-item" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
          <div>
            <div className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <BookOpen size={14} />
              <span>TEACHING & SCRIPTURE</span>
            </div>
            <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: 'var(--text-primary)' }}>
              Latest <span className="italic-serif">Message</span> Series
            </h2>
          </div>
          <p style={{ maxWidth: '420px', color: 'var(--text-secondary)', fontSize: '0.975rem' }}>
            Rooted in the unchanging Word of God, taught with clarity, compassion, and practical guidance for your everyday life.
          </p>
        </div>

        {/* Featured Sermon 16:9 Hero Card (Light Theme Doppelrand) */}
        <div className="double-bezel reveal-scale-card reveal-stagger-1" style={{ marginBottom: '3rem', background: '#FFFFFF' }}>
          <div
            className="double-bezel-inner"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'stretch',
              background: '#FFFFFF'
            }}
          >
            {/* 16:9 Thumbnail with Rotating "WATCH SERMON" Play Overlay & Curtain Unveil */}
            <div
              className="reveal-curtain-photo"
              style={{
                position: 'relative',
                minHeight: '340px',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => onPlaySermon(activeSermon)}
            >
              <img
                src={activeSermon.thumbnail}
                alt={activeSermon.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.7s var(--ease-spring)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)'
                }}
              />

              {/* Series Tag on Thumbnail */}
              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                <span className="eyebrow-pill gold" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', color: 'var(--accent-gold)' }}>
                  CURRENT SERIES: {activeSermon.series}
                </span>
              </div>

              {/* Rotating Play Circle Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
                className="rotating-badge-container"
              >
                <svg className="rotating-text-svg" viewBox="0 0 120 120">
                  <path
                    id="sermonPathLight"
                    d="M 60, 60 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
                    fill="none"
                  />
                  <text fill="#FFFFFF" fontSize="9.5" fontWeight="800" letterSpacing="0.22em">
                    <textPath href="#sermonPathLight" startOffset="0%">
                      WATCH SERMON • WATCH SERMON •
                    </textPath>
                  </text>
                </svg>
                <div className="rotating-center-trigger">
                  <Play size={20} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: '3px' }} />
                </div>
              </div>
            </div>

            {/* Right: Message Details in Light Theme */}
            <div
              style={{
                padding: 'clamp(2rem, 4vw, 3.5rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: '#FFFFFF'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="var(--accent-teal)" />
                  <span>{activeSermon.date}</span>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="var(--accent-teal)" />
                  <span>{activeSermon.duration}</span>
                </span>
                <span>•</span>
                <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{activeSermon.passage}</span>
              </div>

              <h3
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.15,
                  marginBottom: '0.85rem'
                }}
              >
                {activeSermon.title}
              </h3>

              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-teal)', marginBottom: '1.25rem' }}>
                {activeSermon.speaker}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                {activeSermon.summary}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <button
                  onClick={() => onPlaySermon(activeSermon)}
                  className="btn-island btn-teal"
                >
                  <span>Watch Full Message</span>
                  <div className="btn-icon-bubble">
                    <Play size={13} fill="#FFFFFF" />
                  </div>
                </button>

                <button
                  onClick={handleShare}
                  className="btn-island btn-ghost"
                  title="Share sermon"
                >
                  <span>{copiedLink ? 'Link Copied!' : 'Share Message'}</span>
                  <div className="btn-icon-bubble">
                    {copiedLink ? <Check size={14} color="#059669" /> : <Share2 size={14} color="var(--accent-teal)" />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Message Series Switcher Grid */}
        <div className="reveal-item reveal-stagger-2">
          <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Previous Messages in Archive
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {sermonList.map((sermon) => {
              const isCurrent = activeSermon.id === sermon.id;
              return (
                <div
                  key={sermon.id}
                  className="double-bezel"
                  onClick={() => setActiveSermon(sermon)}
                  style={{
                    cursor: 'pointer',
                    background: '#FFFFFF',
                    borderColor: isCurrent ? 'var(--accent-teal)' : 'var(--border-subtle)',
                    boxShadow: isCurrent ? '0 8px 25px rgba(0, 118, 129, 0.2)' : 'var(--shadow-card)'
                  }}
                >
                  <div
                    className="double-bezel-inner"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      background: isCurrent ? 'var(--accent-teal-subtle)' : '#FFFFFF'
                    }}
                  >
                    <img
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      style={{
                        width: '85px',
                        height: '60px',
                        borderRadius: '10px',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.725rem', color: 'var(--accent-teal)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {sermon.series}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sermon.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {sermon.speaker}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
