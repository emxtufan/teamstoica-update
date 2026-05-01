import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Clock, MapPin, Tag } from 'lucide-react';
import { COACHES } from '../constants';
import { api, getAssetUrl } from '../services/api';
import { cn, scrollToContact } from '../lib/utils';
import { LocationTrigger } from './LocationConfigProvider';

const DAYS = ['Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata'];

interface ClassItem {
  _id?: string;
  location: string;
  time: string;
  title: string;
  day: string;
  type: 'kickboxing' | 'box' | 'mma' | 'bjj' | 'kids' | 'other' | string;
  trainerId?: string;
  trainer?: string;
}

interface CoachItem {
  _id?: string;
  id?: string;
  name?: string;
  image?: string;
}

const getTypeColor = (type: ClassItem['type']) => {
  switch (type) {
    case 'kickboxing': return 'text-accent';
    case 'box': return 'text-blue-400';
    case 'mma': return 'text-purple-400';
    case 'bjj': return 'text-emerald-400';
    case 'kids': return 'text-yellow-400';
    default: return 'text-white/50';
  }
};

const premiumCardClass = 'bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.035)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.25)]';
const infoIconBubbleClass = 'w-6 h-6 md:w-10 md:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0';
const trainerFallbackBubbleClass = 'w-[68px] h-[68px] md:w-[50px] md:h-[50px] rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0';
const trainerAvatarFrameClass = 'relative w-[68px] h-[68px] md:w-[50px] md:h-[50px] overflow-hidden rounded-full border-2 border-white/10 shrink-0 shadow-[0_12px_28px_rgba(0,0,0,0.4)]';
const trainerAvatarImageClass = 'absolute inset-0 h-full w-full object-cover object-top scale-[3] origin-top';

