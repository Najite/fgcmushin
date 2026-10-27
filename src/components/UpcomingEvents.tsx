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
    <section id="events" className="section-padding" style={{ position: 'relative', background: '#07090D' }}>
      <div className="container-max">
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
          <div>
            <div className="eyebrow-pill" style={{ marginBottom: '0.85rem' }}>
              <Calendar size={14} />
              <span>GATHERINGS & CALENDAR</span>
            </div>
            <h2 className="heading-h2 font-serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: '#FFFFFF' }}>
              Upcoming <span className="italic-serif">Events</span>
            </h2>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '9999px', border: '1px solid var(--border-subtle)' }}>
            {(['All', 'Worship', 'Community', 'Outreach'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.25s var(--ease-spring)',
                  background: filter === cat ? 'var(--accent-teal)' : 'transparent',
                  color: filter === cat ? '#FFFFFF' : 'var(--text-muted)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Motivation-style Clean Row-based Event Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="double-bezel"
              style={{
                transition: 'all 0.35s var(--ease-spring)'
              }}
            >
              <div
                className="double-bezel-inner"
                style={{
                  padding: '1.75rem 2rem',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1.2fr) minmax(240px, 2.5fr) auto',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}
              >
                {/* Date & Category */}
                <div>
                  <span
                    className="eyebrow-pill"
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.65rem',
                      marginBottom: '0.5rem',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {evt.category}
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {evt.date}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <Clock size={13} />
                    <span>{evt.time}</span>
                  </div>
                </div>

                {/* Event Name & Location */}
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem', lineHeight: 1.25 }}>
                    {evt.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {evt.description}
                  </p>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} color="var(--accent-teal)" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                {/* RSVP Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onRSVP(evt)}
                    className="btn-island btn-ghost"
                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
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
