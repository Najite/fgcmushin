import React from 'react';

export const Marquee: React.FC = () => {
  const items = [
    { text: 'WHO WE ARE', isOutline: true },
    { text: 'LOVE GOD', isOutline: false },
    { text: 'LOVE PEOPLE', isOutline: true },
    { text: 'CHANGE THE WORLD', isOutline: false },
    { text: 'EVERYONE IS WELCOME', isOutline: true },
    { text: 'JESUS CHANGES LIVES', isOutline: false }
  ];

  return (
    <div className="marquee-track" aria-hidden="true">
      <div className="marquee-content">
        {items.map((item, index) => (
          <div key={`m1-${index}`} className="marquee-item">
            <span className={item.isOutline ? 'text-outline-white font-serif italic-serif' : ''} style={{ letterSpacing: '0.04em' }}>
              {item.text}
            </span>
            <div className="marquee-dash" />
          </div>
        ))}
      </div>
      <div className="marquee-content" aria-hidden="true">
        {items.map((item, index) => (
          <div key={`m2-${index}`} className="marquee-item">
            <span className={item.isOutline ? 'text-outline-white font-serif italic-serif' : ''} style={{ letterSpacing: '0.04em' }}>
              {item.text}
            </span>
            <div className="marquee-dash" />
          </div>
        ))}
      </div>
    </div>
  );
};
