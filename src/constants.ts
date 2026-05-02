import { NavLink, Discipline, PricingPlan, Coach, TrainerProgram } from './types';

export const NAV_LINKS: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Despre Noi', href: '#despre' },
  { name: 'Discipline', href: '#discipline' },
  { name: 'Program', href: '#program' },
  { name: 'Programe', href: '#programe' },
  { name: 'Competitii', href: '#competitii' },
  { name: 'Galerie', href: '#galerie' },
  { name: 'Contact', href: '#contact' },
];

export const DISCIPLINES: Discipline[] = [
  // {
  //   id: 'kickboxing',
  //   title: 'Kickboxing',
  //   description: 'Arta celor opt membre. Antrenament intens pentru disciplină, viteză și putere sub îndrumarea campionilor.',
  //   image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2000&auto=format&fit=crop',
  //   features: ['Tehnică de elită', 'Condiționare fizică', 'Autoapărare', 'Nivel Pro & Amatori']
  // },
  // {
  //   id: 'box',
  //   title: 'Box',
  //   description: 'Nobila artă a autoapărării. Concentrare pe footwork, coordonare și forță explozivă.',
  //   image: 'https://images.unsplash.com/photo-1549476464-37392f719918?q=80&w=2000&auto=format&fit=crop',
  //   features: ['Tehnică brațe', 'Strategie ring', 'Rezistență cardio', 'Sparring controlat']
  // },
  // {
  //   id: 'mma',
  //   title: 'MMA',
  //   description: 'Mixul suprem de arte marțiale. Combină striking, grappling și luptă la sol pentru performanță completă.',
  //   image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=2000&auto=format&fit=crop',
  //   features: ['Tranziții striking-grappling', 'Luptă la cușcă', 'Conditionare MMA', 'Versatilitate']
  // },
  // {
  //   id: 'bjj',
  //   title: 'BJJ',
  //   description: 'Brazilian Jiu-Jitsu. Știința controlului la sol și a finalizărilor tehnice prin pârghii și presiune.',
  //   image: 'https://images.unsplash.com/photo-1599058917233-57c0e88cfc8b?q=80&w=2000&auto=format&fit=crop',
  //   features: ['Tehnică sol', 'Grappling', 'Flexibilitate', 'Problematizare strategică']
  // }
];

export const PRICING: PricingPlan[] = [
  {
    id: 'trial',
    name: 'Prima Ședință',
    price: 'GRATUIT',
    period: 'O singură dată',
    features: ['Acces la orice disciplină', 'Consiliere antrenor', 'Echipament inclus (pt. prima dată)', 'Trial gratuit'],
  },
  {
    id: 'basic',
    name: 'Abonament Lunar',
    price: '250',
    period: 'RON / Lună',
    features: ['12 Ședințe incluse', 'Acces la vestiare premium', 'O disciplină la alegere', 'Comunitate de elită'],
  },
  {
    id: 'premium',
    name: 'Elite Unlimited',
    price: '400',
    period: 'RON / Lună',
    recommended: true,
    features: ['Acces Nelimitat la toate clasele', 'Kickboxing, Box, MMA & BJJ', 'Acces zona Forță & Recovery', 'Invitații la evenimente speciale'],
  },
  {
    id: 'personal',
    name: 'Private Coaching',
    price: '150',
    period: 'RON / Ședință',
    features: ['Antrenament 1-la-1', 'Program personalizat', 'Nutriție & Suport', 'Program flexibil'],
  }
];

