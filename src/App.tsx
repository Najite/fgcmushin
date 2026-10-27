import React, { useState, useEffect, useCallback } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { WelcomeSection } from './components/WelcomeSection';
import { SermonSpotlight } from './components/SermonSpotlight';
import { MinistriesSection } from './components/MinistriesSection';
import { UpcomingEvents } from './components/UpcomingEvents';
import { VisitorFaqSection } from './components/VisitorFaqSection';
import { Footer } from './components/Footer';
import { FloatingServicePill } from './components/FloatingServicePill';
import { PlanVisitModal } from './components/PlanVisitModal';
import { SermonVideoModal } from './components/SermonVideoModal';
import { PrayerRequestModal } from './components/PrayerRequestModal';
import { GivingDrawer } from './components/GivingDrawer';
import { AdminPortal } from './components/AdminPortal';
import type { Sermon, ChurchEvent } from './types';
import type { ChurchSettingsRow } from './types/database';
import { FEATURED_SERMON, RECENT_SERMONS, UPCOMING_EVENTS } from './data/churchData';
import { getChurchSettings, getSermons, getEvents } from './lib/supabase';

export const App: React.FC = () => {
  const [isPlanVisitOpen, setIsPlanVisitOpen] = useState(false);
  const [isGivingOpen, setIsGivingOpen] = useState(false);
  const [isPrayerOpen, setIsPrayerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeVideoSermon, setActiveVideoSermon] = useState<Sermon | null>(null);

  // Live Supabase dynamic data with bundled defaults fallback
  const [sermons, setSermons] = useState<Sermon[]>(RECENT_SERMONS);
  const [events, setEvents] = useState<ChurchEvent[]>(UPCOMING_EVENTS);
  const [churchSettings, setChurchSettings] = useState<ChurchSettingsRow | null>(null);

  const loadSupabaseData = useCallback(async () => {
    try {
      const [settings, fetchedSermons, fetchedEvents] = await Promise.all([
        getChurchSettings(),
        getSermons(),
        getEvents()
      ]);
      if (settings) setChurchSettings(settings);
      if (fetchedSermons && fetchedSermons.length > 0) setSermons(fetchedSermons);
      if (fetchedEvents && fetchedEvents.length > 0) setEvents(fetchedEvents);
    } catch (err) {
      console.warn('Supabase data load note:', err);
    }
  }, []);

  useEffect(() => {
    loadSupabaseData();
  }, [loadSupabaseData]);

  useEffect(() => {
    const REVEAL_SELECTOR = '.reveal-item:not(.is-revealed), .reveal-curtain-photo:not(.is-revealed), .reveal-drift-left:not(.is-revealed), .reveal-scale-card:not(.is-revealed), .reveal-fade-up:not(.is-revealed)';

    const revealVisibleElements = () => {
      const items = document.querySelectorAll(REVEAL_SELECTOR);
      const windowHeight = window.innerHeight;
      const triggerThreshold = windowHeight * 0.90;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top <= triggerThreshold && rect.bottom >= 0) {
          item.classList.add('is-revealed');
        }
      });
    };

    revealVisibleElements();
    const timer1 = setTimeout(revealVisibleElements, 200);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '0px 0px -50px 0px',
          threshold: 0.08
        }
      );

      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        observer?.observe(el);
      });
    }

    window.addEventListener('scroll', revealVisibleElements, { passive: true });
    window.addEventListener('resize', revealVisibleElements, { passive: true });

    return () => {
      clearTimeout(timer1);
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', revealVisibleElements);
      window.removeEventListener('resize', revealVisibleElements);
    };
  }, []);

  const handleSelectSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRSVPEvent = (_event: ChurchEvent) => {
    setIsPlanVisitOpen(true);
  };

  const featuredSermon = sermons.length > 0 ? sermons[0] : FEATURED_SERMON;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Subtle Analog Texture Filter Overlay */}
      <div className="film-grain-overlay" />

      {/* Top 4-Color Church Emblem Gradient Ribbon */}
      <div className="top-color-ribbon" aria-hidden="true" />

      {/* Top Banner Notice with Supabase Live Sync */}
      <AnnouncementBar
        onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        announcementText={churchSettings?.announcement_text || undefined}
        isActive={churchSettings?.announcement_active ?? true}
      />

      {/* Island Floating Navbar */}
      <Navbar
        onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        onOpenGiving={() => setIsGivingOpen(true)}
        onOpenPrayer={() => setIsPrayerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectSection={handleSelectSection}
      />

      <main>
        {/* Cinematic Sanctuary Hero Section */}
        <Hero
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
          onOpenVideoModal={() => setActiveVideoSermon(featuredSermon)}
        />

        {/* Continuous Typographic Ticker Marquee */}
        <Marquee />

        {/* "We're People Just Like You" Authentic Story & Pillars */}
        <WelcomeSection
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
          onOpenPrayer={() => setIsPrayerOpen(true)}
        />

        {/* Featured Message & Archive */}
        <SermonSpotlight
          sermons={sermons}
          onPlaySermon={(sermon) => setActiveVideoSermon(sermon)}
        />

        {/* Ministries Bento Grid */}
        <MinistriesSection
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        />

        {/* Upcoming Events Calendar Stream */}
        <UpcomingEvents
          events={events}
          onRSVP={handleRSVPEvent}
        />

        {/* First Time Visitor FAQ Accordion */}
        <VisitorFaqSection
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        />
      </main>

      {/* Multi-column Sanctuary Footer with Staff CMS entry */}
      <Footer
        onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        onOpenGiving={() => setIsGivingOpen(true)}
        onOpenPrayer={() => setIsPrayerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectSection={handleSelectSection}
      />

      {/* Floating Bottom Gathering Countdown & Location Pill */}
      <FloatingServicePill
        onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
      />

      {/* Interactive First-Time Guest Flow Modal */}
      <PlanVisitModal
        isOpen={isPlanVisitOpen}
        onClose={() => setIsPlanVisitOpen(false)}
      />

      {/* Message Video & Study Guide Modal */}
      <SermonVideoModal
        sermon={activeVideoSermon}
        onClose={() => setActiveVideoSermon(null)}
        onOpenPrayer={() => setIsPrayerOpen(true)}
      />

      {/* Pastoral Care & Prayer Request Modal */}
      <PrayerRequestModal
        isOpen={isPrayerOpen}
        onClose={() => setIsPrayerOpen(false)}
      />

      {/* Stewardship Giving Drawer */}
      <GivingDrawer
        isOpen={isGivingOpen}
        onClose={() => setIsGivingOpen(false)}
      />

      {/* Staff & Pastoral Content Management Portal (CMS) */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        sermons={sermons}
        events={events}
        churchSettings={churchSettings}
        onDataRefresh={loadSupabaseData}
      />
    </div>
  );
};

export default App;
