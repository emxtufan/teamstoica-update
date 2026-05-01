import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const premiumCardClass = 'border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.035)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm shadow-[0_18px_60px_rgba(0,0,0,0.25)]';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Kickboxing',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await api.sendContactRequest(formData);
      setSubmitStatus({ type: 'success', message: 'Solicitarea ta a fost înregistrată! Te vom contacta în curând.' });
      setFormData({ name: '', email: '', phone: '', interest: 'Kickboxing', message: '' });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'A apărut o eroare la trimitere. Te rugăm să încerci din nou.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-18 bg-black">
      <div className="container mx-auto px-6 text-white">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent text-sm font-bold tracking-widest uppercase mb-4 block">Contact</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">
              ÎNCEPE ACUM <br />
              <span className="text-white/40">CĂLĂTORIA TA.</span>
            </h2>
            <p className="text-white/60 font-light mb-12 leading-relaxed max-w-md">
              Ești gata să intri în ring? Completează formularul sau vizitează-ne la sală pentru un trial gratuit. Echipa noastră te va contacta în cel mai scurt timp.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-6 font-mono">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-accent">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Adresa Academiei</h4>
                  <p className="text-white/50 text-sm">Strada Campionilor, Nr. 45, Sector 1, București</p>
                </div>
              </div>
              <div className="flex items-start gap-6 font-mono">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-accent">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Telefon Direct</h4>
                  <p className="text-white/50 text-sm">+40 722 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-6 font-mono">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-accent">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-1">Email Suport</h4>
                  <p className="text-white/50 text-sm">contact@stoicabrothers.ro</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={`${premiumCardClass} p-8 md:p-12 rounded-2xl md:rounded-3xl relative overflow-hidden`}
          >
            {submitStatus?.type === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 uppercase tracking-tighter">Mulțumim!</h3>
                <p className="text-white/60 mb-8 max-w-xs">{submitStatus.message}</p>
                <button 
                  onClick={() => setSubmitStatus(null)}
                  className="px-8 py-3 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
                >
                  Trimite alt mesaj
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nume Complet</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ion Popescu"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black border border-white/10 p-4 text-sm focus:border-accent outline-none transition-colors rounded-lg text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Telefon</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="07xx xxx xxx"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black border border-white/10 p-4 text-sm focus:border-accent outline-none transition-colors rounded-lg text-white"
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
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black border border-white/10 p-4 text-sm focus:border-accent outline-none transition-colors rounded-lg text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Disciplina de Interes</label>
                  <select 
                    value={formData.interest}
                    onChange={e => setFormData({...formData, interest: e.target.value})}
                    className="w-full bg-black border border-white/10 p-4 text-sm focus:border-accent outline-none transition-colors appearance-none rounded-lg text-white [color-scheme:dark]"
                  >
                    <option className="bg-black text-white">Kickboxing</option>
                    <option className="bg-black text-white">Box</option>
                    <option className="bg-black text-white">MMA</option>
                    <option className="bg-black text-white">BJJ</option>
                    <option className="bg-black text-white">Personal Training</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mesaj (Opțional)</label>
                  <textarea 
                    rows={4}
                    placeholder="Cum te putem ajuta?"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-black border border-white/10 p-4 text-sm focus:border-accent outline-none transition-colors resize-none rounded-lg text-white"
                  />
                </div>
                
                {submitStatus?.type === 'error' && (
                  <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">{submitStatus.message}</p>
                )}

                <button 
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-black disabled:opacity-50 sm:py-4 sm:text-[11px]"
                >
                  {isSubmitting ? 'Se trimite...' : 'Trimite Solicitarea'} 
                  {!isSubmitting && <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
