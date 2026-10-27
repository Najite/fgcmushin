import type { Sermon, Ministry, ChurchEvent } from '../types';

export const CHURCH_INFO = {
  name: 'Haven Church',
  tagline: 'A Home for Everyone, Everywhere',
  motto: 'Love God. Love People. Change The World.',
  submotto: 'Everyone is welcome. Everyone has a next best step. Everyone can make a difference.',
  address: '3904 Old Ridge Road, Richmond, VA 23234',
  times: [
    { name: 'Sunday Morning 1st Gathering', time: '9:00 AM', description: 'Full Kids ministry & live choir/band' },
    { name: 'Sunday Morning 2nd Gathering', time: '11:15 AM', description: 'Full Kids ministry, Youth gathering & online stream' },
    { name: 'Midweek Crew Night', time: 'Wednesday 7:00 PM', description: 'Youth, young adults, & community groups' }
  ],
  phone: '(804) 555-0192',
  email: 'hello@havenchurch.org',
  socials: {
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    facebook: 'https://facebook.com',
  }
};

export const FEATURED_SERMON: Sermon = {
  id: 'unshakable-pt1',
  title: 'Hope In The Storm',
  series: 'UNSHAKABLE',
  speaker: 'Lead Pastor Marcus Vance',
  date: 'October 25, 2026',
  duration: '38 min',
  passage: 'Hebrews 6:19-20',
  thumbnail: '/images/sermon-series.jpg',
  summary: 'When life feels turbulent and foundations shift, God offers an anchor for the soul that is both sure and steadfast. Discover how genuine hope is not the absence of trouble, but the presence of Christ.',
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
};

export const RECENT_SERMONS: Sermon[] = [
  {
    id: 'unshakable-pt1',
    title: 'Hope In The Storm',
    series: 'UNSHAKABLE',
    speaker: 'Pastor Marcus Vance',
    date: 'Oct 25, 2026',
    duration: '38 min',
    passage: 'Hebrews 6:19-20',
    thumbnail: '/images/sermon-series.jpg',
    summary: 'When circumstances shift, our anchor holds within the veil.'
  },
  {
    id: 'living-generous',
    title: 'Hands Wide Open',
    series: 'KINGDOM HEARTS',
    speaker: 'Pastor Elena Vance',
    date: 'Oct 18, 2026',
    duration: '34 min',
    passage: '2 Corinthians 9:6-11',
    thumbnail: '/images/hero-worship.jpg',
    summary: 'Experiencing the supernatural freedom of a generous posture.'
  },
  {
    id: 'breath-of-life',
    title: 'The Room Shook',
    series: 'EMPOWERED',
    speaker: 'Guest Speaker David Ortiz',
    date: 'Oct 11, 2026',
    duration: '42 min',
    passage: 'Acts 4:23-31',
    thumbnail: '/images/community-welcome.jpg',
    summary: 'What happens when a unified community fervently prays for boldness.'
  }
];

