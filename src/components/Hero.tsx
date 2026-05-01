import { motion } from 'motion/react';
import { ChevronDown, Play } from 'lucide-react';
import { scrollToSection } from '../lib/utils';
import { useEffect, useState } from 'react';
import { api, getAssetUrl } from '../services/api';

const DEFAULT_HERO_MEDIA = 'https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?q=80&w=2000&auto=format&fit=crop';

const isVideoMedia = (url?: string, type?: string) => {
  if (type === 'video') return true;
  if (type === 'image') return false;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(String(url || ''));
};

export default function Hero() {
  const [design, setDesign] = useState<any>({});
  const heroMedia = getAssetUrl(design.heroMedia) || DEFAULT_HERO_MEDIA;
  const heroIsVideo = isVideoMedia(heroMedia, design.heroMediaType);

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

  return (
    <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden bg-black pb-24">
      {/* Background with cinematic image/overlay */}
      <div className="absolute inset-0 z-0">
        {heroIsVideo ? (
          <motion.video
            key={heroMedia}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
            src={heroMedia}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <motion.div
            key={heroMedia}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${heroMedia}")` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-accent" />
	              <span className="text-accent text-xs sm:text-sm font-black tracking-[0.26em] sm:tracking-[0.4em] uppercase">
                Stoica Brothers Fight Academy
              </span>
            </div>
            
	            <h1 className="text-5xl sm:text-6xl md:text-[120px] font-display font-black tracking-tighter leading-[0.9] md:leading-[0.85] mb-8 break-words">
              REDEFINEȘTE <br />
              <span className="text-white/20 outline-text">LIMITA</span> <br />
              <span className="text-accent">PUTERII.</span>
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-white/60 font-light mb-12 leading-relaxed border-l-2 border-white/10 pl-6">
              Nu e doar o sală. E un standard de viață. Antrenează-te sub îndrumarea campionilor mondiali într-un mediu unde disciplina devine artă.
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
	                className="px-8 sm:px-12 py-5 bg-accent text-white font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(163,0,0,0.3)] rounded-full"
              >
                Începe Acum
              </motion.a>
              {/* <button className="flex items-center gap-4 group">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500 text-white">
                  <Play size={20} fill="currentColor" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest group-hover:text-accent transition-colors">Vezi Academia</span>
              </button> */}
            </div>
          </motion.div>
        </div>

        {/* Modern Floating Stat Cards for Desktop */}
        <div className="hidden lg:col-span-4 lg:flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
          >
            <h3 className="text-accent text-4xl font-display font-bold mb-1">2026</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Standard de Performanță</p>
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
            className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
          >
            <h3 className="text-accent text-4xl font-display font-bold mb-1">TEAM</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Standard de Performanță</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll Down</span>
        <div className="w-[1px] h-20 bg-gradient-to-b from-accent to-transparent" />
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20" />
      
      <style>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}</style>
    </section>
  );
}
