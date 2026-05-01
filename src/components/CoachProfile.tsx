import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Clock, Zap, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, getAssetUrl } from '../services/api';
import { scrollToContact } from '../lib/utils';
import { LocationTrigger, splitLocationNames } from './LocationConfigProvider';

const premiumCardClass = 'relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.035)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm shadow-[0_18px_60px_rgba(0,0,0,0.25)]';

export default function CoachProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const coaches = await api.getCoaches();
        const coachesList = Array.isArray(coaches) ? coaches : [];
        const selectedCoach = coachesList.find((item: any) => item._id === id || item.id === id);

        setCoach(selectedCoach || null);
      } catch (error) {
        console.error('Failed to fetch coach profile:', error);
        setCoach(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white/30 text-xs font-black uppercase tracking-widest">
        Loading trainer profile...
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4 text-secondary">Antrenor negasit</h1>
          <Link to="/" className="text-accent underline">Inapoi la prima pagina</Link>
        </div>
      </div>
    );
  }

  const bio = coach.bio || coach.description || '';
  const specialties = coach.specialties || coach.specializations || [];
  const locations = coach.locations || [];
  const trainingSchedule = coach.trainingSchedule || [];
  const privateDetails = coach.privateDetails || [];
  const groupDetails = coach.groupDetails || [];
  const priceCards = [
    {
      title: 'Privat 1:1',
      eyebrow: '💳 SEDINTA INDIVIDUALA',
      price: `${coach.privatePrice} LEI` || `${coach.basePrice} LEI` || null,
      meta: 'Antrenament personalizat',
      details: privateDetails,
      accent: 'bg-white text-black',
    },
    {
      title: 'Grupa',
      eyebrow: '🏷️ ABONAMENT GRUPA',
      price: `${coach.groupPrice} LEI / luna` || null,
      // meta: [coach.groupLocation, coach.groupSchedule].filter(Boolean).join(' · '),
      details: groupDetails,
      accent: 'bg-accent text-white',
    },
  ].filter(card => card.price);
  const groupLocationNames = splitLocationNames(coach.groupLocation);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-white">
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {coach.image ? (
          <motion.img
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            src={getAssetUrl(coach.image)}
            alt={coach.name}
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
        ) : (
          <div className="absolute inset-0 bg-white/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-12 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest mb-12 hover:gap-4 transition-all"
          >
            <ArrowLeft size={16} /> Inapoi la Academie
          </button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-accent text-sm font-bold tracking-[0.4em] uppercase mb-4 block">Elite Trainer Profile</span>
            <h1 className="text-5xl md:text-8xl font-display font-black mb-4 uppercase leading-none text-white">{coach.name}</h1>
            <p className="text-2xl md:text-3xl text-white/40 font-display font-bold uppercase tracking-widest">{coach.role}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-18">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-16">
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-8">Filozofie & Bio</h2>
              <p className="text-xl md:text-2xl font-light leading-relaxed text-white/70 italic border-l-2 border-accent pl-8">
                "{bio}"
              </p>
            </section>

            {specialties.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-8">Arii de Expertiza</h2>
                <div className="flex flex-wrap gap-4">
                  {specialties.map((spec: string, idx: number) => (
                    <div key={`${spec}-${idx}`} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 group hover:border-accent transition-all">
                      <Zap size={14} className="text-accent" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white">{spec}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {trainingSchedule.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-8">Program pe Ore</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {trainingSchedule.map((session: any, idx: number) => (
                    <div key={`${session.time}-${idx}`} className={`${premiumCardClass} p-6 transition-all hover:border-accent/40`}>
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-2xl font-display font-black text-white">{session.time}</span>
                        <LocationTrigger
                          name={session.location}
                          className="text-[10px] font-black uppercase tracking-widest text-accent"
                        >
                          <span>{session.location}</span>
                        </LocationTrigger>
                      </div>
                      {session.title && (
                        <p className="text-sm text-white/50 font-medium">{session.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {locations.length > 0 && (
              <section>
  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-8">
    Locatii de Antrenament
  </h2>

  <div className="grid sm:grid-cols-2 gap-6">
    {locations.map((loc: any, idx: number) => (
      <div
        key={`${loc.name}-${idx}`}
        className={`${premiumCardClass} p-8 transition-all hover:border-accent/40`}
      >
        <MapPin className="text-accent mb-6" size={32} />

        <LocationTrigger
          name={loc.name}
          className="text-xl font-display font-black mb-2 uppercase tracking-tight text-white"
        >
          <span>{loc.name}</span>
        </LocationTrigger>

        <p className="text-white/40 text-sm mb-4 leading-relaxed">
          {loc.address}
        </p>

        <LocationTrigger name={loc.name}>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:border-accent hover:text-accent">
            More
          </button>
        </LocationTrigger>
      </div>
    ))}
  </div>
</section>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-8">
              {priceCards.length > 0 && (
                <div className="space-y-4">
                  {priceCards.map((card) => (
                    <div key={card.title} className={`${premiumCardClass} p-6`}>
                      <div className="flex items-start justify-between gap-4 mb-8">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/35 mb-3">{card.eyebrow}</p>
                          <h3 className="text-2xl font-display font-black uppercase tracking-tight text-white">{card.title}</h3>
                        </div>
                        <div className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${card.accent}`}>
                          Pret
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">{card.price}</p>
                        {card.meta && (
                          card.title === 'Grupa' && groupLocationNames.length > 0 ? (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                              {groupLocationNames.map((locationName: string) => (
                                <span key={`${card.title}-${locationName}`}>
                                  <LocationTrigger name={locationName}>
                                    <span>{locationName}</span>
                                  </LocationTrigger>
                                </span>
                              ))}
                              {coach.groupSchedule && <span className="text-white/35">{coach.groupSchedule}</span>}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-accent">{card.meta}</p>
                          )
                        )}
                      </div>
                      {card.details.length > 0 && (
                        <ul className="space-y-3 mb-8">
                          {card.details.map((detail: string) => (
                            <li key={detail} className="flex items-start gap-3 text-sm text-white/65">
                              <Shield size={15} className="text-accent mt-0.5 shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <a href="/#contact" onClick={(event) => {
                        event.preventDefault();
                        scrollToContact();
                      }} className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.24em] flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-300 rounded-lg">
                        Rezerva loc
                      </a>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