export const MINISTRIES: Ministry[] = [
  {
    id: 'kids',
    title: 'Haven Kids & Littles',
    tagline: 'Where faith begins in wonder and joy',
    ageGroup: 'Infants – 5th Grade',
    schedule: 'Every Sunday at 9:00 AM & 11:15 AM',
    description: 'Safe, background-checked environments designed specifically for children to experience God’s great love through interactive stories, creative crafts, and caring leaders.',
    image: '/images/ministry-kids.jpg',
    lead: 'Sarah Jenkins, Kids Director',
    highlights: ['Secure check-in & parent paging', 'Sensory-friendly spaces', 'Age-appropriate worship & lessons']
  },
  {
    id: 'next-gen',
    title: 'Haven YTH & Students',
    tagline: 'A generation alive for Jesus',
    ageGroup: '6th – 12th Grade',
    schedule: 'Wednesday Nights at 7:00 PM',
    description: 'High energy, authentic friendships, and culturally relevant teaching that empowers students to discover their identity in Christ and lead bold lives.',
    image: '/images/ministry-youth.jpg',
    lead: 'Jordan & Maya Brooks, Youth Pastors',
    highlights: ['Live youth band & worship', 'Small group breakout circles', 'Annual retreats & summer camps']
  },
  {
    id: 'young-adults',
    title: 'Young Adults (YA)',
    tagline: 'Deep roots and authentic connection in the city',
    ageGroup: 'Ages 18 – 30',
    schedule: '1st & 3rd Thursdays at 7:30 PM',
    description: 'College students, creatives, and young professionals gathering around tables for food, Scripture discussion, and mutual encouragement across Richmond.',
    image: '/images/community-welcome.jpg',
    lead: 'Caleb Evans, YA Coordinator',
    highlights: ['City hub dinners', 'Career & vocational mentorship', 'Community retreats']
  },
  {
    id: 'city-care',
    title: 'Haven Cares & Outreach',
    tagline: 'Loving our city with tangible action',
    ageGroup: 'All Ages',
    schedule: 'Monthly City Serve Days',
    description: 'We believe a healthy church blesses the city outside its walls. From weekly food distribution to school partnerships, we serve with dignity and compassion.',
    image: '/images/ministry-outreach.jpg',
    lead: 'Dr. Kimberly Adams, Missions Director',
    highlights: ['Weekly grocery pantry partnership', 'Foster family support network', 'Global mission initiatives']
  }
];

export const UPCOMING_EVENTS: ChurchEvent[] = [
  {
    id: 'crew-night-nov',
    title: 'All-Church Crew Night & Worship',
    date: 'Wednesday, Nov 4, 2026',
    time: '7:00 PM – 8:30 PM',
    location: 'Main Auditorium & Patio',
    category: 'Worship',
    description: 'An extended evening of acoustic worship, prayer for our city, and fellowship with fresh tacos on the patio afterwards.'
  },
  {
    id: 'baptism-sunday',
    title: 'Celebration Baptism Sunday',
    date: 'Sunday, Nov 15, 2026',
    time: 'During 9:00 AM & 11:15 AM Gatherings',
    location: 'Sanctuary Courtyard',
    category: 'Community',
    description: 'Celebrating public declarations of new life in Jesus! If you want to take your next step, sign up today.'
  },
  {
    id: 'thanksgiving-outreach',
    title: 'Feeding the 5,000: City Basket Drive',
    date: 'Saturday, Nov 21, 2026',
    time: '8:30 AM – 1:00 PM',
    location: 'Haven Community Center',
    category: 'Outreach',
    description: 'Packing and delivering 1,200 fresh Thanksgiving meals to families in local neighborhoods.'
  },
  {
    id: 'newcomers-lunch',
    title: 'Newcomers Welcome Luncheon',
    date: 'Sunday, Nov 22, 2026',
    time: '12:45 PM – 2:00 PM',
    location: 'Fireside Room',
    category: 'Community',
    description: 'New to Haven? Meet Pastor Marcus and the team for good food, hear our story, and find your community.'
  }
];

export const VISITOR_FAQS = [
  {
    q: 'What should I wear?',
    a: 'Come as you are! You’ll see everything from casual t-shirts and jeans to Sunday dresses. We care about you, not what you wear.'
  },
  {
    q: 'How long are Sunday gatherings?',
    a: 'Each gathering lasts about 70 minutes. We begin with 20 minutes of vibrant worship music, followed by a welcome, biblical message, and prayer.'
  },
  {
    q: 'What about my kids?',
    a: 'Our Haven Kids team has a clean, safe, and fun environment ready for infants through 5th grade. We recommend arriving 15 minutes early to register.'
  },
  {
    q: 'Where do I park and go when I arrive?',
    a: 'Turn on your hazard lights when you enter the parking lot! Our friendly parking team will guide you to dedicated First-Time Guest parking spaces right near the main entrance.'
  }
];
