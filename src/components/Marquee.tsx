import React from 'react';

export const Marquee: React.FC = () => {
  const items = [
    { text: 'JESUS OUR SAVIOR', isOutline: true },
    { text: 'JESUS OUR HEALER', isOutline: false },
    { text: 'JESUS OUR BAPTIZER', isOutline: true },
    { text: 'JESUS OUR SOON-COMING KING', isOutline: false },
    { text: 'MUSHIN DISTRICT HQ', isOutline: true },
    { text: 'EVERYONE IS WELCOME', isOutline: false }
  ];

  return (
    <div className="marquee-track" aria-hidden="true">
      <div className="marquee-content">
        {items.map((item, index) => (
          <div key={`m1-${index}`} className="marquee-item">
            <span
              className={item.isOutline ? 'text-outline-dark font-serif italic-serif' : ''}
              style={{ letterSpacing: '0.04em', color: item.isOutline ? 'transparent' : 'var(--text-primary)' }}
            >
              {item.text}
            </span>
            <div className="marquee-dash" />
          </div>
        ))}
      </div>
      <div className="marquee-content" aria-hidden="true">
        {items.map((item, index) => (
          <div key={`m2-${index}`} className="marquee-item">
            <span
              className={item.isOutline ? 'text-outline-dark font-serif italic-serif' : ''}
              style={{ letterSpacing: '0.04em', color: item.isOutline ? 'transparent' : 'var(--text-primary)' }}
            >
              {item.text}
            </span>
            <div className="marquee-dash" />
          </div>
        ))}
      </div>
    </div>
  );
};
