import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { api, getAssetUrl } from '../services/api';
import { normalizePalmaresProfiles, type LegacyPalmaresCard, type PalmaresProfile } from '../lib/palmares';
import { scrollToContact } from '../lib/utils';

type FightGala = {
  _id?: string;
  name?: string;
  fighters?: string;
  logo?: string;
  location?: string;
  years?: string;
  highlight?: string;
  description?: string;
  website?: string;
  youtubeUrl?: string;
};

type DesignSettings = {
  palmaresCards?: LegacyPalmaresCard[];
  palmaresProfiles?: PalmaresProfile[];
};

const getInitials = (value?: string) => (
  String(value || 'SB')
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
);

const getYouTubeId = (url?: string) => {
  const value = String(url || '').trim();
  if (!value) return '';

  const patterns = [
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/watch\?v=([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return value.length === 11 ? value : '';
};

type FightGalaCardProps = {
  key?: string | number;
  gala: FightGala;
  idx: number;
  activeVideo: string;
  setActiveVideo: (value: string) => void;
};

function FightGalaCard({ gala, idx, activeVideo, setActiveVideo }: FightGalaCardProps) {
  const videoId = getYouTubeId(gala.youtubeUrl);
  const videoKey = `${gala._id || gala.name || idx}-${videoId}`;
  const isActive = activeVideo === videoKey;

  return (
    <div
      style={{
        zIndex: idx + 1,
      }}
      className={`
        card${idx + 1} sticky top-[15vh] mx-auto flex w-full max-w-[26rem] min-h-[430px] sm:static sm:top-auto sm:mx-0 md:min-h-[420px] md:max-w-none xl:aspect-[3/4] xl:min-h-[280px] flex-col justify-between gap-4 md:gap-4 xl:gap-3 overflow-hidden rounded-[25px] md:rounded-[28px] xl:rounded-2xl border border-white/10 bg-[linear-gradient(145deg,#2e251e_0%,#0c0c0c_52%,#230505_100%)] md:bg-[linear-gradient(145deg,#241d17_0%,#0c0c0c_52%,#2a0707_100%)] xl:bg-white/[0.035] p-5 md:p-6 xl:p-4 transition-all shadow-[0_24px_80px_rgba(0,0,0,0.55)]
        ${idx % 2 === 1 ? 'xl:mt-12' : ''}
      `}
    >
      <div className="relative flex flex-row-reverse items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl md:text-2xl xl:text-lg font-black uppercase tracking-tight text-white transition-colors">
            {gala.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            {gala.fighters || 'Bogdan & Andrei Stoica'}
          </p>
          <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            {[gala.location, gala.years].filter(Boolean).join(' | ') || 'Gala internationala'}
          </p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/70 p-2 ring-2 ring-white/5">
          {gala.logo ? (
            <img
              src={getAssetUrl(gala.logo)}
              alt={gala.name || 'Gala'}
              className="h-full w-full object-contain grayscale transition-all duration-500 hover:grayscale-0"
            />
          ) : (
            <span className="font-display text-sm font-black text-white/35">
              {getInitials(gala.name)}
            </span>
          )}
        </div>
      </div>
      {!videoId ? (
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl md:rounded-2xl xl:rounded-xl border border-white/10 bg-black/50 text-center text-[9px] font-black uppercase tracking-widest text-white/25">
          Adauga video YouTube
        </div>
      ) : (
        <div className="relative aspect-video overflow-hidden rounded-2xl md:rounded-2xl xl:rounded-xl border border-white/10 bg-black">
          {isActive ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`${gala.name || 'Gala'} video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setActiveVideo(videoKey)}
              className="absolute inset-0 h-full w-full overflow-hidden"
              aria-label={`Porneste video ${gala.name || 'gala'}`}
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt={`${gala.name || 'Gala'} video preview`}
                className="h-full w-full object-cover opacity-80 grayscale transition-all duration-500 hover:scale-105 hover:grayscale-0"
              />
              <span className="absolute inset-0 bg-black/30" />
              <span className="absolute left-1/2 top-1/2 flex h-12 w-12 md:h-16 md:w-16 xl:h-10 xl:w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-xs font-black text-white shadow-xl shadow-accent/30">
                <span className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-white" />
              </span>
            </button>
          )}
        </div>
      )}
      <div className="relative min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {gala.highlight && (
            <span className="rounded-full bg-accent px-3 py-1.5 md:px-3.5 md:py-2 xl:px-2.5 xl:py-1 text-[9px] md:text-[10px] xl:text-[8px] font-black uppercase tracking-widest text-white">
              {gala.highlight}
            </span>
          )}
        </div>
        {gala.description && (
          <p className="mt-3 line-clamp-4 md:line-clamp-none xl:line-clamp-3 text-sm md:text-base xl:text-xs leading-relaxed text-white/55">
            {gala.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function About() {
  const [galas, setGalas] = useState<FightGala[]>([]);
  const [design, setDesign] = useState<DesignSettings>({});
  const [activeVideo, setActiveVideo] = useState('');
  const palmaresProfiles = normalizePalmaresProfiles(design);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const [results, designResults] = await Promise.all([
          api.getFightGalas(),
          api.getDesign(),
        ]);

        setGalas(Array.isArray(results) ? results : []);
        setDesign(designResults || {});
      } catch (error) {
        console.error('Failed to fetch about content:', error);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <section id="despre" className="py-16 lg:py-32 bg-black overflow-x-clip">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <span className="text-accent text-sm font-bold tracking-widest uppercase mb-4 block">Legendele Ringului</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
                Bogdan & Andrei <br />
                <span className="text-white/40">Stoica</span>
              </h2>
              <p className="text-lg text-white/70 font-light leading-relaxed mb-8">
                Fratii Stoica au dus numele Romaniei pe scene internationale, in gale unde presiunea,
                spectacolul si performanta se intalnesc sub aceeasi lumina. Mai jos poti administra
                din panou organizatiile si galele importante in care au luptat.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <h4 className="text-accent text-3xl font-display font-bold mb-2">15+</h4>
                  <p className="text-xs uppercase tracking-widest text-white/50">Ani de performanta</p>
                </div>
                <div>
                  <h4 className="text-accent text-3xl font-display font-bold mb-2">10+</h4>
                  <p className="text-xs uppercase tracking-widest text-white/50">Titluri mondiale</p>
                </div>
              </div>
              <div className="mb-10 grid gap-4 xl:grid-cols-2">
                {palmaresProfiles.slice(0, 2).map((profile, idx) => {
                  const stats = [
                    { label: 'Meciuri', value: profile.matches },
                    { label: 'Victorii', value: profile.wins },
                    { label: 'KO', value: profile.kos },
                  ].filter(stat => stat.value);

                  const groups = [
                    { label: 'Gale', items: profile.importantGalas },
                    { label: 'Turnee', items: profile.tournaments },
                    { label: 'Premii', items: profile.awards },
                  ].filter(group => group.items.length > 0);

                  return (
                    <div
                      key={`${profile.slug}-${idx}`}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,#171717_0%,#070707_48%,#250606_100%)] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]"
                    >
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/20 blur-2xl transition-opacity duration-500 group-hover:opacity-80" />
                      <div className="relative">
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                              {profile.name}
                            </p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/35">
                              {profile.title || 'Campion'}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/55">
                            0{idx + 1}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl font-black uppercase leading-none text-white">
                          {profile.record || 'Palmares international'}
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-white/55">
                          {profile.biography || 'Completeaza palmaresul din admin pentru acest card.'}
                        </p>

                        {stats.length > 0 && (
                          <div className="mt-5 grid grid-cols-3 gap-2">
                            {stats.map(stat => (
                              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
                                <p className="text-sm font-black text-white">{stat.value}</p>
                                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">
                                  {stat.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {profile.highlight && (
                          <div className="mt-5 inline-flex rounded-full bg-accent px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                            {profile.highlight}
                          </div>
                        )}

                        {groups.length > 0 && (
                          <div className="mt-5 space-y-3">
                            {groups.map(group => (
                              <div key={group.label}>
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">
                                  {group.label}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {group.items.map(item => (
                                    <span
                                      key={`${profile.slug}-${group.label}-${item}`}
                                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60"
                                    >
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={scrollToContact} className="inline-block border-b-2 border-accent pb-2 text-sm font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors">
                Antreneaza-te cu cei mai buni
              </button>
            </motion.div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-6 pb-8 xl:grid xl:grid-cols-2 xl:gap-5 xl:pb-0">
              {galas.map((gala, idx) => (
                <FightGalaCard
                  key={gala._id || gala.name || idx}
                  gala={gala}
                  idx={idx}
                  activeVideo={activeVideo}
                  setActiveVideo={setActiveVideo}
                />
              ))}

              {galas.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-white/45">
                  Galele adaugate in admin vor aparea aici cu sigla, nume si detalii.
                </div>
              )}
            </div>

            <div className="absolute -z-10 top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px]" />
          </div>
        </div>
      </div>

    </section>
  );
}
