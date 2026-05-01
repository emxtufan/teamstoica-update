import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { cn, scrollToContact, scrollToHash } from '../lib/utils';
import { api, getAssetUrl } from '../services/api';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    api
      .getDesign()
      .then((result) => {
        if (!mounted) return;
        setSiteLogo(getAssetUrl(result?.siteLogo));
      })
      .catch(() => {
        if (!mounted) return;
        setSiteLogo('');
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-[70] px-4 py-3 transition-all duration-500 md:px-8 md:py-4 xl:px-12',
          isScrolled ? 'glass py-2.5 md:py-3' : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 md:gap-4">
          <motion.a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-w-0 items-center gap-2 text-lg font-display font-bold tracking-tighter md:gap-3 md:text-2xl"
          >
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="Stoica Brothers"
                className="h-15 w-auto max-w-[118px] object-contain sm:h-10 sm:max-w-[132px] md:h-14 md:max-w-[160px]"
              />
            ) : (
              <>
                <span className="truncate text-white transition-colors duration-500">STOICA</span>
                <span className="truncate text-accent">BROTHERS</span>
              </>
            )}
          </motion.a>

          <div className="hidden xl:flex items-center gap-8">
            {NAV_LINKS.map((link, idx) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(event) => {
                  if (scrollToHash(link.href)) {
                    event.preventDefault();
                  }
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  'text-sm font-medium uppercase tracking-widest transition-colors duration-500',
                  'hover:text-accent',
                  isScrolled ? 'text-white/70' : 'text-white/80'
                )}
              >
                {link.name}
              </motion.a>
            ))}

            <motion.button
              type="button"
              onClick={scrollToContact}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-full bg-accent px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 hover:bg-white hover:text-black"
            >
              Inscrie-te
            </motion.button>
          </div>

          <div className="hidden lg:flex xl:hidden items-center gap-2">
            <button
              type="button"
              onClick={scrollToContact}
              className="rounded-full bg-accent px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-accent/20"
            >
              Inscrie-te
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-accent hover:text-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Inchide meniul' : 'Deschide meniul'}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-accent hover:text-accent"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Inchide meniul' : 'Deschide meniul'}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[80] xl:hidden">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Inchide meniul"
            />

            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-[360px] flex-col overflow-y-auto border-l border-white/10 bg-[linear-gradient(180deg,#090909_0%,#111111_48%,#1d0505_100%)] px-4 py-14 sm:px-5 md:max-w-[390px] md:px-6 md:py-16"
            >
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="absolute right-4 top-4 z-[90] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:border-accent hover:text-accent md:right-5 md:top-5"
                aria-label="Inchide meniul"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">Navigatie</p>
                <h3 className="mt-2 text-2xl font-display font-black uppercase tracking-tight text-white md:text-3xl">Meniu</h3>
              </div>

              <div className="flex flex-col gap-2.5">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(event) => {
                      setIsMenuOpen(false);
                      if (scrollToHash(link.href)) {
                        event.preventDefault();
                      }
                    }}
                    className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-base font-display font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-accent/40 hover:text-accent sm:text-lg md:rounded-2xl md:px-5 md:py-3.5 md:text-xl"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  scrollToContact();
                }}
                className="mt-6 rounded-full bg-accent px-6 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white md:mt-auto md:px-8 md:py-4 md:text-sm md:tracking-[0.18em]"
              >
                Inscrie-te acum
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
