import React, { useState, useEffect } from 'react';
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
import type { Sermon, ChurchEvent } from './types';
import { FEATURED_SERMON } from './data/churchData';

export const App: React.FC = () => {
  const [isPlanVisitOpen, setIsPlanVisitOpen] = useState(false);
  const [isGivingOpen, setIsGivingOpen] = useState(false);
  const [isPrayerOpen, setIsPrayerOpen] = useState(false);
  const [activeVideoSermon, setActiveVideoSermon] = useState<Sermon | null>(null);

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

    // Run on mount for any items in initial view
    revealVisibleElements();

    // Re-check once layout stabilizes
    const timer1 = setTimeout(revealVisibleElements, 200);

    // IntersectionObserver for native composite triggers
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

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Subtle Analog Texture Filter Overlay */}
      <div className="film-grain-overlay" />

      {/* Top 4-Color Church Emblem Gradient Ribbon */}
      <div className="top-color-ribbon" aria-hidden="true" />

      {/* Top Banner Notice */}
      <AnnouncementBar onOpenPlanVisit={() => setIsPlanVisitOpen(true)} />

      {/* Island Floating Navbar */}
      <Navbar
        onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        onOpenGiving={() => setIsGivingOpen(true)}
        onOpenPrayer={() => setIsPrayerOpen(true)}
        onSelectSection={handleSelectSection}
      />

      <main>
        {/* Cinematic Sanctuary Hero Section */}
        <Hero
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
          onOpenVideoModal={() => setActiveVideoSermon(FEATURED_SERMON)}
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
          onPlaySermon={(sermon) => setActiveVideoSermon(sermon)}
        />

        {/* Ministries Bento Grid */}
        <MinistriesSection
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        />

        {/* Upcoming Events Calendar Stream */}
        <UpcomingEvents
          onRSVP={handleRSVPEvent}
        />

        {/* First Time Visitor FAQ Accordion */}
        <VisitorFaqSection
          onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        />
      </main>

      {/* Multi-column Sanctuary Footer */}
      <Footer
        onOpenPlanVisit={() => setIsPlanVisitOpen(true)}
        onOpenGiving={() => setIsGivingOpen(true)}
        onOpenPrayer={() => setIsPrayerOpen(true)}
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
    </div>
  );
};

export default App;
