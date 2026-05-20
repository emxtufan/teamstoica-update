import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const premiumCardClass = 'border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.035)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm shadow-[0_18px_60px_rgba(0,0,0,0.25)]';

interface LocationConfigItem {
  _id?: string;
  name?: string;
  address?: string;
}

interface ContactSettings {
  contactPhone?: string;
  contactEmail?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Kickboxing',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [locations, setLocations] = useState<LocationConfigItem[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactSettings>({});

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const [locationResults, designResults] = await Promise.all([
          api.getLocationConfigs(),
          api.getDesign(),
        ]);

        setLocations(Array.isArray(locationResults) ? locationResults : []);
        setContactSettings({
          contactPhone: designResults?.contactPhone || '',
          contactEmail: designResults?.contactEmail || '',
        });
      } catch (error) {
        console.error('Failed to fetch contact settings:', error);
        setLocations([]);
        setContactSettings({});
      }
    };

    fetchContactData();
  }, []);

  const locationLines = useMemo(() => (
    locations
      .map(location => ({
        name: String(location?.name || '').trim(),
        address: String(location?.address || '').trim(),
      }))
      .filter(location => location.name || location.address)
  ), [locations]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await api.sendContactRequest(formData);
      setSubmitStatus({ type: 'success', message: 'Solicitarea ta a fost inregistrata! Te vom contacta in curand.' });
      setFormData({ name: '', email: '', phone: '', interest: 'Kickboxing', message: '' });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'A aparut o eroare la trimitere. Te rugam sa incerci din nou.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-black py-18">
      <div className="container mx-auto px-6 text-white">
        <div className="grid gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-accent">Contact</span>
            <h2 className="mb-8 text-4xl font-display font-bold md:text-6xl">
              INCEPE ACUM <br />
              <span className="text-white/40">CALATORIA TA.</span>
            </h2>
            <p className="mb-12 max-w-md font-light leading-relaxed text-white/60">
              Esti gata sa intri in ring? Completeaza formularul sau viziteaza-ne la sala pentru un trial gratuit. Echipa noastra te va contacta in cel mai scurt timp.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6 font-mono">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-accent">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold uppercase tracking-widest">Adrese Academie</h4>
                  <div className="space-y-2 text-sm text-white/50">
                    {locationLines.length > 0 ? locationLines.map((location, index) => (
                      <p key={`${location.name}-${index}`}>
                        {location.name ? `${location.name}: ` : ''}
                        {location.address || 'Adresa neconfigurata'}
                      </p>
                    )) : (
                      <p>Adresele vor aparea aici dupa ce sunt salvate in admin.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6 font-mono">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-accent">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold uppercase tracking-widest">Telefon Direct</h4>
                  <p className="text-sm text-white/50">{contactSettings.contactPhone || 'Telefon neconfigurat'}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 font-mono">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-accent">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-bold uppercase tracking-widest">Email Suport</h4>
                  <p className="text-sm text-white/50">{contactSettings.contactEmail || 'Email neconfigurat'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`${premiumCardClass} relative overflow-hidden rounded-2xl p-8 md:rounded-3xl md:p-12`}
          >
            {submitStatus?.type === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full flex-col items-center justify-center py-12 text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="mb-4 text-2xl font-display font-bold uppercase tracking-tighter">Multumim!</h3>
                <p className="mb-8 max-w-xs text-white/60">{submitStatus.message}</p>
                <button
                  onClick={() => setSubmitStatus(null)}
                  className="rounded-full border border-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black"
                >
                  Trimite alt mesaj
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nume Complet</label>
                    <input
                      required
                      type="text"
                      placeholder="Ion Popescu"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black p-4 text-sm text-white outline-none transition-colors focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Telefon</label>
                    <input
                      required
                      type="tel"
                      placeholder="07xx xxx xxx"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black p-4 text-sm text-white outline-none transition-colors focus:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="ion@exemplu.ro"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-black p-4 text-sm text-white outline-none transition-colors focus:border-accent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Disciplina de Interes</label>
                  <select
                    value={formData.interest}
                    onChange={e => setFormData({ ...formData, interest: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-black p-4 text-sm text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
                  >
                    <option className="bg-black text-white">Kickboxing</option>
                    <option className="bg-black text-white">Box</option>
                    <option className="bg-black text-white">MMA</option>
                    <option className="bg-black text-white">BJJ</option>
                    <option className="bg-black text-white">Personal Training</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mesaj (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Cum te putem ajuta?"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-white/10 bg-black p-4 text-sm text-white outline-none transition-colors focus:border-accent"
                  />
                </div>

                {submitStatus?.type === 'error' && (
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-red-500">{submitStatus.message}</p>
                )}

                <button
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black disabled:opacity-50 sm:py-4 sm:text-[11px]"
                >
                  {isSubmitting ? 'Se trimite...' : 'Trimite Solicitarea'}
                  {!isSubmitting && <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
