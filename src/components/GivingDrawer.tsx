import React, { useState } from 'react';
import { X, Heart, ShieldCheck, Check, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GivingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GivingDrawer: React.FC<GivingDrawerProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState<number | string>(100);
  const [frequency, setFrequency] = useState<'One-Time' | 'Recurring'>('One-Time');
  const [fund, setFund] = useState('Tithes & Offerings');
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const presets = [25, 50, 100, 250, 500];

  const handleGive = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#007681', '#B45309', '#10B981']
    });
    setCompleted(true);
  };

  const handleReset = () => {
    setCompleted(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(21, 26, 33, 0.65)',
        backdropFilter: 'blur(20px)',
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
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="double-bezel-inner" style={{ padding: '2.5rem', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div className="eyebrow-pill gold" style={{ marginBottom: '0.65rem' }}>
                <Heart size={13} />
                <span>GENEROSITY & STEWARDSHIP</span>
              </div>
              <h3 className="heading-h2 font-serif" style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
                {completed ? 'Thank You For Sowing!' : 'Give Generously'}
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

          {!completed ? (
            <form onSubmit={handleGive} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', lineHeight: 1.6 }}>
                Every gift empowers ministry across Richmond, supports families through our local food pantry, and carries the gospel around the world.
              </p>

              {/* Frequency Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#F3EFEA', padding: '4px', borderRadius: '12px' }}>
                {(['One-Time', 'Recurring'] as const).map((freq) => (
                  <button
                    type="button"
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    style={{
                      padding: '0.7rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      background: frequency === freq ? 'var(--accent-teal)' : 'transparent',
                      color: frequency === freq ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    {freq} Gift
                  </button>
                ))}
              </div>

              {/* Amount Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                  Select Gift Amount
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {presets.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setAmount(val)}
                      style={{
                        padding: '0.75rem 0.25rem',
                        borderRadius: '12px',
                        border: Number(amount) === val ? '2px solid var(--accent-teal)' : '1px solid var(--border-medium)',
                        background: Number(amount) === val ? 'var(--accent-teal-subtle)' : '#FAF8F5',
                        color: Number(amount) === val ? 'var(--accent-teal-dark)' : 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 700 }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Other Amount"
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.25rem',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid rgba(0, 0, 0, 0.12)',
                      color: 'var(--text-primary)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Fund Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Designate Fund
                </label>
                <select
                  value={fund}
                  onChange={(e) => setFund(e.target.value)}
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
                >
                  <option value="Tithes & Offerings">General Ministry & Tithes</option>
                  <option value="Haven Cares Outreach">Haven Cares & Local Food Pantry</option>
                  <option value="Next Gen & Youth Camp">Next Gen & Youth Scholarships</option>
                  <option value="Global Missions">Global Church Planting & Missions</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-island btn-teal"
                style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
              >
                <span>Give ${amount} {frequency === 'Recurring' ? '/ Month' : 'Now'}</span>
                <ArrowUpRight size={17} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <ShieldCheck size={14} color="var(--accent-teal)" />
                <span>256-Bit SSL Encrypted • 501(c)(3) Tax-Deductible</span>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Your Generosity Changes Lives
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.975rem', maxWidth: '440px', margin: '0 auto' }}>
                We received your gift of <strong style={{ color: 'var(--text-primary)' }}>${amount}</strong> designated to <strong style={{ color: 'var(--accent-teal)' }}>{fund}</strong>. A tax-deductible receipt has been dispatched to your email.
              </p>

              <button
                onClick={handleReset}
                className="btn-island btn-ghost"
                style={{ alignSelf: 'center', marginTop: '1rem' }}
              >
                <span>Close</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
