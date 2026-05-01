import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, getAssetUrl } from '../services/api';

export default function Gallery() {
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await api.getGallery();
        const dynamicUrls = Array.isArray(results)
          ? results.map((item: any) => getAssetUrl(item.url)).filter(Boolean)
          : [];
        setData(dynamicUrls);
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
        setData([]);
      }
    };
    fetchData();
  }, []);

  return (
    <section id="galerie" className="py-18 bg-black relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="text-white">
            <span className="text-accent text-sm font-bold tracking-widest uppercase mb-4 block">Visual Experience</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white uppercase tracking-tighter">
              ATMOSFERĂ <span className="text-white/40">& ENERGIE.</span>
            </h2>
          </div>
          <p className="max-w-md text-white/50 font-light text-sm">
            Fiecare antrenament este o poveste despre depășirea limitelor. Explorează galeria și simte vibrația Stoica Brothers Academy.
          </p>
        </div>

        {data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.slice(0, 8).map((img, idx) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "group relative overflow-hidden bg-white/5 aspect-square rounded-xl md:rounded-2xl border border-white/5",
                  idx === 2 || idx === 5 ? "md:col-span-2 md:row-span-2" : ""
                )}
              >
                <img 
                  src={getAssetUrl(img)} 
                  alt="Stoica Academy" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Galerie</p>
            <p className="mt-4 text-sm text-white/45">
              Nu exista imagini in baza de date momentan. Adauga poze din admin pentru a le afisa aici.
            </p>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link 
            to="/galerie"
            className="group flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-xl shadow-accent/0 group-hover:shadow-accent/20">
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-accent transition-colors">View All Gallery</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
