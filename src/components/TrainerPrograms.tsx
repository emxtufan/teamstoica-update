import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { api, getAssetUrl } from '../services/api';
import { scrollToContact } from '../lib/utils';
import { LocationTrigger, splitLocationNames } from './LocationConfigProvider';

const normalizeText = (value: string) => String(value || '').trim().toLowerCase();

const buildProgramsFromCoaches = (coaches: any[]) => {
  return coaches.flatMap((coach: any) => {
    const coachKey = coach._id || coach.id || coach.name;
    const hasPrivate = Boolean(coach.privatePrice || coach.basePrice);
    const hasGroup = Boolean(coach.groupPrice);
    const coachLocations = Array.isArray(coach.locations) ? coach.locations : [];

    const locationsText = coachLocations.length > 0
      ? coachLocations.map((location: any) => location.name).filter(Boolean).join(' & ')
      : 'Locatie nespecificata';
    const coachImage = coach.image || 'https://images.unsplash.com/photo-1583473848882-f9a5624647fa?q=80&w=2000&auto=format&fit=crop';
    const privateDetails = Array.isArray(coach.privateDetails) ? coach.privateDetails.filter(Boolean) : [];
    const groupDetails = Array.isArray(coach.groupDetails) ? coach.groupDetails.filter(Boolean) : [];
    const trainingSchedule = Array.isArray(coach.trainingSchedule) ? coach.trainingSchedule : [];
    const scheduleLocationCandidates = [
      ...coachLocations.map((location: any) => location?.name || ''),
      ...trainingSchedule
        .filter((session: any) => {
          const title = String(session?.title || '').toLowerCase();
          return !title.includes('privat') && !title.includes('1:1');
        })
        .map((session: any) => session?.location || ''),
      ...splitLocationNames(coach.groupLocation),
    ]
      .map((location: string) => String(location || '').trim())
      .filter(Boolean);

    const scheduleEntries = Array.from(
      new Map(
        scheduleLocationCandidates.map((location: string) => [normalizeText(location), { location }]),
      ).values(),
    );

    const details = [
      ...(hasPrivate ? (privateDetails.length > 0 ? privateDetails : ['Program personalizat']) : []),
      ...(hasGroup ? (groupDetails.length > 0 ? groupDetails : ['Sesiuni de grup']) : []),
    ];

    return [{
      id: `${coachKey}-program`,
      trainerId: coachKey,
      trainer: coach.name,
      role: coach.role,
      image: coachImage,
      category: hasPrivate && hasGroup ? 'Privat + Grupa' : hasPrivate ? 'Privat 1:1' : hasGroup ? 'Abonament grupa' : 'Program personalizat',
      subscriptionTag: coach.subscriptionTag || '',
      location: coach.groupLocation || locationsText,
      scheduleEntries,
      hasPrivate,
      title: hasPrivate && hasGroup ? 'Privat & Grupa' : hasPrivate ? 'Privat 1:1' : hasGroup ? 'Grupa' : 'Antrenament personalizat',
      price: [
        hasPrivate ? `Privat ${coach.privatePrice || coach.basePrice}` : '',
        hasGroup ? `Grupa ${coach.groupPrice}` : '',
      ].filter(Boolean).join(' / ') || coach.basePrice || 'Pret la cerere',
      details: details.length > 0 ? details : ['Program stabilit cu antrenorul', 'Detalii oferite la cerere'],
    }];
  });
};

