import React, { useState } from 'react';
import { X, Check, Clock, Sparkles, Coffee, Car, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlanVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanVisitModal: React.FC<PlanVisitModalProps> = ({ isOpen, onClose }) => {
  const [serviceTime, setServiceTime] = useState<'9:00 AM' | '11:15 AM'>('11:15 AM');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#008793', '#FFE082', '#1A56DB', '#FFFFFF']
    });

    setHasSubmitted(true);
  };

  const handleReset = () => {
    setHasSubmitted(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
      onClick={handleReset}
    >
      <div
        className="double-bezel"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="double-bezel-inner" style={{ padding: '2.5rem', background: '#0F141C' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div className="eyebrow-pill gold" style={{ marginBottom: '0.65rem' }}>
                <Sparkles size={13} />
                <span>FIRST TIME GUEST EXPERIENCE</span>
              </div>
              <h3 className="heading-h2 font-serif" style={{ fontSize: '2.2rem', color: '#FFFFFF', lineHeight: 1.15 }}>
                {hasSubmitted ? "We're Ready for You!" : "Plan Your Sunday Visit"}
              </h3>
            </div>
            <button
              onClick={handleReset}
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

          {!hasSubmitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Let us know you’re coming! We’ll have a VIP parking spot reserved, a dedicated host to show you around, and a welcome gift + fresh coffee waiting at the Welcome Center.
              </p>

              {/* Step 1: Choose Gathering Time */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  1. Select Gathering Time
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {(['9:00 AM', '11:15 AM'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setServiceTime(t)}
                      style={{
                        padding: '1rem',
                        borderRadius: '14px',
                        border: serviceTime === t ? '2px solid var(--accent-teal)' : '1px solid var(--border-subtle)',
                        background: serviceTime === t ? 'rgba(0, 135, 147, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Clock size={16} color={serviceTime === t ? 'var(--accent-teal-light)' : 'var(--text-muted)'} />
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Marcus & Sarah Johnson"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="marcus@example.com"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Phone (for VIP parking text)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(804) 555-0199"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Party Size & Kids */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Number of Adults
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Kids (Infant - 5th Grade)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setKids(Math.max(0, kids - 1))}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>{kids}</span>
                    <button
                      type="button"
                      onClick={() => setKids(kids + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-island btn-teal"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
              >
                <span>Reserve My VIP Welcome Experience</span>
                <Check size={18} />
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0, 135, 147, 0.2)',
                  border: '2px solid var(--accent-teal-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'var(--accent-teal-light)'
                }}
              >
                <Check size={32} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  You’re On The Guest List, {fullName}!
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
                  We’ve reserved seats for your party of {adults + kids} on Sunday at {serviceTime}. Check your inbox at <strong style={{ color: '#FFFFFF' }}>{email}</strong> for parking directions and your VIP host contact.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFFFFF', fontSize: '0.9rem' }}>
                  <Car size={18} color="var(--accent-teal-light)" />
                  <span>Turn your hazard lights on at the entrance for VIP parking.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFFFFF', fontSize: '0.9rem' }}>
                  <Coffee size={18} color="var(--accent-gold)" />
                  <span>Fresh espresso & iced drinks waiting at the Welcome Kiosk.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#FFFFFF', fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} color="var(--accent-teal-light)" />
                  <span>Haven Kids is pre-notified for instant check-in.</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="btn-island btn-ghost"
                style={{ alignSelf: 'center' }}
              >
                <span>Done & Return to Site</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
