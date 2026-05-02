import { motion } from 'motion/react';
import { ChevronDown, Play } from 'lucide-react';
import { scrollToSection } from '../lib/utils';
import { useEffect, useRef, useState } from 'react';
import { api, getAssetUrl } from '../services/api';

const DEFAULT_HERO_MEDIA = 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=2000&auto=format&fit=crop';
const HERO_BG_DIM_TRIGGER_TOP = -80;
const OPACITY_DIMMED = 'opacity-0';

const isVideoMedia = (url?: string, type?: string) => {
  if (type === 'video') return true;
  if (type === 'image') return false;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(url || ''));
};

export default function Hero() {
  const [design, setDesign] = useState<any>({});
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isBackgroundDimmed, setIsBackgroundDimmed] = useState(false);
  const [isScrollHintVisible, setIsScrollHintVisible] = useState(true);
  const heroContentRef = useRef<HTMLDivElement | null>(null);

  const heroMediaMobile = getAssetUrl(design.heroMediaMobile);
  const heroMediaDesktop = getAssetUrl(design.heroMedia) || getAssetUrl(design.heroMediaDesktop) || DEFAULT_HERO_MEDIA;
  const activeHeroMedia = isMobileViewport ? (heroMediaMobile || heroMediaDesktop) : heroMediaDesktop;
  const activeHeroMediaType = isMobileViewport
    ? (design.heroMediaMobileType || (heroMediaMobile ? undefined : design.heroMediaType))
    : design.heroMediaType;
  const heroIsVideo = isVideoMedia(activeHeroMedia, activeHeroMediaType);
  const heroVisualPosition = isMobileViewport ? 'center top' : 'center center';

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const result = await api.getDesign();
        setDesign(result || {});
      } catch (error) {
        console.error('Failed to fetch design settings:', error);
      }
    };

    fetchDesign();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);

    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    const syncHeroState = () => {
      const contentRect = heroContentRef.current?.getBoundingClientRect();
      if (!contentRect) return;
      setIsBackgroundDimmed(contentRect.top <= HERO_BG_DIM_TRIGGER_TOP);
      setIsScrollHintVisible(window.scrollY <= 8);
    };

    syncHeroState();
    window.addEventListener('scroll', syncHeroState, { passive: true });
    window.addEventListener('resize', syncHeroState);

    return () => {
      window.removeEventListener('scroll', syncHeroState);
      window.removeEventListener('resize', syncHeroState);
    };
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-end justify-center overflow-hidden bg-transparent pb-10 pt-24 sm:min-h-[110vh] sm:items-center sm:pb-24 sm:pt-0 lg:pb-0">
      <div className={`pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 ${isBackgroundDimmed ? OPACITY_DIMMED : 'opacity-100'}`}>
        {heroIsVideo ? (
          <motion.video
            key={activeHeroMedia}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: heroVisualPosition }}
            src={activeHeroMedia}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <motion.div
            key={activeHeroMedia}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{ backgroundImage: `url("${activeHeroMedia}")`, backgroundPosition: heroVisualPosition }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 grid items-end gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-8">
          <motion.div
            ref={heroContentRef}
            initial={{ opacity: 0, x: isMobileViewport ? 0 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="isolate mx-auto w-full rounded-[30px] border border-white/10 bg-transparent p-5 shadow-none backdrop-blur-md md:mx-0 md:max-w-none md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none"
          >
            <div className="mb-4 flex items-center gap-3 md:mb-6 md:gap-4">
              <div className="h-[1px] w-12 bg-accent" />
              <span className="text-[11px] text-accent font-black tracking-[0.22em] uppercase sm:text-sm sm:tracking-[0.4em]">
                Stoica Brothers Fight Academy
              </span>
            </div>

            <h1 className="mb-4 break-words text-[clamp(2.4rem,10.5vw,4.1rem)] font-display font-black tracking-tighter leading-[0.92] sm:text-6xl md:mb-8 md:text-[80px] md:leading-[0.85]">
              REDEFINESTE <br />
              <span className="text-white/20 outline-text">LIMITA</span> <br />
              <span className="text-accent">PUTERII.</span>
            </h1>

            <p className="mb-6 max-w-xl border-l-2 border-white/10 pl-4 text-[15px] font-light leading-relaxed text-white/62 md:mb-12 md:pl-6 md:text-xl md:text-white/60">
              Nu e doar o sala. E un standard de viata. Antreneaza-te sub indrumarea campionilor mondiali intr-un mediu unde disciplina devine arta.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <motion.a
                href="#program"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection('program');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-accent px-6 py-3.5 text-sm text-white font-black uppercase tracking-[0.18em] transition-all duration-300 shadow-[0_10px_30px_rgba(163,0,0,0.3)] sm:px-12 sm:py-5 sm:text-base sm:tracking-widest"
              >
                Incepe Acum
              </motion.a>
              {/* <button className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500 text-white">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest group-hover:text-accent transition-colors">Vezi Academia</span>
              </button> */}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isScrollHintVisible ? 1 : 0 }}
              transition={{ delay: isScrollHintVisible ? 1.5 : 0, duration: 0.35 }}
              className="mt-6 flex w-full items-center gap-3 text-white/30 md:mt-8 lg:hidden"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll Down</span>
              <div className="h-[1px] w-12 bg-gradient-to-r from-accent to-transparent" />
              <div className="flex flex-col items-center leading-none text-accent/80">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{ y: [0, 5, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.18,
                    }}
                    className={index === 0 ? '' : '-mt-1'}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="hidden lg:col-span-4 lg:flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <h3 className="text-accent text-4xl font-display font-bold mb-1">2026</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Viziune Pentru Noua Generatie</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-8 bg-accent text-white translate-x-12 rounded-2xl shadow-[0_20px_40px_rgba(163,0,0,0.2)]"
          >
            <h3 className="text-4xl font-display font-bold mb-1">ELITE</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/60">Community & Mentorship</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <h3 className="text-accent text-4xl font-display font-bold mb-1">TEAM</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Disciplina, Fratie Si Ambitie</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrollHintVisible ? 1 : 0 }}
          transition={{ delay: isScrollHintVisible ? 1.5 : 0, duration: 0.35 }}
          className="hidden text-white/30 lg:col-span-12 lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll Down</span>
          <div className="flex flex-col items-center leading-none text-accent/80">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={`hero-scroll-${index}`}
                animate={{ y: [0, 5, 0], opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.18,
                }}
                className={index === 0 ? '' : '-mt-1'}
              >
                <ChevronDown size={14} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <style>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}</style>
    </section>
  );
}
