import { motion } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, getAssetUrl } from '../services/api';

export default function FullGallery() {
  const navigate = useNavigate();
  const [data, setData] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const results = await api.getGallery();
        const apiImages = Array.isArray(results)
          ? results.map((item: any) => getAssetUrl(item.url)).filter(Boolean)
          : [];
        setData(apiImages);
      } catch (error) {
        console.error('Failed to fetch full gallery:', error);
        setData([]);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black pt-24 pb-20 px-6"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
          <div>
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Visual Archive</span>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter">
              Galerie <span className="text-white/30">Completă.</span>
            </h1>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="group flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
              <X size={24} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">Închide</span>
          </button>
        </div>

        {data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {data.map((img, idx) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden aspect-[4/5] rounded-2xl md:rounded-[2rem] border border-white/5 bg-white/5"
              >
                <img 
                  src={getAssetUrl(img)} 
                  alt={`Stoica Academy Gallery ${idx + 1}`} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Galerie</p>
            <p className="mt-4 text-sm text-white/45">
              Nu exista imagini in baza de date momentan. Adauga poze din admin pentru a le afisa aici.
            </p>
          </div>
        )}

        <div className="mt-20 text-center">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-4 mx-auto text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Înapoi la pagina principală</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
