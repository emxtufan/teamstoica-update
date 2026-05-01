import { motion } from 'motion/react';
import { Shield, Trophy, Users, Zap, Target, Flame } from 'lucide-react';

const FEATURES = [
  {
    icon: Trophy,
    title: 'Mentalitate de Campion',
    description: 'Inveti direct de la Bogdan si Andrei Stoica, sportivi care au atins varful performantei mondiale.',
  },
  {
    icon: Shield,
    title: 'Mediu Sigur si Profesionist',
    description: 'Echipamente de ultima generatie si instructori care pun siguranta si tehnica corecta pe primul loc.',
  },
  {
    icon: Users,
    title: 'Comunitate de Elita',
    description: 'Mai mult decat o sala, suntem o familie unita prin respect, disciplina si pasiune pentru lupte.',
  },
  {
    icon: Zap,
    title: 'Conditionare Fizica Reala',
    description: 'Antrenamente care iti transforma corpul si iti cresc rezistenta la un nivel pe care nu l-ai crezut posibil.',
  },
  {
    icon: Target,
    title: 'Tehnica Impecabila',
    description: 'Fie ca esti incepator sau profesionist, ne concentram pe detaliile care fac diferenta in ring.',
  },
  {
    icon: Flame,
    title: 'Energie Controlata',
    description: 'Inveti sa-ti canalizezi adrenalina si stresul in forta constructiva si autocontrol.',
  },
];

export default function Features() {
  return (
    <section className="relative overflow-hidden bg-black py-18">
      <div className="container mx-auto px-6 text-white">
        <div className="mb-20 text-center">
          <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-accent">Excelenta</span>
          <h2 className="text-4xl font-display font-bold text-white md:text-6xl">
            DE CE <span className="text-white/40">NOI?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base">
            O combinatie intre experienta de top, structura de antrenament si o cultura construita in jurul disciplinei, progresului si performantei reale.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent transition-all duration-500 group-hover:rotate-6 group-hover:bg-accent group-hover:text-white">
                <feature.icon size={28} />
              </div>
              <h3 className="mb-4 text-xl font-display font-bold tracking-tight text-white transition-colors group-hover:text-accent">
                {feature.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-white/50">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
