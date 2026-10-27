import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ArrowUpRight } from 'lucide-react';
import { VISITOR_FAQS } from '../data/churchData';

interface VisitorFaqSectionProps {
  onOpenPlanVisit: () => void;
}

export const VisitorFaqSection: React.FC<VisitorFaqSectionProps> = ({ onOpenPlanVisit }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-padding" style={{ position: 'relative', background: '#FFFFFF' }}>
      <div className="container-max" style={{ maxWidth: '920px' }}>
        <div className="reveal-item" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="eyebrow-pill" style={{ marginBottom: '1rem' }}>
            <HelpCircle size={14} />
            <span>WHAT TO EXPECT</span>
          </div>
          <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            First Time Visiting? <span className="italic-serif">Here’s what to expect.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Visiting a new church can feel intimidating. Here are honest answers to make your first Sunday effortless.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {VISITOR_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`double-bezel reveal-item reveal-stagger-${(index % 4) + 1}`}
                style={{ background: '#FAF8F5' }}
              >
                <div
                  className="double-bezel-inner"
                  style={{
                    background: '#FFFFFF',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <button
                    onClick={() => toggle(index)}
                    style={{
                      width: '100%',
                      padding: '1.5rem 2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      gap: '1rem',
                      color: isOpen ? 'var(--accent-teal)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '1.15rem'
                    }}
                  >
                    <span>{faq.q}</span>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isOpen ? 'var(--accent-teal-subtle)' : 'rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isOpen ? 'var(--accent-teal)' : 'var(--text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s var(--ease-spring)'
                      }}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <div className={`accordion-panel ${isOpen ? 'is-open' : ''}`}>
                    <div className="accordion-panel-inner">
                      <div style={{ padding: '0 2rem 1.75rem', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom invitation card */}
        <div
          className="double-bezel reveal-item reveal-stagger-2"
          style={{
            background: 'var(--accent-teal-subtle)',
            borderColor: 'rgba(0, 118, 129, 0.25)'
          }}
        >
          <div
            className="double-bezel-inner"
            style={{
              padding: '2.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              background: '#FFFFFF'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Still have a question?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Our welcome team would love to connect with you directly before you visit.
              </p>
            </div>
            <button
              onClick={onOpenPlanVisit}
              className="btn-island btn-teal"
            >
              <span>Connect With A Host</span>
              <div className="btn-icon-bubble">
                <ArrowUpRight size={15} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
