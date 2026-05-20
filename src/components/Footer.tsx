import { useEffect, useState } from 'react';
import { Facebook, Instagram, MessageCircle, Youtube } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { scrollToHash } from '../lib/utils';
import { api, getAssetUrl } from '../services/api';

type SocialLinkItem = {
  href: string;
  icon: any;
  label: string;
};

type ReceptionRow = {
  label: string;
  value: string;
};

export default function Footer() {
  const [siteLogo, setSiteLogo] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [receptionRows, setReceptionRows] = useState<ReceptionRow[]>([]);

  useEffect(() => {
    let mounted = true;

    api
      .getDesign()
      .then((result) => {
        if (!mounted) return;

        setSiteLogo(getAssetUrl(result?.siteLogo));
        setSocialLinks([
          { href: result?.instagramUrl || '', icon: Instagram, label: 'Instagram' },
          { href: result?.facebookUrl || '', icon: Facebook, label: 'Facebook' },
          { href: result?.youtubeUrl || '', icon: Youtube, label: 'YouTube' },
          { href: result?.whatsappUrl || '', icon: MessageCircle, label: 'WhatsApp' },
        ]);
        setReceptionRows([
          {
            label: result?.receptionLabel1 || 'Luni - Vineri',
            value: result?.receptionHours1 || '08:00 - 22:00',
          },
          {
            label: result?.receptionLabel2 || 'Sambata',
            value: result?.receptionHours2 || '10:00 - 15:00',
          },
          {
            label: result?.receptionLabel3 || 'Duminica',
            value: result?.receptionHours3 || 'Inchis',
          },
        ]);
      })
      .catch(() => {
        if (!mounted) return;
        setSiteLogo('');
        setSocialLinks([]);
        setReceptionRows([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="bg-black py-20">
      <div className="container mx-auto px-6">
        <div className="mb-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mb-6 inline-flex min-h-30 items-center text-white"
            >
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt="Stoica Brothers"
                  className="h-25 w-auto max-w-[220px] object-contain"
                />
              ) : (
                <span className="text-3xl font-display font-bold tracking-tighter">
                  STOICA <span className="text-accent">BROTHERS</span>
                </span>
              )}
            </a>
            <p className="mb-8 max-w-sm text-sm font-light leading-relaxed text-white/40">
              Academia de elita pentru sporturi de contact, unde disciplina intalneste performanta. Fondata de campioni, pentru viitori campioni.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href || '#'}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noreferrer' : undefined}
                  onClick={(event) => {
                    if (!href) {
                      event.preventDefault();
                    }
                  }}
                  aria-label={label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all ${
                    href
                      ? 'text-white/60 hover:border-accent hover:text-accent'
                      : 'cursor-default text-white/20'
                  }`}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">Navigatie</h4>
            <ul className="space-y-4">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(event) => {
                      if (scrollToHash(link.href)) {
                        event.preventDefault();
                      }
                    }}
                    className="text-sm text-white/50 transition-colors hover:text-accent"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-bold uppercase tracking-widest text-white">Receptie</h4>
            <ul className="space-y-4 text-sm text-white/50">
              {(receptionRows.length > 0 ? receptionRows : [
                { label: 'Luni - Vineri', value: '08:00 - 22:00' },
                { label: 'Sambata', value: '10:00 - 15:00' },
                { label: 'Duminica', value: 'Inchis' },
              ]).map((row) => (
                <li key={`${row.label}-${row.value}`} className="flex justify-between gap-4">
                  <span>{row.label}</span>
                  <span className="text-right text-white">{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[10px] font-bold uppercase tracking-widest text-white/30 md:flex-row">
          <p>© 2026 Stoica Brothers Academy. Toate drepturile rezervate.</p>
          <div className="flex items-center gap-8">
            <a href="#" onClick={(event) => event.preventDefault()} className="transition-colors hover:text-white">Termeni & Conditii</a>
            <a href="#" onClick={(event) => event.preventDefault()} className="transition-colors hover:text-white">Politica de Confidentialitate</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
