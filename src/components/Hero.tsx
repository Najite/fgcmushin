import React, { useState } from 'react';
import { Play, ArrowUpRight, MapPin, Clock, Check, Sparkles } from 'lucide-react';
import { CHURCH_INFO } from '../data/churchData';

interface HeroProps {
  onOpenPlanVisit: () => void;
  onOpenVideoModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenPlanVisit, onOpenVideoModal }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CHURCH_INFO.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '7rem 1.5rem 5rem',
        overflow: 'hidden'
      }}
    >
      {/* Background Cinematic Visual with Multi-Layer Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        <img
          src="/images/hero-worship.jpg"
          alt="Haven Church worship gathering"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 35%',
            filter: 'brightness(0.55) contrast(1.1) saturate(1.15)',
            transform: 'scale(1.03)',
            transition: 'transform 10s ease-out'
          }}
        />

        {/* Ambient Radial Vignette & Atmospheric Fog */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at 50% 30%, rgba(0, 135, 147, 0.22) 0%, transparent 60%),
              radial-gradient(circle at 80% 80%, rgba(26, 86, 219, 0.25) 0%, transparent 50%),
              linear-gradient(180deg, rgba(7, 9, 13, 0.6) 0%, rgba(7, 9, 13, 0.3) 40%, rgba(7, 9, 13, 0.95) 90%, #07090D 100%)
            `
          }}
        />
      </div>

      {/* Main Content Container */}
      <div
        className="container-max"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Eyebrow Badge (Brooklake & Motivation Style) */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="eyebrow-pill" style={{ backdropFilter: 'blur(16px)', background: 'rgba(0, 135, 147, 0.2)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E5FF', display: 'inline-block', boxShadow: '0 0 10px #00E5FF' }}></span>
            <span>IN OUR CITY AS IT IS IN HEAVEN</span>
          </div>
        </div>

        {/* Grand Headline with Editorial Contrast Typography */}
        <h1
          className="heading-display"
          style={{
            fontSize: 'clamp(2.5rem, 6.5vw, 5.25rem)',
            maxWidth: '1000px',
            color: '#FFFFFF',
            marginBottom: '1.5rem',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
          }}
        >
          Making Jesus known to <span className="italic-serif">Everyone,</span> Everywhere.
        </h1>

        {/* Subtitle Inspired by Brooklake & Motivation */}
        <p
          style={{
            fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            fontWeight: 400
          }}
        >
          Everyone is welcome. Everyone has a next best step. Everyone can make a difference.
        </p>

        {/* Dual Island Action Buttons (Button-in-Button Architecture) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            marginBottom: '3.5rem'
          }}
        >
          <button
            onClick={onOpenPlanVisit}
            className="btn-island btn-primary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1.025rem' }}
          >
            <span>Plan Your Sunday Visit</span>
            <div className="btn-icon-bubble">
              <ArrowUpRight size={17} />
            </div>
          </button>

          <button
            onClick={onOpenVideoModal}
            className="btn-island btn-ghost"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1.025rem' }}
          >
            <span>Watch Live / Sermons</span>
            <div className="btn-icon-bubble" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              <Play size={14} fill="#FFFFFF" />
            </div>
          </button>
        </div>

        {/* Double-Bezel Floating Gathering Times Bar */}
        <div
          className="double-bezel"
          style={{
            maxWidth: '780px',
            width: '100%',
            background: 'rgba(10, 14, 20, 0.75)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div
            className="double-bezel-inner"
            style={{
              padding: '1.25rem 2rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
              background: 'rgba(14, 19, 26, 0.85)'
            }}
          >
            {/* Service Times */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--accent-teal-subtle)',
                  border: '1px solid rgba(0, 135, 147, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-teal-light)'
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 600 }}>
                  This Sunday Morning
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                  9:00 AM <span style={{ color: 'var(--accent-gold)' }}>&</span> 11:15 AM
                </div>
              </div>
            </div>

            {/* Address with One-Click Copy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Sanctuary Campus
                </div>
                <button
                  onClick={handleCopyAddress}
                  title="Click to copy address"
                  style={{
                    fontSize: '0.925rem',
                    fontWeight: 600,
                    color: copied ? '#4ADE80' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <span>3904 Old Ridge Rd</span>
                  {copied ? <Check size={14} color="#4ADE80" /> : <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal-light)' }}>(Copy)</span>}
                </button>
              </div>
            </div>

            {/* Quick Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="eyebrow-pill gold" style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem' }}>
                <Sparkles size={12} />
                <span>Haven Kids Open</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
