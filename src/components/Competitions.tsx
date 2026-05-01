import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, MapPin, Lock, X, Trophy } from 'lucide-react';
import { api, getAssetUrl } from '../services/api';
import { LocationTrigger } from './LocationConfigProvider';

const GROUPS = ['Incepatori', 'Avansati', 'Performanta'];
const premiumCardClass = 'border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.035)_44%,rgba(163,0,0,0.12)_100%)] backdrop-blur-sm shadow-[0_18px_60px_rgba(0,0,0,0.25)]';

export default function Competitions() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<any>(null);
  const [formData, setFormData] = useState({
    password: '',
    fullName: '',
    weightCategory: '',
    experience: '',
    group: 'Incepatori',
    coachId: '',
  });
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const results = await api.getCompetitions();
        setCompetitions(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Failed to fetch competitions:', error);
      }
    };

    fetchCompetitions();
  }, []);

  const openRegistration = (competition: any) => {
    setSelectedCompetition(competition);
    setStatus(null);
    setFormData({
      password: '',
      fullName: '',
      weightCategory: '',
      experience: '',
      group: 'Incepatori',
      coachId: competition.coaches?.[0]?.id || '',
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCompetition) return;

    setSubmitting(true);
    setStatus(null);
    try {
      const selectedCoach = selectedCompetition.coaches?.find((coach: any) => coach.id === formData.coachId);
      await api.registerForCompetition(selectedCompetition._id, {
        ...formData,
        coachName: selectedCoach?.name || '',
      });
      setStatus('Inscriere trimisa cu succes.');
      setFormData({
        password: '',
        fullName: '',
        weightCategory: '',
        experience: '',
        group: 'Incepatori',
        coachId: selectedCompetition.coaches?.[0]?.id || '',
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Inscrierea nu a putut fi trimisa.');
    } finally {
      setSubmitting(false);
    }
  };

  const isPastCompetition = (date?: string) => {
    if (!date) return false;
    const eventDate = new Date(`${date}T23:59:59`);
    return eventDate.getTime() < Date.now();
  };

  if (competitions.length === 0) return null;

  return (
    <section id="competitii" className="py-18 bg-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <span className="text-accent text-sm font-bold tracking-widest uppercase mb-4 block">Fight Calendar</span>
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase text-white tracking-tight">
              Competitii <span className="text-white/35">Active.</span>
            </h2>
          </div>
          <p className="max-w-md text-white/45 text-sm leading-relaxed">
            Inscrierile sunt protejate cu parola primita de la antrenor sau admin.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition, idx) => {
            const isPast = isPastCompetition(competition.date);

            return (
              <motion.article
                key={competition._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className={`group overflow-hidden rounded-xl border transition-all ${isPast ? `${premiumCardClass} grayscale opacity-55` : premiumCardClass}`}
              >
              <div className="relative h-64 bg-white/5 overflow-hidden">
                {competition.image ? (
                  <img
                    src={getAssetUrl(competition.image)}
                    alt={competition.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isPast ? '' : 'group-hover:scale-105'}`}
                  />
                ) : (
                  <div className="absolute inset-0 bg-white/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className={`absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isPast ? 'bg-white/10 text-white/50 border border-white/10' : 'bg-accent text-white'}`}>
                  {isPast ? 'Participat' : 'Live'}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-2xl font-display font-black uppercase text-white leading-tight">{competition.name}</h3>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-accent" />
                    <LocationTrigger name={competition.location}>
                      <span>{competition.location}</span>
                    </LocationTrigger>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-accent" />
                    <span>{competition.date}</span>
                  </div>
                </div>

                {competition.details && (
                  <p className="text-sm text-white/45 leading-relaxed line-clamp-3">{competition.details}</p>
                )}

                <button
                  onClick={() => !isPast && openRegistration(competition)}
                  disabled={isPast}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] transition-all ${isPast ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-accent text-white hover:bg-white hover:text-black'}`}
                >
                  <Lock size={14} /> {isPast ? 'Eveniment incheiat' : 'Inscrie-te'}
                </button>
              </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {selectedCompetition && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative w-full max-w-xl rounded-2xl ${premiumCardClass} p-8 max-h-[90vh] overflow-y-auto`}
          >
            <button
              onClick={() => setSelectedCompetition(null)}
              className="absolute right-6 top-6 text-white/35 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">
                <Trophy size={22} />
              </div>
              <h3 className="text-2xl font-display font-black uppercase text-white">{selectedCompetition.name}</h3>
              <p className="mt-2 text-xs uppercase tracking-widest text-white/35">Formular inscriere elev</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Parola competitiei"
                className="w-full rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.72))] p-4 text-sm text-white outline-none focus:border-accent"
                value={formData.password}
                onChange={event => setFormData({ ...formData, password: event.target.value })}
                required
              />
              <input
                placeholder="Nume & Prenume"
                className="w-full rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.72))] p-4 text-sm text-white outline-none focus:border-accent"
                value={formData.fullName}
                onChange={event => setFormData({ ...formData, fullName: event.target.value })}
                required
              />
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="Categoria kg (ex: -75kg)"
                  className="w-full rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.72))] p-4 text-sm text-white outline-none focus:border-accent [color-scheme:dark]"
                  value={formData.weightCategory}
                  onChange={event => setFormData({ ...formData, weightCategory: event.target.value })}
                  required
                />
                <input
                  placeholder="Experienta (nr. meciuri)"
                  className="w-full rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.72))] p-4 text-sm text-white outline-none focus:border-accent"
                  value={formData.experience}
                  onChange={event => setFormData({ ...formData, experience: event.target.value })}
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <select
                  className="w-full rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.72))] p-4 text-sm text-white outline-none focus:border-accent"
                  value={formData.group}
                  onChange={event => setFormData({ ...formData, group: event.target.value })}
                >
                  {GROUPS.map(group => (
                    <option className="bg-black text-white" key={group} value={group}>{group}</option>
                  ))}
                </select>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.72))] p-4 text-sm text-white outline-none focus:border-accent [color-scheme:dark]"
                  value={formData.coachId}
                  onChange={event => setFormData({ ...formData, coachId: event.target.value })}
                  required
                >
                  {(selectedCompetition.coaches || []).map((coach: any) => (
                    <option className="bg-black text-white" key={coach.id} value={coach.id}>{coach.name}</option>
                  ))}
                </select>
              </div>

              {status && <p className="text-sm text-accent">{status}</p>}

              <button
                disabled={submitting}
                className="w-full rounded-xl bg-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-black hover:bg-accent hover:text-white transition-all disabled:opacity-50"
              >
                {submitting ? 'Se trimite...' : 'Trimite inscrierea'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}