export const COACHES: Coach[] = [
  {
    id: 'bogdan-stoica',
    name: 'Bogdan Stoica',
    role: 'Multiplu Campion Mondial',
    image: 'https://images.unsplash.com/photo-1583473848882-f9a5624647fa?q=80&w=2000&auto=format&fit=crop',
    bio: 'Legenda kickboxing-ului românesc, recunoscut mondial pentru stilul său agresiv și "genunchii" de fier.',
    basePrice: '450 RON',
    specialties: ['Kickboxing Elite', 'Sparring', 'Knee Strikes Specialist'],
    locations: [
      { name: 'Ghencea', address: 'Str. Ghencea 12, București', schedule: 'Luni - Vineri: 07:00 - 22:00' },
      { name: 'Militari', address: 'Bld. Iuliu Maniu 45, București', schedule: 'Luni - Sâmbătă: 08:00 - 21:00' }
    ]
  },
  {
    id: 'andrei-stoica',
    name: 'Andrei Stoica',
    role: 'Campion Mondial Kickboxing',
    image: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=2000&auto=format&fit=crop',
    bio: '"Mister KO", un maestru al tehnicii și al disciplinei, mentor pentru noile generații de luptători.',
    basePrice: '400 RON',
    specialties: ['Performance Boxing', 'Tehnică Pură', 'Mental Coaching'],
    locations: [
      { name: 'Ghencea', address: 'Str. Ghencea 12, București', schedule: 'Luni - Vineri: 07:00 - 22:00' }
    ]
  },
  {
    id: 'christian-stoica',
    name: 'Christian Stoica',
    role: 'Instructor Kickboxing & Kids',
    image: 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=2000&auto=format&fit=crop',
    bio: 'Specialist în formarea tinerelor talente și în bazele kickboxing-ului pentru toate nivelurile.',
    basePrice: '250 RON',
    specialties: ['Kids MMA', 'Junior Kickboxing', 'Foundations'],
    locations: [
      { name: 'Militari', address: 'Bld. Iuliu Maniu 45, București', schedule: 'Luni - Sâmbătă: 08:00 - 21:00' }
    ]
  },
  {
    id: 'david-constantin',
    name: 'David Constantin',
    role: 'Personal Trainer & Conditioning',
    image: 'https://images.unsplash.com/photo-1591117207239-788cd4742240?q=80&w=2000&auto=format&fit=crop',
    bio: 'Expert în pregătire fizică specifică pentru sporturile de contact și condiționare atletică.',
    basePrice: '300 RON',
    specialties: ['Explosive Power', 'Functional Forțǎ', 'Rehab'],
    locations: [
      { name: 'Ghencea', address: 'Str. Ghencea 12, București', schedule: 'Luni - Vineri: 07:00 - 22:00' },
      { name: 'Militari', address: 'Bld. Iuliu Maniu 45, București', schedule: 'Luni - Sâmbătă: 08:00 - 21:00' }
    ]
  }
];

export const TRAINER_PROGRAMS: TrainerProgram[] = [
  {
    id: 'prog-bogdan-elite',
    trainerId: 'bogdan-stoica',
    group: 'Elite Kickboxing Group',
    price: '450 RON / Lună',
    schedule: 'Luni, Miercuri, Vineri @ 19:30',
    category: 'Avansați / Pro',
    details: ['Tehnică de luptă avansată', 'Sparring controlat', 'Strategie ring', 'Acces zona Forță']
  },
  {
    id: 'prog-bogdan-private',
    trainerId: 'bogdan-stoica',
    group: 'Private Coaching VIP',
    price: '250 RON / Ședință',
    schedule: 'Program Personalizat',
    category: '1-la-1',
    details: ['Atenție exclusivă', 'Analiză video tehnică', 'Plan nutriție inclus', 'Flexibilitate orară']
  },
  {
    id: 'prog-andrei-box',
    trainerId: 'andrei-stoica',
    group: 'Performance Boxing',
    price: '400 RON / Lună',
    schedule: 'Marți, Joi @ 18:30',
    category: 'All Levels',
    details: ['Tehnică brațe impecabilă', 'Footwork & Coordonare', 'Conditioning specific', 'Mentalitate de campion']
  },
  {
    id: 'prog-christian-kick',
    trainerId: 'christian-stoica',
    group: 'Kickboxing Foundations',
    price: '300 RON / Lună',
    schedule: 'Luni, Miercuri @ 17:30',
    category: 'Începători',
    details: ['Baze tehnice corecte', 'Educație prin sport', 'Autoapărare', 'Abordare metodică']
  },
  {
    id: 'prog-christian-kids',
    trainerId: 'christian-stoica',
    group: 'Kids Champions (5-12 ani)',
    price: '250 RON / Lună',
    schedule: 'Sâmbătă @ 11:00',
    category: 'Junior',
    details: ['Dezvoltare armonioasă', 'Jocuri educative', 'Disciplină & Respect', 'Siguranță maximă']
  },
  {
    id: 'prog-david-cond',
    trainerId: 'david-constantin',
    group: 'Fight Conditioning',
    price: '300 RON / Lună',
    schedule: 'Marți, Joi, Sâmbătă @ 08:00',
    category: 'Fitness / Pro',
    details: ['Rezistență explozivă', 'Forță funcțională', 'Mobilitate', 'Prevenție accidentări']
  }
];
