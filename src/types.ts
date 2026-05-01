export interface NavLink {
  name: string;
  href: string;
}

export interface Discipline {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  basePrice: string;
  specialties: string[];
  locations: {
    name: string;
    address: string;
    schedule: string;
  }[];
}

export interface TrainerProgram {
  id: string;
  trainerId: string;
  trainer?: string;
  role?: string;
  image?: string;
  title?: string;
  group: string;
  price: string;
  schedule: string;
  category: string;
  location?: string;
  details: string[];
}

export interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  category: string;
}
