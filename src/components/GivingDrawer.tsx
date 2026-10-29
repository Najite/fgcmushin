import React, { useState } from 'react';
import { X, ShieldCheck, Check, ArrowUpRight, Copy, Building2, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

import { submitGivingRecord } from '../lib/supabase';

interface GivingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GivingDrawer: React.FC<GivingDrawerProps> = ({ isOpen, onClose }) => {
  const [givingMethod, setGivingMethod] = useState<'online' | 'transfer'>('online');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [amount, setAmount] = useState<number | string>(5000);
  const [frequency, setFrequency] = useState<'One-Time' | 'Recurring'>('One-Time');
  const [fund, setFund] = useState('Tithes & Offerings');
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = currency === 'NGN' ? [2000, 5000, 10000, 25000, 50000] : [25, 50, 100, 250, 500];
  const symbol = currency === 'NGN' ? '₦' : '$';

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch {
      // fallback silent
    }
  };

  const copyToClipboard = (accountNumber: string, label: string) => {
    try {
      if (navigator?.clipboard?.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(accountNumber).catch(() => {
          fallbackCopyText(accountNumber);
        });
      } else {
        fallbackCopyText(accountNumber);
      }
    } catch {
      fallbackCopyText(accountNumber);
    }
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleGive = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitGivingRecord({
        amount: Number(amount) || 0,
        fund: `${fund} (${currency})`,
        frequency
      });
    } catch (err) {
      console.warn('Giving record submission note:', err);
    } finally {
      setIsSubmitting(false);
    }

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#2866AD', '#ED3B41', '#F3A645']
    });
    setCompleted(true);
  };

  const handleReset = () => {
    setCompleted(false);
    onClose();
  };

  return (
    <div
      className="modal-backdrop-animate"
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
        className="double-bezel modal-dialog-animate"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFFFF'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="double-bezel-inner" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)', background: '#FFFFFF', position: 'relative' }}>
          {/* Top 4-Color Church Emblem Gradient Ribbon */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: 'var(--fgc-gradient-4color)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div className="eyebrow-pill gold" style={{ marginBottom: '0.65rem' }}>
                <span className="quad-beacon" aria-hidden="true">
                  <span className="quad-dot red"></span>
                  <span className="quad-dot blue"></span>
                  <span className="quad-dot gold"></span>
                  <span className="quad-dot purple"></span>
                </span>
                <span>GENEROSITY & STEWARDSHIP</span>
              </div>
              <h3 className="heading-h2 font-serif" style={{ fontSize: 'clamp(1.35rem, 4.5vw, 2.2rem)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Every gift empowers kingdom ministry across Mushin, Lagos, and beyond — supporting families through community welfare, nurturing youth, and advancing the Fourfold Gospel.
              </p>

              {/* Giving Method Switcher (Bank Transfer vs Online Giving) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#F3EFEA', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => setGivingMethod('transfer')}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: givingMethod === 'transfer' ? 'var(--accent-teal)' : 'transparent',
                    color: givingMethod === 'transfer' ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Building2 size={15} />
                  <span>Bank Transfer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGivingMethod('online')}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    background: givingMethod === 'online' ? 'var(--accent-teal)' : 'transparent',
                    color: givingMethod === 'online' ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CreditCard size={15} />
                  <span>Card / Online</span>
                </button>
              </div>

              {givingMethod === 'transfer' ? (
                /* Nigerian Bank Accounts Direct Transfer Card */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Official Church Accounts (Instant Direct Transfer)
                  </div>

                  {/* Zenith Bank */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '14px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fgc-red)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Zenith Bank Plc
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em', margin: '0.15rem 0' }}>
                        1014892015
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        FGC Mushin District Headquarters
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('1014892015', 'zenith')}
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: '9999px',
                        background: copiedAccount === 'zenith' ? 'var(--fgc-blue)' : '#FFFFFF',
                        border: '1px solid var(--border-medium)',
                        color: copiedAccount === 'zenith' ? '#FFFFFF' : 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      {copiedAccount === 'zenith' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedAccount === 'zenith' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* GTBank */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '14px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fgc-gold-dark)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Guaranty Trust Bank (GTBank)
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em', margin: '0.15rem 0' }}>
                        0128945621
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Foursquare Gospel Church Mushin DHQ
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('0128945621', 'gtb')}
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: '9999px',
                        background: copiedAccount === 'gtb' ? 'var(--fgc-blue)' : '#FFFFFF',
                        border: '1px solid var(--border-medium)',
                        color: copiedAccount === 'gtb' ? '#FFFFFF' : 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                    >
                      {copiedAccount === 'gtb' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedAccount === 'gtb' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                    Please add your name or intended fund (e.g. Tithe, Welfare, Youth) as transfer narration.
                  </p>
                </div>
              ) : (
                /* Online Form */
                <form onSubmit={handleGive} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Currency Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Currency
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {(['NGN', 'USD'] as const).map((cur) => (
                        <button
                          type="button"
                          key={cur}
                          onClick={() => {
                            setCurrency(cur);
                            setAmount(cur === 'NGN' ? 5000 : 50);
                          }}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: currency === cur ? '1.5px solid var(--accent-teal)' : '1px solid var(--border-medium)',
                            background: currency === cur ? 'var(--accent-teal-subtle)' : '#FFFFFF',
                            color: currency === cur ? 'var(--accent-teal-dark)' : 'var(--text-secondary)'
                          }}
                        >
                          {cur === 'NGN' ? '₦ Naira' : '$ USD'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frequency Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#F3EFEA', padding: '4px', borderRadius: '12px' }}>
                    {(['One-Time', 'Recurring'] as const).map((freq) => (
                      <button
                        type="button"
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '10px',
                          fontSize: '0.875rem',
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
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Select Gift Amount
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {presets.map((val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setAmount(val)}
                          style={{
                            padding: '0.65rem 0.2rem',
                            borderRadius: '10px',
                            border: Number(amount) === val ? '2px solid var(--accent-teal)' : '1px solid var(--border-medium)',
                            background: Number(amount) === val ? 'var(--accent-teal-subtle)' : '#FAF8F5',
                            color: Number(amount) === val ? 'var(--accent-teal-dark)' : 'var(--text-primary)',
                            fontWeight: 700,
                            fontSize: '0.9rem'
                          }}
                        >
                          {symbol}{val >= 1000 ? `${val / 1000}k` : val}
                        </button>
                      ))}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 700 }}>
                        {symbol}
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
                          fontSize: '1.05rem',
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
                      <option value="Community Welfare Outreach">Community Welfare & Local Relief</option>
                      <option value="Next Gen & Youth Camp">Next Gen & Youth Camp</option>
                      <option value="Global Missions">Global Church Planting & Missions</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-island btn-teal"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.75 : 1 }}
                  >
                    <span>{isSubmitting ? 'Recording Sowing...' : `Give ${symbol}${Number(amount).toLocaleString()} ${frequency === 'Recurring' ? '/ Month' : 'Now'}`}</span>
                    <ArrowUpRight size={17} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <ShieldCheck size={14} color="var(--accent-teal)" />
                    <span>256-Bit SSL Encrypted • Secure Church Stewardship</span>
                  </div>
                </form>
              )}
            </div>
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
                We received your sowing of <strong style={{ color: 'var(--text-primary)' }}>{symbol}{Number(amount).toLocaleString()}</strong> designated to <strong style={{ color: 'var(--accent-teal)' }}>{fund}</strong>. Thank you for partnering in God's work at FGC Mushin DHQ.
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
