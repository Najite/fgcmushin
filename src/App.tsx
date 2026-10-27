import React, { useState } from 'react';
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
