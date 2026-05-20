import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { cn, scrollToContact } from '../lib/utils';
import { LocationTrigger } from './LocationConfigProvider';

const DAYS = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];
const DAY_SHORT_LABELS: Record<string, string> = {
  Luni: 'L',
  Marti: 'M',
  Miercuri: 'M',
  Joi: 'J',
  Vineri: 'V',
  Sambata: 'S',
};

interface ClassItem {
  _id?: string;
  location: string;
  time: string;
  title: string;
  day: string;
  type?: string;
  color?: string;
  trainerId?: string;
  trainer?: string;
}

interface GroupItem {
  _id?: string;
  location: string;
  days?: string[];
  time: string;
  title: string;
  type?: string;
  color?: string;
  trainerId?: string;
  trainer?: string;
  note?: string;
  order?: number;
}

interface ScheduleEntry {
  id: string;
  location: string;
  day: string;
  time: string;
  title: string;
  type: string;
  color?: string;
  trainer: string;
  note?: string;
  source: 'schedule' | 'group';
  order: number;
}

interface ScheduleDisplaySettings {
  disableScheduleAll?: boolean;
  disableScheduleGroups?: boolean;
}

const premiumCardClass = 'bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.03)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.25)]';

const normalizeText = (value?: string) => (
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
);

const isHexColor = (value?: string) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(String(value || '').trim());

