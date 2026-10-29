import type { Sermon, Ministry, ChurchEvent } from '../types';

export const CHURCH_INFO = {
  name: 'FGC Mushin DHQ',
  fullName: 'Foursquare Gospel Church Mushin District Headquarters',
  tagline: 'Jesus Christ, the Same Yesterday, Today, and Forever',
  motto: 'Jesus the Savior • Jesus the Healer • Jesus the Baptizer with the Holy Spirit • Jesus the Soon-Coming King',
  submotto: 'Everyone is welcome. Everyone has a next best step. Everyone can make a difference.',
  address: '4, Obarinmola Adedoyin Street, Mushin, Idi Oro, Lagos, Nigeria',
  shortAddress: '4, Obarinmola Adedoyin St, Idi-Oro, Mushin',
  times: [
    { name: '1st Celebration Service', time: '7:30 AM', description: 'Early glory worship, children church & word' },
    { name: '2nd Celebration Service', time: '9:30 AM', description: 'Full choir worship, teens church & online broadcast' },
    { name: 'Midweek Faith & Power Service', time: 'Wednesday 6:00 PM', description: 'Bible study, intercessory prayer & community' }
  ],
  phone: '+234 1 234 5678',
  email: 'info@fgcmushin.org',
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
  speaker: 'Rev. O. Adebayo (District Overseer)',
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
    speaker: 'Rev. O. Adebayo',
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
    speaker: 'Pastor (Mrs.) Toyin Adebayo',
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
    speaker: 'Pastor Emmanuel Kalu',
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
    title: 'Children Church & Littles',
    tagline: 'Where faith begins in wonder and joy',
    ageGroup: 'Infants – 5th Grade',
    schedule: 'Every Sunday at 7:30 AM & 9:30 AM',
    description: 'Safe, background-checked environments designed specifically for children to experience God’s great love through interactive stories, creative crafts, and caring leaders.',
    image: '/images/ministry-kids.jpg',
    lead: 'Deaconess Funmi Adeleke, Children Church Director',
    highlights: ['Secure check-in & parent paging', 'Sensory-friendly spaces', 'Age-appropriate worship & lessons']
  },
  {
    id: 'next-gen',
    title: 'FGC Youth & Teens',
    tagline: 'A generation alive for Jesus',
    ageGroup: 'Teens & Secondary Students',
    schedule: 'Wednesday Evenings at 6:00 PM',
    description: 'High energy, authentic friendships, and culturally relevant teaching that empowers students to discover their identity in Christ and lead bold lives.',
    image: '/images/ministry-youth.jpg',
    lead: 'Pastor & Mrs. Tunde Ogundipe, Youth Pastors',
    highlights: ['Live youth worship', 'Small group breakout circles', 'Annual retreats & camps']
  },
  {
    id: 'young-adults',
    title: 'Young Adults (YA)',
    tagline: 'Deep roots and authentic connection in the city',
    ageGroup: 'Ages 18 – 35',
    schedule: '1st & 3rd Thursdays at 6:30 PM',
    description: 'Students, young professionals, and creatives gathering around tables for food, Scripture discussion, and mutual encouragement across Lagos.',
    image: '/images/community-welcome.jpg',
    lead: 'Bro. Kelechi Okafor, YA Coordinator',
    highlights: ['Fellowship hub dinners', 'Career & vocational mentorship', 'Community retreats']
  },
  {
    id: 'city-care',
    title: 'Community Welfare & Outreach',
    tagline: 'Loving our city with tangible action',
    ageGroup: 'All Ages',
    schedule: 'Monthly Community Serve Days',
    description: 'We believe a healthy church blesses the city outside its walls. From food distribution to medical outreaches, we serve with dignity and compassion.',
    image: '/images/ministry-outreach.jpg',
    lead: 'Elder Dr. Seyi Alabi, Missions & Welfare Director',
    highlights: ['Community food pantry & relief', 'Family support network', 'Mission outreaches']
  }
];

export const UPCOMING_EVENTS: ChurchEvent[] = [
  {
    id: 'crew-night-nov',
    title: 'All-Church Faith Night & Worship',
    date: 'Wednesday, Nov 4, 2026',
    time: '6:00 PM – 8:00 PM',
    location: 'Main Auditorium',
    category: 'Worship',
    description: 'An extended evening of acoustic worship, prayer for our nation and families, and fellowship together.'
  },
  {
    id: 'baptism-sunday',
    title: 'Celebration Baptism Sunday',
    date: 'Sunday, Nov 15, 2026',
    time: 'During 7:30 AM & 9:30 AM Services',
    location: 'District Headquarters Cathedral',
    category: 'Community',
    description: 'Celebrating public declarations of new life in Jesus! If you want to take your next step, sign up today.'
  },
  {
    id: 'thanksgiving-outreach',
    title: 'Community Care & Food Outreach',
    date: 'Saturday, Nov 21, 2026',
    time: '8:30 AM – 1:00 PM',
    location: 'District Headquarters Grounds, Idi-Oro',
    category: 'Outreach',
    description: 'Distributing food and essential supplies to families and neighbors across Mushin and surrounding communities.'
  },
  {
    id: 'newcomers-lunch',
    title: 'Newcomers Welcome Luncheon',
    date: 'Sunday, Nov 22, 2026',
    time: '11:45 AM – 1:00 PM',
    location: 'Cathedral Fellowship Hall',
    category: 'Community',
    description: 'New to Foursquare Gospel Church Mushin District Headquarters? Meet our pastoral leadership and ministers for fellowship, hear our vision, and get connected.'
  }
];

export const VISITOR_FAQS = [
  {
    q: 'What should I wear?',
    a: 'Come as you are! You’ll see everything from casual clothes to traditional attire and Sunday suits. We care about you, not what you wear.'
  },
  {
    q: 'How long are Sunday services?',
    a: 'Each celebration service lasts about 90 minutes. We begin with vibrant praise and worship, followed by ministry in prayer, biblical preaching, and benediction.'
  },
  {
    q: 'What about my children?',
    a: 'Our Children Church ministry has a clean, safe, and nurturing environment ready for your children. We recommend arriving 15 minutes early for easy check-in.'
  },
  {
    q: 'Where do I park and go when I arrive?',
    a: 'Turn on your hazard lights when you enter the church gates at 4, Obarinmola Adedoyin Street, Idi-Oro! Our friendly ushering and protocol team will guide you to dedicated first-time guest parking spaces.'
  }
];
