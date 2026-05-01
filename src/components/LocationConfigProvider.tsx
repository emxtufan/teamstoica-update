import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, MapPin, Navigation, X } from 'lucide-react';
import { api, getAssetUrl } from '../services/api';

type LocationConfigItem = {
  _id?: string;
  name?: string;
  address?: string;
  wazeUrl?: string;
  googleMapsUrl?: string;
  image?: string;
};

type LocationConfigContextValue = {
  getLocationConfigByName: (name?: string) => LocationConfigItem | undefined;
  openLocationByName: (name?: string) => void;
};

const LocationConfigContext = createContext<LocationConfigContextValue>({
  getLocationConfigByName: () => undefined,
  openLocationByName: () => undefined,
});

const normalizeLocationKey = (value?: string) => (
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

export const splitLocationNames = (value?: string) => (
  String(value || '')
    .split(/(?:\s*&\s*|\s*\/\s*|,\s*)/g)
    .map(part => part.trim())
    .filter(Boolean)
);

export function LocationConfigProvider({ children }: { children: ReactNode }) {
  const [locationConfigs, setLocationConfigs] = useState<LocationConfigItem[]>([]);
  const [activeLocation, setActiveLocation] = useState<LocationConfigItem | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const result = await api.getLocationConfigs();
        setLocationConfigs(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error('Failed to fetch location configs:', error);
        setLocationConfigs([]);
      }
    };

    fetchLocations();
  }, []);

  const getLocationConfigByName = useMemo(() => {
    const configMap = new Map<string, LocationConfigItem>();

    locationConfigs.forEach(location => {
      const key = normalizeLocationKey(location?.name);
      if (key && !configMap.has(key)) {
        configMap.set(key, location);
      }
    });

    return (name?: string) => configMap.get(normalizeLocationKey(name));
  }, [locationConfigs]);

  const openLocationByName = (name?: string) => {
    const match = getLocationConfigByName(name);
    if (match) {
      setActiveLocation(match);
    }
  };

  return (
    <LocationConfigContext.Provider value={{ getLocationConfigByName, openLocationByName }}>
      {children}

      <AnimatePresence>
        {activeLocation && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.03)_46%,rgba(163,0,0,0.14)_100%)] text-white shadow-[0_24px_90px_rgba(0,0,0,0.4)]"
            >
              <button
                type="button"
                onClick={() => setActiveLocation(null)}
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/60 transition-all hover:border-accent hover:text-accent"
              >
                <X size={18} />
              </button>

              <div className="grid md:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-[260px] bg-black/30">
                  {activeLocation.image ? (
                    <img
                      src={getAssetUrl(activeLocation.image)}
                      alt={activeLocation.name || 'Locatie'}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(163,0,0,0.3),transparent_50%),linear-gradient(145deg,#151515_0%,#050505_100%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Locatie Stoica Brothers</p>
                    <h3 className="mt-3 text-3xl font-display font-black uppercase tracking-tight text-white md:text-4xl">
                      {activeLocation.name || 'Locatie'}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 md:p-8">
                  <div>
                    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Adresa</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/72 md:text-base">
                          {activeLocation.address || 'Adresa nu este completata in admin.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    {activeLocation.googleMapsUrl && (
                      <a
                        href={activeLocation.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-accent hover:text-white"
                      >
                        Google Maps <ExternalLink size={14} />
                      </a>
                    )}
                    {activeLocation.wazeUrl && (
                      <a
                        href={activeLocation.wazeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:border-accent hover:text-accent"
                      >
                        Waze <Navigation size={14} />
                      </a>
                    )}
                    {!activeLocation.googleMapsUrl && !activeLocation.wazeUrl && (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-4 text-center text-xs text-white/35">
                        Adauga link de Waze sau Google Maps din admin pentru navigatie rapida.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </LocationConfigContext.Provider>
  );
}

export function useLocationConfig() {
  return useContext(LocationConfigContext);
}

export function LocationTrigger({
  name,
  className = '',
  children,
}: {
  name?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { getLocationConfigByName, openLocationByName } = useLocationConfig();
  const hasConfig = Boolean(getLocationConfigByName(name));

  if (!hasConfig) {
    return <span className={className}>{children || name}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => openLocationByName(name)}
      className={`pointer-events-auto cursor-pointer transition-all hover:text-accent hover:underline underline-offset-4 ${className}`}
    >
      {children || name}
    </button>
  );
}
