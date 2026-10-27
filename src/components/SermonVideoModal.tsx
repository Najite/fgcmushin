import React from 'react';
import { X, BookOpen, Download, Heart } from 'lucide-react';
import type { Sermon } from '../types';

interface SermonVideoModalProps {
  sermon: Sermon | null;
  onClose: () => void;
  onOpenPrayer: () => void;
}

export const SermonVideoModal: React.FC<SermonVideoModalProps> = ({ sermon, onClose, onOpenPrayer }) => {
  if (!sermon) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(21, 26, 33, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={onClose}
    >
      <div
        className="double-bezel"
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="double-bezel-inner" style={{ padding: '2rem', background: '#FFFFFF' }}>
          {/* Header bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="eyebrow-pill gold" style={{ fontSize: '0.7rem' }}>
                SERIES: {sermon.series}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {sermon.date}
              </span>
            </div>
            <button
              onClick={onClose}
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

          {/* Video Player 16:9 Frame */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000000',
              marginBottom: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            <iframe
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0"
              title={sermon.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
            />
          </div>

          {/* Message Meta Info & Scripture */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <h2 className="heading-h2 font-serif" style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
              {sermon.title}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{sermon.speaker}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                <BookOpen size={16} />
                <span>Scripture: {sermon.passage}</span>
              </span>
              <span>•</span>
              <span>{sermon.duration}</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: 1.7 }}>
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
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => {
                alert('Sermon study guide & scripture outline downloaded!');
              }}
              className="btn-island btn-ghost"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <Download size={14} color="var(--accent-teal)" />
              <span>Study Guide (PDF)</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenPrayer();
              }}
              className="btn-island btn-teal"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
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