export default function TrainerPrograms() {
  const [data, setData] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coachesData = await api.getCoaches();
        const coachesList = Array.isArray(coachesData) ? coachesData : [];
        setCoaches(coachesList);
        setData(buildProgramsFromCoaches(coachesList));
      } catch (error) {
        console.error('Failed to fetch programs:', error);
        setData([]);
        setCoaches([]);
      }
    };
    fetchData();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <section id="programe" className="py-18 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-accent text-sm font-bold tracking-[0.5em] uppercase mb-4 block"
          >
            Elite Mentorship
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-display font-black leading-tight uppercase text-white"
          >
            SUBSCRIPTII <span className="text-white/30">Personalizate.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base"
          >
            Programe construite in jurul stilului fiecarui antrenor, cu optiuni flexibile pentru privat, grupa si acces rapid la locatiile unde predau.
          </motion.p>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {data.map((program: any, idx: number) => {
                const trainer = coaches.find(c => c._id === program.trainerId || c.id === program.trainerId);
                const details = program.details || [];
                const coachName = program.trainer || trainer?.name || 'Stoica Brothers Academy';
                const coachRole = program.role || trainer?.role || 'Elite Coach';
                const imageUrl = program.image || trainer?.image || 'https://images.unsplash.com/photo-1583473848882-f9a5624647fa?q=80&w=2000&auto=format&fit=crop';
                const locationsText = trainer?.locations?.map((l: any) => l.name).join(' & ') || 'Locatie nespecificata';
                const scheduleEntries = Array.isArray(program.scheduleEntries) ? program.scheduleEntries : [];
                const locationNames = splitLocationNames(program.location || locationsText);

                return (
                  <div
                    key={program.id || program._id}
                    className="min-w-0 flex-[0_0_100%] lg:flex-[0_0_80%] xl:flex-[0_0_70%]"
                  >
                    <div className="w-full min-w-0 flex h-[640px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm group md:h-[46vh] md:min-h-[360px] md:flex-row md:rounded-3xl xl:h-[60vh] xl:min-h-[420px]">
                      <div className="w-full md:w-[40%] lg:w-[35%] relative h-48 md:h-auto overflow-hidden">
                        <img
                          src={getAssetUrl(imageUrl)}
                          alt={coachName}
                          className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-4 left-4">
                          <p className="text-accent text-[8px] font-black uppercase tracking-widest mb-1">Elite Coach</p>
                          <h4 className="text-white font-display font-bold text-lg md:text-xl">{coachName}</h4>
                          <p className="text-white/40 text-[9px] mt-0.5 uppercase tracking-wider">{coachRole}</p>
                        </div>
                      </div>

                      <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col justify-between bg-white/[0.02] p-5 sm:p-6 md:w-[60%] md:p-10 lg:w-[65%]">
                        <span className="absolute top-4 right-6 text-6xl font-black text-white/[0.03] select-none pointer-events-none">0{idx + 1}</span>

                        <div className="min-h-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4 pr-12">
                            <div className="inline-block px-3 py-0.5 bg-accent text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                              {program.category || 'Program'}
                            </div>
                            {/* <div className="flex items-center gap-1.5 text-accent/80">
                              <MapPin size={12} />
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                                {locationNames.length > 0 ? locationNames.map((locationName: string) => (
                                  <span key={`${program.id}-${locationName}`}>
                                    <LocationTrigger
                                      name={locationName}
                                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-accent"
                                    >
                                      <span aria-hidden="true">📍</span>
                                      <span>{locationName}</span>
                                      <ArrowRight size={11} className="shrink-0" />
                                    </LocationTrigger>
                                  </span>
                                )) : (
                                  <span>{program.location || locationsText}</span>
                                )}
                              </div>
                            </div> */}
                          </div>

                          <h3 className="text-2xl md:text-4xl font-display font-black mb-4 md:mb-6 tracking-tight group-hover:text-accent transition-colors leading-tight uppercase text-white break-words">
                            {program.title || program.group}
                          </h3>

                          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl">
                            <div className="space-y-4 min-h-0">
                              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 border-b border-white/10 pb-2">Locatie</h5>
                              <div className="space-y-2.5">
                                {scheduleEntries.length > 0 ? scheduleEntries.map((entry: any, entryIndex: number) => (
                                  <div
                                    key={`${program.id || idx}-schedule-${entryIndex}`}
                                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/70 transition-colors md:text-white/55 md:group-hover:text-white"
                                  >
                                    <div className="flex w-full items-center justify-between gap-3">
                                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75 md:text-white/60 md:group-hover:text-white">
                                        {program.subscriptionTag || 'Program'}
                                      </span>
                                      <LocationTrigger
                                        name={entry.location}
                                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-accent"
                                      >
                                        <span>{entry.location || 'Locatie nespecificata'}</span>
                                        <ArrowRight size={11} className="shrink-0" />
                                      </LocationTrigger>
                                    </div>
                                  </div>
                                )) : (
                                  <div className="text-xs md:text-sm font-medium text-white/70 md:text-white/50 md:group-hover:text-white transition-colors">
                                    Locatiile si programul se stabilesc direct cu antrenorul.
                                  </div>
                                )}
                                {program.hasPrivate && (
                                  <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-3 py-2 text-[11px] text-white/45 md:text-white/35 md:group-hover:text-white/50">
                                    Privat: programul se stabileste direct cu antrenorul.
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="min-h-0 space-y-4">
  <h5 className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 border-b border-white/10 pb-2">
    {`Pret${program.price ? ` - ${program.price}` : ''}`}
  </h5>

  {/* Mobile - doar primul detaliu */}
  <div className="max-h-20 overflow-y-auto pr-2 md:hidden">
    {details.length > 0 ? (
      details.slice(0, 1).map((detail: any, dIdx: number) => (
        <div
          key={dIdx}
          className="flex min-w-0 items-center gap-2 text-white/60 transition-colors"
        >
          <CheckCircle2 size={12} className="text-accent/50" />
          <span className="truncate text-xs font-medium">{detail}</span>
        </div>
      ))
    ) : (
      <div className="flex min-w-0 items-center gap-2 text-white/40">
        <CheckCircle2 size={12} className="text-accent/50" />
        <span className="truncate text-xs font-medium">
          Echipament & suport inclus
        </span>
      </div>
    )}
  </div>

  {/* Desktop - toate detaliile */}
  <div className="hidden md:block max-h-36 overflow-y-auto pr-2 space-y-2">
    {details.length > 0 ? (
      details.map((detail: any, dIdx: number) => (
        <div
          key={dIdx}
          className="flex min-w-0 items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors"
        >
          <CheckCircle2 size={12} className="text-accent/50" />
          <span className="truncate text-xs font-medium">{detail}</span>
        </div>
      ))
    ) : (
      <div className="flex min-w-0 items-center gap-2 text-white/40">
        <CheckCircle2 size={12} className="text-accent/50" />
        <span className="truncate text-xs font-medium">
          Echipament & suport inclus
        </span>
      </div>
    )}
  </div>
</div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                          <div className="hidden md:flex flex-col sm:flex-row gap-4">
                            <motion.a
                              href="#contact"
                              onClick={(event) => {
                                event.preventDefault();
                                scrollToContact();
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] inline-flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex-1 rounded-lg"
                            >
                              Rezerva loc acum
                            </motion.a>
                            <Link
                              to={`/coach/${program.trainerId || trainer?._id || trainer?.id || ''}`}
                              className="px-6 py-3 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300 flex-1 text-center rounded-lg"
                            >
                              Detalii Profil
                            </Link>
                          </div>

                          <div className="md:hidden flex justify-center">
                            <Link
                              to={`/coach/${program.trainerId || trainer?._id || trainer?.id || ''}`}
                              className="w-full max-w-full px-5 py-3.5 bg-accent text-white text-[10px] font-black uppercase tracking-[0.18em] inline-flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(163,0,0,0.2)] rounded-full"
                            >
                              Vezi Detalii <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-8 md:mt-12">
            {data.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${selectedIndex === i ? 'w-12 bg-accent' : 'w-4 bg-white/10 hover:bg-white/30'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
