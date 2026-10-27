import React, { useState } from 'react';
import { Play, ArrowUpRight, MapPin, Clock, Check, Copy, ChevronDown } from 'lucide-react';
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
        padding: '6.5rem 1.5rem 4rem',
        overflow: 'hidden'
      }}
    >
      {/* Background Luminous Sunlit Sanctuary Visual */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        <img
          src="/images/hero-sunlit.jpg"
          alt="Haven Church sunlit morning sanctuary"
          className="animate-hero-bg"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            filter: 'brightness(1.02) contrast(1.02)'
          }}
        />

        {/* Luminous Light Atmospheric Gradient with gentle sunbeam pulse */}
        <div
          className="animate-hero-sunbeam"
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(180deg, 
                rgba(250, 248, 245, 0.65) 0%, 
                rgba(250, 248, 245, 0.82) 40%, 
                rgba(250, 248, 245, 0.96) 85%, 
                #FAF8F5 100%)
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
        {/* Eyebrow Badge (Brooklake Style Light Pill with Pulsing Beacon) */}
        <div className="animate-hero-eyebrow" style={{ marginBottom: '1.75rem' }}>
          <div className="eyebrow-pill" style={{ background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 10px rgba(0, 118, 129, 0.12)' }}>
            <span className="hero-beacon-dot"></span>
            <span>IN OUR CITY AS IT IS IN HEAVEN</span>
          </div>
        </div>

        {/* Grand Headline with Editorial Contrast Typography & Gentle Shimmer */}
        <h1
          className="heading-display animate-hero-title"
          style={{
            fontSize: 'clamp(2.6rem, 6.5vw, 5.4rem)',
            maxWidth: '1020px',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            lineHeight: 1.08
          }}
        >
          Making Jesus known to <span className="italic-serif hero-shimmer-text">Everyone,</span> Everywhere.
        </h1>

        {/* Subtitle Inspired by Brooklake & Motivation */}
        <p
          className="animate-hero-sub"
          style={{
            fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            fontWeight: 400
          }}
        >
          Everyone is welcome. Everyone has a next best step. Everyone can make a difference.
        </p>

        {/* Dual Island Action Buttons */}
        <div
          className="animate-hero-cta"
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
            className="btn-island btn-teal"
            style={{ padding: '0.9rem 1.85rem', fontSize: '1.025rem' }}
          >
            <span>Plan Your Sunday Visit</span>
            <div className="btn-icon-bubble">
              <ArrowUpRight size={17} />
            </div>
          </button>

          <button
            onClick={onOpenVideoModal}
            className="btn-island btn-ghost"
            style={{ padding: '0.9rem 1.85rem', fontSize: '1.025rem' }}
          >
            <span>Watch Live / Sermons</span>
            <div className="btn-icon-bubble">
              <Play size={14} fill="var(--accent-teal)" color="var(--accent-teal)" />
            </div>
          </button>
        </div>

        {/* Double-Bezel Floating Gathering Times Bar in Light Theme */}
        <div
          className="double-bezel animate-hero-card"
          style={{
            maxWidth: '800px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-ambient)'
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
              background: '#FFFFFF'
            }}
          >
            {/* Service Times */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--accent-teal-subtle)',
                  border: '1px solid rgba(0, 118, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-teal)'
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  This Sunday Morning
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  9:00 AM <span style={{ color: 'var(--accent-teal)' }}>&</span> 11:15 AM
                </div>
              </div>
            </div>

            {/* Address with One-Click Copy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textAlign: 'left' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.04)',
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
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Sanctuary Campus
                </div>
                <button
                  onClick={handleCopyAddress}
                  title="Click to copy address"
                  style={{
                    fontSize: '0.925rem',
                    fontWeight: 700,
                    color: copied ? '#059669' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <span>3904 Old Ridge Rd</span>
                  {copied ? <Check size={14} color="#059669" /> : <Copy size={13} color="var(--accent-teal)" />}
                </button>
              </div>
            </div>

            {/* Quick Badge with live pulse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="eyebrow-pill gold" style={{ fontSize: '0.725rem', padding: '0.35rem 0.85rem' }}>
                <span className="hero-beacon-dot" style={{ background: '#B45309', width: '6px', height: '6px' }}></span>
                <span>Haven Kids Open</span>
              </span>
            </div>
          </div>
        </div>

        {/* Subtle Floating Scroll-Down Cue */}
        <div className="animate-hero-scroll" style={{ marginTop: '2.5rem' }}>
          <a
            href="#welcome"
            className="hero-scroll-float"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.725rem',
              letterSpacing: '0.14em',
              fontWeight: 700,
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-teal)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <span>Scroll to Explore</span>
            <ChevronDown size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};
