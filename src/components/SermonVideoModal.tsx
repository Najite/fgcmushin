import React, { useState, useEffect } from 'react';
import { X, BookOpen, Download, Heart, Play, Check, ExternalLink, Volume2, Sparkles } from 'lucide-react';
import type { Sermon } from '../types';

interface SermonVideoModalProps {
  sermon: Sermon | null;
  onClose: () => void;
  onOpenPrayer: () => void;
}

export const SermonVideoModal: React.FC<SermonVideoModalProps> = ({ sermon, onClose, onOpenPrayer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (!sermon) return;

    // Body scroll locking
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sermon, onClose]);

  if (!sermon) return null;

  const handleDownloadOutline = () => {
    // Generate text outline file for actual download
    const outlineContent = `Foursquare Gospel Church Mushin District Headquarters
Sermon Study Outline & Scripture Guide
=========================================
Title: ${sermon.title}
Series: ${sermon.series}
Speaker: ${sermon.speaker}
Date: ${sermon.date}
Scripture: ${sermon.passage}
Duration: ${sermon.duration}

SUMMARY:
${sermon.summary}

KEY REFLECTION QUESTIONS:
1. How does this scripture passage challenge your current walk with Christ?
2. What practical step will you take this week in response to God's Word?
3. Who in your sphere of influence can you share this message with?

"Jesus Christ the same yesterday, today, and forever." - Hebrews 13:8
Visit us: 4, Obarinmola Adedoyin Street, Idi-Oro, Mushin, Lagos.
Sunday Celebrations: 7:30 AM & 9:30 AM
`;

    const blob = new Blob([outlineContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sermon.title.replace(/[^a-zA-Z0-9]/g, '_')}_Study_Guide.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  return (
    <div
      className="modal-backdrop-animate"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(15, 20, 28, 0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        className="double-bezel modal-dialog-animate"
        style={{
          maxWidth: '860px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="double-bezel-inner" style={{ padding: 'clamp(1.25rem, 3.5vw, 2.25rem)', background: '#FFFFFF', position: 'relative' }}>
          {/* Top 4-Color Church Emblem Gradient Ribbon */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--fgc-gradient-4color)' }} />

          {/* Header bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="eyebrow-pill gold" style={{ fontSize: '0.72rem' }}>
                SERIES: {sermon.series}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {sermon.date}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--fgc-blue)', fontWeight: 600 }}>
                <Volume2 size={13} /> Cathedral Broadcast HD
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close sermon video dialog"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                transition: 'background-color 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Video Player 16:9 Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#0B132B',
              marginBottom: '1.75rem',
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)'
            }}
          >
            {isPlaying ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0`}
                title={sermon.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            ) : (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setIsPlaying(true)}
              >
                <img
                  src={sermon.thumbnail || '/images/sermon-series.jpg'}
                  alt={sermon.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.72)'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(11, 19, 43, 0.2) 0%, rgba(11, 19, 43, 0.75) 100%)'
                  }}
                />
                {/* Central Play Pulse Trigger */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.85rem'
                  }}
                >
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35), 0 0 0 10px rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--fgc-blue)',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.45), 0 0 0 16px rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.35), 0 0 0 10px rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
                  </div>
                  <span
                    style={{
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                    }}
                  >
                    Watch Full Message ({sermon.duration})
                  </span>
                </div>

                {/* Corner Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 3,
                    background: 'rgba(15, 20, 28, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={13} color="var(--fgc-gold)" /> FGC Mushin Broadcast
                </div>
              </div>
            )}
          </div>

          {/* Message Meta Info & Scripture */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
            <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(1.35rem, 3.5vw, 2.1rem)', color: 'var(--text-primary)', lineHeight: 1.25 }}>
              {sermon.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--fgc-blue)', fontWeight: 700 }}>{sermon.speaker}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--fgc-gold-dark)', fontWeight: 600 }}>
                <BookOpen size={15} />
                <span>Scripture: {sermon.passage}</span>
              </span>
              <span>•</span>
              <span>Duration: {sermon.duration}</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.65, marginTop: '0.25rem' }}>
              {sermon.summary}
            </p>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadOutline}
                className="btn-island btn-ghost"
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  backgroundColor: downloadSuccess ? 'rgba(16, 185, 129, 0.1)' : undefined,
                  borderColor: downloadSuccess ? 'rgba(16, 185, 129, 0.4)' : undefined,
                  color: downloadSuccess ? '#059669' : undefined
                }}
              >
                {downloadSuccess ? (
                  <>
                    <Check size={14} color="#059669" />
                    <span>Study Guide Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download size={14} color="var(--fgc-blue)" />
                    <span>Study Guide (Outline)</span>
                  </>
                )}
              </button>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="btn-island btn-ghost"
                style={{ padding: '0.65rem 1.15rem', fontSize: '0.85rem' }}
              >
                <ExternalLink size={13} />
                <span>Watch on YouTube</span>
              </a>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenPrayer();
              }}
              className="btn-island btn-teal"
              style={{ padding: '0.65rem 1.35rem', fontSize: '0.85rem' }}
            >
              <Heart size={14} />
              <span>Request Prayer for this Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
