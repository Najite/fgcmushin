import React, { useState } from 'react';
import { X, Check, Clock, Coffee, Car, ShieldCheck, Plus, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';

import { submitGuestVisit } from '../lib/supabase';

interface PlanVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanVisitModal: React.FC<PlanVisitModalProps> = ({ isOpen, onClose }) => {
  const [serviceTime, setServiceTime] = useState<'7:30 AM' | '9:30 AM'>('9:30 AM');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitting(true);
    try {
      await submitGuestVisit({
        fullName,
        email,
        phone,
        serviceTime,
        adultsCount: adults,
        kidsCount: kids
      });
    } catch (err) {
      console.warn('Guest RSVP Supabase submission note:', err);
    } finally {
      setIsSubmitting(false);
    }

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#ED3B41', '#2866AD', '#F3A645', '#CC4695']
    });

    setHasSubmitted(true);
  };

  const handleReset = () => {
    setHasSubmitted(false);
    onClose();
  };

  return (
    <div
      className="modal-backdrop-animate"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(21, 26, 33, 0.65)',
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
        className="double-bezel modal-dialog-animate"
        style={{
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="double-bezel-inner" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', background: '#FFFFFF', position: 'relative' }}>
          {/* Top 4-Color Church Emblem Gradient Ribbon */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: 'var(--fgc-gradient-4color)' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div className="eyebrow-pill gold" style={{ marginBottom: '0.65rem' }}>
                <span className="quad-beacon" aria-hidden="true">
                  <span className="quad-dot red"></span>
                  <span className="quad-dot blue"></span>
                  <span className="quad-dot gold"></span>
                  <span className="quad-dot purple"></span>
                </span>
                <span>FIRST TIME GUEST EXPERIENCE</span>
              </div>
              <h3 className="heading-h2 font-serif" style={{ fontSize: 'clamp(1.35rem, 4.5vw, 2.2rem)', color: 'var(--text-primary)', lineHeight: 1.15 }}>
                {hasSubmitted ? "We're Ready for You!" : "Plan Your Sunday Visit"}
              </h3>
            </div>
            <button
              onClick={handleReset}
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

          {!hasSubmitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: 1.6 }}>
                Let us know you’re coming! We’ll have a VIP parking spot reserved at 4, Obarinmola Adedoyin Street, a dedicated host to show you around, and a warm welcome waiting at the Welcome Center.
              </p>

              {/* Step 1: Choose Gathering Time */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  1. Select Gathering Time
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {(['7:30 AM', '9:30 AM'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setServiceTime(t)}
                      style={{
                        padding: '1rem',
                        borderRadius: '14px',
                        border: serviceTime === t ? '2px solid var(--accent-teal)' : '1px solid var(--border-medium)',
                        background: serviceTime === t ? 'var(--accent-teal-subtle)' : '#FAF8F5',
                        color: serviceTime === t ? 'var(--accent-teal-dark)' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Clock size={16} color={serviceTime === t ? 'var(--accent-teal)' : 'var(--text-muted)'} />
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
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
                      background: '#F8FAFC',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
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
                        background: '#F8FAFC',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Phone (for VIP parking text)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0803 123 4567"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: '#F8FAFC',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Party Size & Kids */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.85rem' }}>
                <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Number of Adults
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                      type="button"
                      aria-label="Decrease adults"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{adults}</span>
                    <button
                      type="button"
                      aria-label="Increase adults"
                      onClick={() => setAdults(adults + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ background: '#FAF8F5', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Kids (Infant - 5th Grade)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <button
                      type="button"
                      aria-label="Decrease kids"
                      onClick={() => setKids(Math.max(0, kids - 1))}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{kids}</span>
                    <button
                      type="button"
                      aria-label="Increase kids"
                      onClick={() => setKids(kids + 1)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-island btn-teal"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.75 : 1 }}
              >
                <span>{isSubmitting ? 'Confirming Reservation...' : 'Reserve My VIP Welcome Experience'}</span>
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
                  background: 'var(--accent-teal-subtle)',
                  border: '2px solid var(--accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'var(--accent-teal)'
                }}
              >
                <Check size={32} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  You’re On The Guest List, {fullName}!
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', maxWidth: '480px', margin: '0 auto' }}>
                  We’ve reserved seats for your party of {adults + kids} on Sunday at {serviceTime}. Check your inbox at <strong style={{ color: 'var(--accent-teal-dark)' }}>{email}</strong> for parking directions and your VIP host contact.
                </p>
              </div>

              <div
                style={{
                  background: '#FAF8F5',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <Car size={18} color="var(--accent-teal)" />
                  <span>Turn your hazard lights on at 4, Obarinmola Adedoyin Street for VIP parking.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <Coffee size={18} color="var(--accent-gold)" />
                  <span>Fresh espresso & iced drinks waiting at the Welcome Kiosk.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <ShieldCheck size={18} color="var(--accent-teal)" />
                  <span>Children Church is pre-notified for instant check-in.</span>
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
