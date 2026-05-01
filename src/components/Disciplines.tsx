import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DISCIPLINES } from '../constants';
import { api, getAssetUrl } from '../services/api';

export default function Disciplines() {
  const [data, setData] = useState<any[]>(DISCIPLINES);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await api.getMartialArts();
        if (results && results.length > 0) {
          setData(results);
        }
      } catch (error) {
        console.error('Failed to fetch martial arts:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="discipline" className="bg-surface py-18">
      <div className="container mx-auto px-6">
        <div className="mb-5 text-center xl:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 block text-sm font-bold uppercase tracking-[0.3em] text-accent"
          >
            Artele Martiale
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-display font-bold text-white md:text-6xl"
          >
            ALEGE-TI <span className="text-white/40">CALEA.</span>
          </motion.h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm font-light leading-relaxed text-white/55 md:text-base">
            De la incepatori la avansati, fiecare disciplina este gandita sa-ti ofere structura, conditie fizica si progres real, in ritmul potrivit pentru obiectivele tale.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.map((discipline, idx) => (
            <motion.div
              key={discipline.id || discipline._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="group relative h-[250px] cursor-pointer overflow-hidden rounded-2xl border border-white/10 md:h-[340px] md:rounded-3xl xl:h-[250px]"
            >
              <img
                src={getAssetUrl(discipline.image || discipline.icon || 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2000&auto=format&fit=crop')}
                alt={discipline.title}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-95 group-hover:rounded-2xl group-hover:brightness-110 group-hover:opacity-100"
              />

              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="mb-4 text-3xl font-display font-bold transition-colors group-hover:text-accent">
                  {discipline.title}
                </h3>
                <p className="mb-6 line-clamp-2 text-sm font-light text-white/60 transition-all duration-300 group-hover:line-clamp-none">
                  {discipline.description}
                </p>

                {discipline.features && (
                  <ul className="mb-8 space-y-2 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {discipline.features.map((feature: any) => (
                      <li key={feature} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                        <div className="h-1 w-1 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