export default function Schedule() {
  const [activeLocation, setActiveLocation] = useState('Ghencea');
  const [activeDay, setActiveDay] = useState('Luni');
  const [schedule, setSchedule] = useState<ClassItem[]>([]);
  const [coaches, setCoaches] = useState<CoachItem[]>(COACHES);

  const normalizePersonKey = (value?: string) => (
    String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleResults, coachResults] = await Promise.all([
          api.getSchedule(),
          api.getCoaches(),
        ]);

        setSchedule(Array.isArray(scheduleResults) ? scheduleResults : []);
        if (Array.isArray(coachResults) && coachResults.length > 0) {
          setCoaches(coachResults);
        }
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
        setSchedule([]);
      }
    };

    fetchData();
  }, []);

  const locations = useMemo(() => {
    const uniqueLocations = Array.from(new Set(schedule.map(item => item.location).filter(Boolean)));
    return uniqueLocations.length > 0 ? uniqueLocations : ['Ghencea', 'Militari'];
  }, [schedule]);

  useEffect(() => {
    if (!locations.includes(activeLocation)) {
      setActiveLocation(locations[0] || 'Ghencea');
    }
  }, [activeLocation, locations]);

  const filteredClasses = useMemo(() => (
    schedule
      .filter(item => item.location === activeLocation && item.day === activeDay)
      .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))
  ), [activeLocation, activeDay, schedule]);

  const coachImageBySession = useMemo(() => {
    const coachMap = new Map<string, string>();

    coaches.forEach(coach => {
      const image = coach.image || '';
      if (!image) return;

      const keys = [
        coach._id,
        coach.id,
        coach.name,
      ]
        .map(value => normalizePersonKey(value))
        .filter(Boolean);

      keys.forEach(key => {
        if (!coachMap.has(key)) {
          coachMap.set(key, image);
        }
      });
    });

    return coachMap;
  }, [coaches]);

  return (
    <section id="program" className="py-18 bg-black relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-16">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-accent text-sm font-bold tracking-[0.4em] uppercase mb-4 block"
            >
              Time to fight
            </motion.span>
            <h2 className="text-5xl md:text-7xl font-display font-black leading-none uppercase text-white mb-6">
              PROGRAM <span className="text-white/30">Saptamanal.</span>
            </h2>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base">
              Filtreaza rapid dupa locatie si zi pentru a vedea antrenamentele active, orele disponibile si antrenorii programati in fiecare sesiune.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 self-start xl:self-end">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setActiveLocation(loc)}
                  className={cn(
                    'px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all',
                    activeLocation === loc
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-white/40 hover:text-white',
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={cn(
                    'px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border rounded-full',
                    activeDay === day
                      ? 'bg-white border-white text-black'
                      : 'bg-transparent border-white/10 text-white/40 hover:border-accent hover:text-accent',
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeLocation}-${activeDay}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid gap-2 md:gap-4"
            >
              {filteredClasses.length > 0 ? (
                filteredClasses.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className={`group relative flex flex-col gap-4 px-4 py-3 md:gap-5 md:p-6 xl:flex-row xl:items-center xl:justify-between xl:p-8 ${premiumCardClass} hover:border-accent/40 transition-all duration-500 rounded-xl md:rounded-3xl overflow-hidden`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />

                    <div className="relative z-10 min-w-0 w-full">
                      <div className="md:hidden">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.trainer && (
                            <>
                              {(() => {
                                const trainerImage = coachImageBySession.get(normalizePersonKey(item.trainerId))
                                  || coachImageBySession.get(normalizePersonKey(item.trainer));

                                return trainerImage ? (
                                  <div className={trainerAvatarFrameClass}>
                                    <img
                                      src={getAssetUrl(trainerImage)}
                                      alt={item.trainer}
                                      className={trainerAvatarImageClass}
                                    />
                                  </div>
                                ) : (
                                  <div className={trainerFallbackBubbleClass}>
                                    <span className="text-sm">C</span>
                                  </div>
                                );
                              })()}
                            </>
                          )}

                          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                            <span className="truncate text-[12px] font-bold uppercase tracking-[0.16em] text-accent">
                              {item.trainer || 'Stoica Brothers'}
                            </span>

                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className={infoIconBubbleClass}>
                                  <Clock size={13} />
                                </div>
                                <span className="text-sm font-display font-black text-white tracking-tighter leading-5 whitespace-nowrap">
                                  {item.time}
                                </span>
                              </div>

                              {item.type && (
                                <div className="ml-auto flex items-center gap-1.5 min-w-0 justify-end">
                                  <div className={infoIconBubbleClass}>
                                    <Tag size={13} />
                                  </div>
                                  <span className={cn('text-[13px] font-display font-black uppercase tracking-[0.06em] leading-5 truncate', getTypeColor(item.type))}>
                                    {item.type}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col gap-4 xl:flex-1 xl:flex-row xl:items-center xl:gap-8">
                        <div className="flex items-center gap-2 md:min-w-[190px] xl:min-w-[200px]">
                          <div className={infoIconBubbleClass}>
                            <Clock size={20} />
                          </div>
                          <span className="text-xl xl:text-2xl font-display font-black text-white tracking-tighter leading-5">{item.time}</span>
                        </div>

                        <div className="flex flex-col gap-2 xl:flex-1 xl:flex-row xl:items-center xl:gap-8">
                          {item.type && (
                          <div className="flex items-center gap-2 min-w-0 xl:flex-1">
                            <div className={infoIconBubbleClass}>
                              <Tag size={20} />
                            </div>
                            <span className={cn('md:text-[15px] xl:text-3xl font-display font-black uppercase tracking-[0.02em] xl:tracking-tight md:leading-[1.15] xl:leading-tight break-words', getTypeColor(item.type))}>
                              {item.type}
                            </span>
                          </div>
                          )}

                          {item.trainer && (
                            <div className="flex items-center gap-3 min-w-0 pt-1 text-[11px] font-bold uppercase tracking-widest text-accent xl:pt-0 xl:pr-4">
                              {(() => {
                                const trainerImage = coachImageBySession.get(normalizePersonKey(item.trainerId))
                                  || coachImageBySession.get(normalizePersonKey(item.trainer));

                                return trainerImage ? (
                                  <div className={trainerAvatarFrameClass}>
                                    <img
                                      src={getAssetUrl(trainerImage)}
                                      alt={item.trainer}
                                      className={trainerAvatarImageClass}
                                    />
                                  </div>
                                ) : (
                                  <div className={trainerFallbackBubbleClass}>
                                    <span className="text-sm">C</span>
                                  </div>
                                );
                              })()}
                              <span className="truncate">{item.trainer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center justify-between gap-5 relative z-10 w-full border-t border-white/6 pt-4 xl:w-auto xl:border-0 xl:pt-0 xl:pl-6 xl:justify-start xl:gap-8">
                      <div className="flex items-center gap-2 text-white/20 group-hover:text-white/40 transition-colors uppercase text-[10px] font-black tracking-widest md:mr-6 xl:mr-0">
                        <MapPin size={12} />
                        <LocationTrigger name={activeLocation}>
                          <span>{activeLocation}</span>
                        </LocationTrigger>
                      </div>
                      <motion.a
                        href="#contact"
                        onClick={(event) => {
                          event.preventDefault();
                          scrollToContact();
                        }}
                        whileHover={{ x: 5 }}
                        className="ml-auto flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 xl:px-8 xl:py-4 bg-white text-black text-[8px] md:text-[10px] font-black uppercase tracking-[0.14em] md:tracking-[0.2em] group-hover:bg-accent group-hover:text-white transition-all rounded-lg md:rounded-xl"
                      >
                        Rezerva Loc <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </motion.a>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`py-32 text-center rounded-3xl border-dashed ${premiumCardClass}`}>
                  <div className="max-w-xs mx-auto">
                    <p className="text-white/20 text-sm font-medium mb-4 uppercase tracking-[0.3em]">Momentan nu sunt clase programate</p>
                    <button
                      type="button"
                      onClick={scrollToContact}
                      className="text-accent text-xs font-black uppercase tracking-widest hover:underline px-4 py-2 border border-accent/20 rounded-full inline-block"
                    >
                      Solicita antrenament personal
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
