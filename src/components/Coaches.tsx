import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getAssetUrl } from '../services/api';
import { scrollToContact } from '../lib/utils';

export default function Coaches() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: data.length > 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await api.getCoaches();
        setData(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Failed to fetch coaches:', error);
      }
    };
    fetchData();
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, data.length, onSelect]);

  const nextSlide = () => emblaApi?.scrollNext();
  const prevSlide = () => emblaApi?.scrollPrev();

  return (
    <section className="relative overflow-hidden bg-black py-14 md:py-18">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end md:gap-8">
          <div>
            <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-accent">Echipa Noastra</span>
            <h2 className="text-4xl font-display font-bold text-white md:text-6xl">
              COACHING DE <span className="text-white/40">ELITA.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base">
              Antrenori cu stiluri distincte, experienta reala de competitie si o abordare construita pentru progres autentic, indiferent de nivelul de la care incepi.
            </p>
          </div>

          <div className="hidden gap-4 md:flex">
            <button
              onClick={prevSlide}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-white transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-white transition-all duration-300 hover:border-accent hover:bg-accent hover:text-white"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex cursor-grab gap-4 active:cursor-grabbing md:gap-8">
            {data.map((coach) => (
              <motion.div
                key={coach._id || coach.id}
                className="group min-w-0 flex-[0_0_100%] sm:flex-[0_0_360px] lg:flex-[0_0_450px]"
              >
                <div className="relative mb-4 h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-black transition-all duration-1000 md:mb-8 md:h-[520px] md:rounded-3xl lg:h-[560px] sm:h-[420px]">
                  {coach.image ? (
                    <img
                      src={getAssetUrl(coach.image)}
                      alt={coach.name}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 h-full w-full bg-white/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                  <div className="absolute inset-x-0 bottom-0 min-h-[130px] bg-gradient-to-t from-black via-black/80 to-transparent p-5 transition-transform duration-500 md:min-h-[170px] md:translate-y-full md:p-8 md:group-hover:translate-y-0">
                    <p className="mb-2 text-[8px] font-black uppercase tracking-[0.3em] text-accent md:text-[10px]">Bio & Specializare</p>
                    <p className="mb-2 line-clamp-3 text-xs font-light leading-relaxed text-white/90 md:mb-4 md:line-clamp-none md:text-sm md:text-white/80">
                      {coach.bio || coach.description}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/coach/${coach._id || coach.id}`}
                  className="flex min-h-[70px] items-end justify-between rounded-2xl border border-white/10 bg-black p-4 md:min-h-[92px] md:rounded-none md:border-x-0 md:border-t-0 md:pb-4"
                >
                  <div className="min-w-0 pr-4">
                    <h3 className="mb-1 truncate text-2xl font-display font-bold text-white transition-colors group-hover:text-accent md:text-3xl">
                      {coach.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <p className="line-clamp-2 text-xs font-bold uppercase tracking-widest text-accent">{coach.role}</p>
                    </div>
                  </div>
                  <span className="-mr-2 p-2 text-white/20 transition-colors group-hover:text-accent" title="Vezi Profil Complet">
                    <ArrowRight size={24} />
                  </span>
                </Link>
              </motion.div>
            ))}

            <div className="group flex min-w-0 flex-[0_0_100%] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center transition-all hover:border-accent/40 md:rounded-3xl sm:flex-[0_0_360px] sm:p-12 lg:flex-[0_0_450px]">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-white transition-all duration-500 group-hover:bg-accent group-hover:text-white">
                <span className="text-4xl font-bold">+</span>
              </div>
              <h3 className="mb-4 text-2xl font-display font-bold text-white">Alatura-te Echipei</h3>
              <p className="mb-8 max-w-[250px] text-sm text-white/40">
                Cautam permanent antrenori pasionati care vor sa performeze sub culorile Team Stoica.
              </p>
              <button
                type="button"
                onClick={scrollToContact}
                className="border border-white/10 bg-white/5 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-accent hover:text-white"
              >
                Trimite Aplicarea
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3 md:hidden">
          <button
            onClick={prevSlide}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition-all active:bg-accent active:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={nextSlide}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition-all active:bg-accent active:text-white"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="relative mt-6 h-[1px] w-full bg-white/5 md:mt-12">
          <motion.div
            className="absolute left-0 top-0 h-full bg-accent"
            animate={{ width: `${data.length > 0 ? ((currentIndex + 1) / data.length) * 100 : 0}%` }}
            transition={{ type: 'spring', damping: 30, stiffness: 100 }}
          />
        </div>
      </div>
    </section>
  );
}
