import { AnimatePresence, motion } from 'motion/react';

type InitialLoaderProps = {
  visible: boolean;
};

export default function InitialLoader({ visible }: InitialLoaderProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="initial-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden bg-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(163,0,0,0.2),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.92),rgba(0,0,0,1))]" />
          <motion.div
            animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.92, 1.06, 0.92] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-56 w-56 rounded-full bg-accent/15 blur-[80px]"
          />

          <div className="relative flex flex-col items-center gap-6 px-6 text-center text-white">
            <div className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
              <motion.div
                animate={{ opacity: [0.2, 0.65, 0.2] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-[18%] rounded-full border border-accent/30"
              />
              <motion.div
                animate={{ scale: [0.9, 1.04, 0.9], opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_40px_rgba(163,0,0,0.18)]"
              >
                <div className="h-10 w-10 rounded-full bg-accent/80 blur-[1px]" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.42em] text-accent/90">
                Stoica Brothers
              </p>
              <p className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-white sm:text-3xl">
                Se Incarca Academia
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[0, 1, 2].map((index) => (
                <motion.span
                  key={index}
                  animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: index * 0.16 }}
                  className="h-2.5 w-2.5 rounded-full bg-accent"
                />
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
