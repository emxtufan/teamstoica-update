export type LegacyPalmaresCard = {
  name?: string;
  title?: string;
  record?: string;
  description?: string;
  highlight?: string;
};

export type PalmaresProfile = {
  slug: string;
  name: string;
  title: string;
  record: string;
  biography: string;
  highlight: string;
  matches: string;
  wins: string;
  kos: string;
  importantGalas: string[];
  tournaments: string[];
  awards: string[];
};

const slugify = (value?: string) => (
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const cleanText = (value: unknown) => String(value || '').trim();

const toStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map(entry => cleanText(entry))
      .filter(Boolean);
  }

  return cleanText(value)
    .split('\n')
    .map(entry => entry.trim())
    .filter(Boolean);
};

export const defaultPalmaresProfiles: PalmaresProfile[] = [
  {
    slug: 'bogdan-stoica',
    name: 'Bogdan Stoica',
    title: 'Multiplu Campion Mondial',
    record: '10+ titluri mondiale',
    biography: 'Explozie, presiune si experienta construita in gale internationale unde fiecare detaliu conteaza.',
    highlight: 'Superkombat / Glory / K-1',
    matches: '',
    wins: '',
    kos: '',
    importantGalas: ['Superkombat', 'Glory', 'K-1'],
    tournaments: [],
    awards: [],
  },
  {
    slug: 'andrei-stoica',
    name: 'Andrei Stoica',
    title: 'Campion Mondial Kickboxing',
    record: '20+ victorii prin KO',
    biography: 'Un stil puternic, disciplinat si direct, cu mentalitate de main event adusa in fiecare antrenament.',
    highlight: 'World Title / Main Event',
    matches: '',
    wins: '',
    kos: '',
    importantGalas: ['World Title', 'Main Event'],
    tournaments: [],
    awards: [],
  },
];

export const normalizePalmaresProfiles = (design: any): PalmaresProfile[] => {
  const rawProfiles = Array.isArray(design?.palmaresProfiles) ? design.palmaresProfiles : [];
  const legacyCards = Array.isArray(design?.palmaresCards) ? design.palmaresCards : [];

  return defaultPalmaresProfiles.map((defaults, index) => {
    const bySlug = rawProfiles.find((entry: any) => slugify(entry?.slug || entry?.name) === defaults.slug);
    const current = bySlug || rawProfiles[index] || {};
    const legacy = legacyCards[index] || {};

    const importantGalas = toStringArray(current.importantGalas);
    const tournaments = toStringArray(current.tournaments);
    const awards = toStringArray(current.awards);

    return {
      ...defaults,
      ...current,
      slug: defaults.slug,
      name: cleanText(current.name) || cleanText(legacy.name) || defaults.name,
      title: cleanText(current.title) || cleanText(legacy.title) || defaults.title,
      record: cleanText(current.record) || cleanText(legacy.record) || defaults.record,
      biography: cleanText(current.biography || current.description) || cleanText(legacy.description) || defaults.biography,
      highlight: cleanText(current.highlight) || cleanText(legacy.highlight) || defaults.highlight,
      matches: cleanText(current.matches),
      wins: cleanText(current.wins),
      kos: cleanText(current.kos),
      importantGalas: importantGalas.length ? importantGalas : defaults.importantGalas,
      tournaments: tournaments.length ? tournaments : defaults.tournaments,
      awards: awards.length ? awards : defaults.awards,
    };
  });
};

export const createLegacyPalmaresCards = (profiles: PalmaresProfile[]): LegacyPalmaresCard[] => (
  profiles.slice(0, 2).map(profile => ({
    name: profile.name,
    title: profile.title,
    record: profile.record,
    description: profile.biography,
    highlight: profile.highlight,
  }))
);
