import React from 'react';

export const Marquee: React.FC = () => {
  const items = [
    { text: 'JESUS OUR SAVIOR', color: 'var(--fgc-red)', isOutline: false },
    { text: 'JESUS OUR HEALER', color: 'var(--fgc-blue)', isOutline: false },
    { text: 'JESUS OUR BAPTIZER', color: 'var(--fgc-gold-dark)', isOutline: false },
    { text: 'JESUS OUR SOON-COMING KING', color: 'var(--fgc-purple)', isOutline: false },
    { text: 'MUSHIN DISTRICT HQ', color: 'var(--text-primary)', isOutline: true },
    { text: 'EVERYONE IS WELCOME', color: 'var(--text-primary)', isOutline: false }
  ];

  return (
    <div className="marquee-track" aria-hidden="true">
      <div className="marquee-content">
        {items.map((item, index) => (
          <div key={`m1-${index}`} className="marquee-item">
            <span
              className={item.isOutline ? 'text-outline-dark font-serif italic-serif' : ''}
              style={{ letterSpacing: '0.04em', color: item.isOutline ? 'transparent' : item.color }}
            >
              {item.text}
            </span>
            <div className="quad-beacon" style={{ opacity: 0.7 }}>
              <span className="quad-dot red"></span>
              <span className="quad-dot blue"></span>
              <span className="quad-dot gold"></span>
              <span className="quad-dot purple"></span>
            </div>
          </div>
        ))}
      </div>
      <div className="marquee-content" aria-hidden="true">
        {items.map((item, index) => (
          <div key={`m2-${index}`} className="marquee-item">
            <span
              className={item.isOutline ? 'text-outline-dark font-serif italic-serif' : ''}
              style={{ letterSpacing: '0.04em', color: item.isOutline ? 'transparent' : item.color }}
            >
              {item.text}
            </span>
            <div className="quad-beacon" style={{ opacity: 0.7 }}>
              <span className="quad-dot red"></span>
              <span className="quad-dot blue"></span>
              <span className="quad-dot gold"></span>
              <span className="quad-dot purple"></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