const hexToRgba = (value: string, alpha: number) => {
  const hex = value.replace('#', '');
  const normalized = hex.length === 3
    ? hex.split('').map(char => char + char).join('')
    : hex;

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const getTypeTheme = (value?: string, customColor?: string) => {
  if (isHexColor(customColor)) {
    return {
      badge: 'text-white border-transparent',
      card: 'border-transparent',
      accent: 'text-white',
      badgeStyle: {
        backgroundColor: customColor,
      },
      cardStyle: {
        borderColor: hexToRgba(customColor!, 0.45),
        backgroundColor: hexToRgba(customColor!, 0.2),
      },
      accentStyle: {
        color: customColor,
      },
    };
  }

  const label = normalizeText(value);

  if (label.includes('kick')) {
    return {
      badge: 'bg-accent text-white border-accent/40',
      card: 'border-accent/30 bg-accent/12',
      accent: 'text-accent',
      badgeStyle: undefined,
      cardStyle: undefined,
      accentStyle: undefined,
    };
  }

  if (label.includes('box')) {
    return {
      badge: 'bg-blue-500/20 text-blue-200 border-blue-400/35',
      card: 'border-blue-400/25 bg-blue-500/10',
      accent: 'text-blue-300',
      badgeStyle: undefined,
      cardStyle: undefined,
      accentStyle: undefined,
    };
  }

  if (label.includes('mma')) {
    return {
      badge: 'bg-fuchsia-500/18 text-fuchsia-100 border-fuchsia-400/35',
      card: 'border-fuchsia-400/25 bg-fuchsia-500/10',
      accent: 'text-fuchsia-200',
      badgeStyle: undefined,
      cardStyle: undefined,
      accentStyle: undefined,
    };
  }

  if (label.includes('bjj')) {
    return {
      badge: 'bg-violet-500/18 text-violet-100 border-violet-400/35',
      card: 'border-violet-400/25 bg-violet-500/10',
      accent: 'text-violet-200',
      badgeStyle: undefined,
      cardStyle: undefined,
      accentStyle: undefined,
    };
  }

  if (label.includes('karate')) {
    return {
      badge: 'bg-emerald-500/18 text-emerald-100 border-emerald-400/35',
      card: 'border-emerald-400/25 bg-emerald-500/10',
      accent: 'text-emerald-200',
      badgeStyle: undefined,
      cardStyle: undefined,
      accentStyle: undefined,
    };
  }

  if (label.includes('copii') || label.includes('kids')) {
    return {
      badge: 'bg-yellow-400/18 text-yellow-100 border-yellow-300/35',
      card: 'border-yellow-300/25 bg-yellow-400/10',
      accent: 'text-yellow-200',
      badgeStyle: undefined,
      cardStyle: undefined,
      accentStyle: undefined,
    };
  }

  return {
    badge: 'bg-white/10 text-white border-white/15',
    card: 'border-white/10 bg-white/[0.04]',
    accent: 'text-white/70',
    badgeStyle: undefined,
    cardStyle: undefined,
    accentStyle: undefined,
  };
};

const getTimeOrder = (value?: string) => {
  const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
};

const sortEntries = (left: ScheduleEntry, right: ScheduleEntry) => (
  getTimeOrder(left.time) - getTimeOrder(right.time)
  || Number(left.order || 0) - Number(right.order || 0)
  || left.title.localeCompare(right.title)
);

export default function Schedule() {
  const [activeLocation, setActiveLocation] = useState('Ghencea');
  const [schedule, setSchedule] = useState<ClassItem[]>([]);
  const [scheduleGroups, setScheduleGroups] = useState<GroupItem[]>([]);
  const [displaySettings, setDisplaySettings] = useState<ScheduleDisplaySettings>({});
  const [isDesktopViewport, setIsDesktopViewport] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth >= 640 : false
  ));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleResults, scheduleGroupResults, designResults] = await Promise.all([
          api.getSchedule(),
          api.getScheduleGroups(),
          api.getDesign(),
        ]);

        setSchedule(Array.isArray(scheduleResults) ? scheduleResults : []);
        setScheduleGroups(Array.isArray(scheduleGroupResults) ? scheduleGroupResults : []);
        setDisplaySettings({
          disableScheduleAll: Boolean(designResults?.disableScheduleAll),
          disableScheduleGroups: Boolean(designResults?.disableScheduleGroups),
        });
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
        setSchedule([]);
        setScheduleGroups([]);
        setDisplaySettings({});
      }
    };

    fetchData();
  }, []);

  const visibleSchedule = useMemo(() => (
    displaySettings.disableScheduleAll ? [] : schedule
  ), [displaySettings.disableScheduleAll, schedule]);

  const visibleScheduleGroups = useMemo(() => (
    displaySettings.disableScheduleGroups ? [] : scheduleGroups
  ), [displaySettings.disableScheduleGroups, scheduleGroups]);

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set([
      ...visibleSchedule.map(item => item.location),
      ...visibleScheduleGroups.map(item => item.location),
    ].filter(Boolean)));

    return uniqueLocations.length > 0 ? uniqueLocations : ['Ghencea', 'Militari'];
  }, [visibleSchedule, visibleScheduleGroups]);

  useEffect(() => {
    if (!locations.includes(activeLocation)) {
      setActiveLocation(locations[0] || 'Ghencea');
    }
  }, [activeLocation, locations]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(min-width: 640px)');
    const syncViewport = (matches: boolean) => setIsDesktopViewport(matches);

    syncViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      const handleChange = (event: MediaQueryListEvent) => syncViewport(event.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    const legacyListener = (event: MediaQueryListEvent) => syncViewport(event.matches);
    mediaQuery.addListener(legacyListener);
    return () => mediaQuery.removeListener(legacyListener);
  }, []);

  const unifiedEntries = useMemo(() => {
    const classEntries: ScheduleEntry[] = visibleSchedule.map((item, index) => ({
      id: item._id || `schedule-${index}`,
      location: item.location,
      day: item.day,
      time: item.time,
      title: item.title || item.type || 'Antrenament',
      type: item.type || item.title || 'Antrenament',
      color: item.color || '',
      trainer: item.trainer || '',
      source: 'schedule',
      order: 0,
    }));

    const groupEntries: ScheduleEntry[] = visibleScheduleGroups.flatMap((item, index) => (
      (Array.isArray(item.days) ? item.days : [])
        .filter(Boolean)
        .map(day => ({
          id: `${item._id || `group-${index}`}-${day}`,
          location: item.location,
          day,
          time: item.time,
          title: item.title || item.type || 'Grupa',
          type: item.type || item.title || 'Grupa',
          color: item.color || '',
          trainer: item.trainer || '',
          note: item.note || '',
          source: 'group' as const,
          order: Number(item.order || 0),
        }))
    ));

    return [...classEntries, ...groupEntries]
      .filter(entry => entry.location === activeLocation && DAYS.includes(entry.day))
      .sort(sortEntries);
  }, [activeLocation, visibleSchedule, visibleScheduleGroups]);

  const timeSlots = useMemo(() => {
    const slots = Array.from(new Set(
      unifiedEntries
        .map(item => String(item.time || '').trim())
        .filter(Boolean),
    ));

    return slots.sort((left, right) => getTimeOrder(left) - getTimeOrder(right) || left.localeCompare(right));
  }, [unifiedEntries]);

  const entriesByCell = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();

    unifiedEntries.forEach(entry => {
      const key = `${entry.day}__${entry.time}`;
      const current = map.get(key) || [];
      current.push(entry);
      current.sort(sortEntries);
      map.set(key, current);
    });

    return map;
  }, [unifiedEntries]);

  const dayColumnWidth = isDesktopViewport ? 82 : 42;
  const timeColumnMinWidth = 92;
  const tableColumns = `${dayColumnWidth}px repeat(${Math.max(timeSlots.length, 1)}, minmax(${timeColumnMinWidth}px, 1fr))`;
  const tableWidth = `max(100%, ${dayColumnWidth + Math.max(timeSlots.length, 1) * timeColumnMinWidth}px)`;

  return (
    <section id="program" className="relative bg-black py-18">
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[150px]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-16 flex flex-col justify-between gap-12 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mb-4 block text-sm font-bold uppercase tracking-[0.4em] text-accent"
            >
              Time to fight
            </motion.span>
            <h2 className="mb-6 text-5xl font-display font-black uppercase leading-none text-white md:text-7xl">
              PROGRAM <span className="text-white/30">Saptamanal.</span>
            </h2>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base">
              Un singur orar clar, construit pe zile si intervale, unde vezi rapid disciplina, tipul sedintei si coach-ul programat la fiecare ora.
            </p>
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1 self-start xl:self-end">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={cn(
                  'rounded-xl px-8 py-3 text-xs font-black uppercase tracking-widest transition-all',
                  activeLocation === loc
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white',
                )}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {unifiedEntries.length === 0 ? (
          <div className={`rounded-3xl border-dashed py-32 text-center ${premiumCardClass}`}>
            <div className="mx-auto max-w-sm">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/20">
                Momentan nu exista sedinte programate
              </p>
              <button
                type="button"
                onClick={scrollToContact}
                className="inline-block rounded-full border border-accent/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-accent hover:underline"
              >
                Cere detalii despre program
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-accent">Program unificat</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
                  Zile fixe, scroll pe ore
                </p>
              </div>
              <div className="text-right text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                <LocationTrigger name={activeLocation}>
                  <span>{activeLocation}</span>
                </LocationTrigger>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] pl-0 pr-1.5 py-1 shadow-[0_20px_70px_rgba(0,0,0,0.28)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-1.5 sm:py-1.5">
              <div className="space-y-1.5 sm:space-y-1.5" style={{ width: tableWidth }}>
                <div
                  className="grid gap-y-1.5 gap-x-0 sm:gap-x-1.5"
                  style={{ gridTemplateColumns: tableColumns }}
                >
                  <div className="sticky left-0 z-30 flex min-h-[42px] items-center justify-center rounded-tl-[20px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.03)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm text-center shadow-[10px_0_24px_rgba(0,0,0,0.28)] sm:min-h-[58px] sm:rounded-[14px] sm:bg-white/[0.04]">
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-accent">Zi / Ora</span>
                  </div>
                  {timeSlots.map(time => (
                    <div
                      key={`header-${time}`}
                      className="flex min-h-[42px] items-center justify-center rounded-none border-y border-r border-white/10 bg-white/[0.04] px-1 text-center first:rounded-l-[10px] last:rounded-r-[14px] sm:min-h-[58px] sm:rounded-[14px] sm:border"
                    >
                      <span className="text-[11px] font-display font-black text-white sm:text-[15px]">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>

                {DAYS.map((day, dayIndex) => (
                  <div
                    key={day}
                    className="grid gap-y-1.5 gap-x-0 sm:gap-x-1.5"
                    style={{ gridTemplateColumns: tableColumns }}
                  >
                    <div
                      className={cn(
                        'sticky left-0 z-20 flex flex-col items-center justify-center border-x border-y border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.03)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm px-1 py-2 text-center shadow-[10px_10px_24px_rgba(0,0,0,0.22)] before:pointer-events-none before:absolute before:inset-x-0 before:-bottom-2 before:h-3 before:bg-black/20 before:backdrop-blur-md sm:my-0 sm:min-h-[92px] sm:rounded-[14px] sm:border sm:bg-white/[0.04] sm:px-2 sm:py-0 sm:shadow-[10px_0_24px_rgba(0,0,0,0.28)] sm:before:hidden',
                        dayIndex === DAYS.length - 1 && 'rounded-bl-[20px]',
                      )}
                    >
                      <span className="text-[11px] font-display font-bold uppercase leading-tight text-white sm:hidden">
                        {DAY_SHORT_LABELS[day] || day.slice(0, 1)}
                      </span>
                      <span className="hidden text-[14px] font-display font-bold uppercase leading-tight text-white sm:block">
                        {day}
                      </span>
                    </div>

                    {timeSlots.map(time => {
                      const cellItems = entriesByCell.get(`${day}__${time}`) || [];

                      return (
                        <div
                          key={`${day}-${time}`}
                          className={cn(
                            'border-y border-r border-white/10 bg-black/20 p-1 first:rounded-l-[10px] last:rounded-r-[14px] sm:rounded-[14px] sm:border sm:p-1.5',
                            cellItems.length > 0 ? 'h-auto' : 'sm:min-h-[92px]',
                          )}
                        >
                          {cellItems.length > 0 ? (
                            <div className="space-y-1">
                              {cellItems.map(item => {
                                const theme = getTypeTheme(item.type, item.color);

                                return (
                                  <div
                                    key={item.id}
                                    className={cn('flex min-h-[72px] h-full flex-col rounded-[10px] border px-[6px] py-[9px] sm:min-h-[90px] sm:px-[8px] sm:py-[10px]', theme.card)}
                                    style={theme.cardStyle}
                                  >
                                    <span
                                      className={cn('inline-flex rounded-full border px-1 py-0.5 text-[5px] font-black uppercase tracking-[0.1em] sm:px-2 sm:py-1 sm:text-[8px] sm:tracking-[0.12em]', theme.badge)}
                                      style={theme.badgeStyle}
                                    >
                                      {item.type || 'Antrenament'}
                                    </span>
                                    <p className="mt-1 text-[8px] font-display font-black uppercase leading-tight text-white sm:text-[11px]">
                                      {item.title}
                                    </p>
                                    {item.trainer && (
                                      <p
                                        className={cn('mt-auto pt-1 text-[6px] font-black uppercase tracking-[0.1em] sm:mt-1 sm:pt-0 sm:text-[8px] sm:tracking-[0.12em]', theme.accent)}
                                        style={theme.accentStyle}
                                      >
                                        {item.trainer}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-white/8 py-6 text-[7px] font-black uppercase tracking-[0.1em] text-white/14 sm:min-h-[78px] sm:py-0">
                              Liber
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <motion.a
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToContact();
                }}
                whileHover={{ x: 5 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-accent hover:text-white"
              >
                Rezerva Loc <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </motion.a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
