import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { UPCOMING_EVENTS } from '../data/churchData';
import type { ChurchEvent } from '../types';

interface UpcomingEventsProps {
  onRSVP: (event: ChurchEvent) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ onRSVP }) => {
  const [filter, setFilter] = useState<'All' | 'Worship' | 'Community' | 'Outreach'>('All');

  const filteredEvents = filter === 'All'
    ? UPCOMING_EVENTS
    : UPCOMING_EVENTS.filter((e) => e.category === filter);

  return (
    <section id="events" className="section-padding" style={{ position: 'relative', background: '#FAF8F5' }}>
      <div className="container-max">
        {/* Section Header */}
        <div className="reveal-item" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
          <div>
            <div className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <Calendar size={14} />
              <span>GATHERINGS & CALENDAR</span>
            </div>
            <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: 'var(--text-primary)' }}>
              Upcoming <span className="italic-serif">Events</span>
            </h2>
          </div>

          {/* Filter Tabs in Light Theme */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: '#FFFFFF', padding: '4px', borderRadius: '9999px', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            {(['All', 'Worship', 'Community', 'Outreach'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '0.5rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  transition: 'all 0.25s var(--ease-spring)',
                  background: filter === cat ? 'var(--accent-teal)' : 'transparent',
                  color: filter === cat ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Row-based Event Stream in Light Theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredEvents.map((evt, idx) => (
            <div
              key={evt.id}
              className={`double-bezel reveal-item reveal-stagger-${(idx % 3) + 1}`}
              style={{
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div
                className="double-bezel-inner"
                style={{
                  padding: '1.75rem 2rem',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1.2fr) minmax(240px, 2.5fr) auto',
                  alignItems: 'center',
                  gap: '1.5rem',
                  background: '#FFFFFF'
                }}
              >
                {/* Date & Category */}
                <div>
                  <span
                    className="eyebrow-pill"
                    style={{
                      fontSize: '0.725rem',
                      padding: '0.25rem 0.65rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {evt.category}
                  </span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {evt.date}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--accent-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <Clock size={14} />
                    <span>{evt.time}</span>
                  </div>
                </div>

                {/* Event Name & Location */}
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.25 }}>
                    {evt.title}
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {evt.description}
                  </p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--accent-teal)" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                {/* RSVP Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onRSVP(evt)}
                    className="btn-island btn-ghost"
                    style={{ padding: '0.65rem 1.35rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  >
                    <span>Save Spot / RSVP</span>
                    <div className="btn-icon-bubble">
                      <ArrowUpRight size={13} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
