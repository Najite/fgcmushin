export interface Sermon {
  id: string;
  title: string;
  series: string;
  speaker: string;
  date: string;
  duration: string;
  passage: string;
  thumbnail: string;
  summary: string;
  videoUrl?: string;
}

export interface Ministry {
  id: string;
  title: string;
  tagline: string;
  ageGroup: string;
  schedule: string;
  description: string;
  image: string;
  lead: string;
  highlights: string[];
}

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'Worship' | 'Community' | 'Outreach' | 'NextGen';
  description: string;
  spotsLeft?: number;
}

export interface VisitPlanData {
  fullName: string;
  email: string;
  phone: string;
  serviceDate: string;
  serviceTime: '7:30 AM' | '9:30 AM';
  adultsCount: number;
  kidsCount: number;
  hasKidsForChildcare: boolean;
  notes?: string;
}
