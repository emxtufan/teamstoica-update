import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LoaderCircle, Star, Upload, X } from 'lucide-react';
import { scrollToContact } from '../lib/utils';
import { api, getAssetUrl } from '../services/api';

const INITIAL_FORM = {
  name: '',
  role: '',
  text: '',
  image: '',
  rating: 5,
};

const STAR_VALUES = [1, 2, 3, 4, 5];
const DEFAULT_CTA_IMAGE = 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?q=80&w=2000&auto=format&fit=crop';

export default function FinalCTA() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState(INITIAL_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ctaSectionPhoto, setCtaSectionPhoto] = useState(DEFAULT_CTA_IMAGE);

  useEffect(() => {
    api.getDesign()
      .then((result) => {
        setCtaSectionPhoto(getAssetUrl(result?.ctaSectionPhoto) || DEFAULT_CTA_IMAGE);
      })
      .catch(() => {
        setCtaSectionPhoto(DEFAULT_CTA_IMAGE);
      });
  }, []);

  const closeModal = () => {
    setIsReviewModalOpen(false);
    setReviewForm(INITIAL_FORM);
    setIsUploading(false);
    setIsSubmitting(false);
    setHoverRating(null);
  };

  const handleReviewImageUpload = async (file?: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await api.uploadReviewImage(file);
      setReviewForm((current) => ({ ...current, image: result.url || '' }));
    } catch (error) {
      alert('Fotografia nu a putut fi incarcata.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitReview = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await api.submitReview({
        name: reviewForm.name.trim(),
        role: reviewForm.role.trim(),
        text: reviewForm.text.trim(),
        image: reviewForm.image,
        rating: reviewForm.rating,
      });

      alert('Recenzia a fost trimisa cu succes.');
      closeModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Recenzia nu a putut fi trimisa.');
      setIsSubmitting(false);
    }
  };

  const renderedRating = hoverRating ?? reviewForm.rating;

  return (
    <>
      <section className="relative -mt-px overflow-hidden py-32">
        <div
          className="absolute inset-x-0 -top-2 -bottom-2 z-0 bg-cover bg-center bg-scroll lg:bg-fixed"
          style={{ backgroundImage: `url("${ctaSectionPhoto}")` }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-8 text-5xl font-display font-bold leading-none text-white md:text-8xl">
              GATA SA <br />
              <span className="text-accent underline decoration-white/20 underline-offset-[16px]">INCEPI?</span>
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl font-light text-white/60">
              Nu lasa pe maine disciplina pe care o poti construi azi. Vino la Stoica Brothers Academy si transforma-te in cea mai buna versiune a ta.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <motion.a
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToContact();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-accent px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_50px_rgba(163,0,0,0.2)] transition-all hover:bg-white hover:text-black sm:px-10 sm:py-4 sm:text-[11px]"
              >
                Programeaza un Antrenament
              </motion.a>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:border-accent hover:text-accent sm:px-9 sm:py-4 sm:text-[11px]"
              >
                Lasa o Recenzie
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
                aria-label="Inchide"
              />

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                className="relative z-10 w-full max-w-[580px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#101010_0%,#080808_100%)] shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
              >
                <div className="max-h-[88vh] overflow-y-auto px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition-all hover:border-accent hover:text-accent md:right-5 md:top-5"
                    aria-label="Inchide"
                  >
                    <X size={18} />
                  </button>

                  <div className="mb-6 pr-12 md:mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">Vocile Academiei</p>
                    <h3 className="mt-3 text-2xl font-display font-black uppercase tracking-tight text-white sm:text-[30px]">
                      Trimite o recenzie
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      Incarca o fotografie, alege ratingul si scrie experienta ta despre Stoica Brothers Academy.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-4 md:space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                          Nume
                        </label>
                        <input
                          required
                          value={reviewForm.name}
                          onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-accent"
                          placeholder="Numele tau"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                          Disciplina / rol
                        </label>
                        <input
                          value={reviewForm.role}
                          onChange={(event) => setReviewForm((current) => ({ ...current, role: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-accent"
                          placeholder="Kickbox, Parinte, Cursant etc."
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                      <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                        Rating
                      </label>
                      <div
                        className="flex items-center gap-1"
                        onMouseLeave={() => setHoverRating(null)}
                      >
                        {STAR_VALUES.map((value) => (
                          <button
                            key={value}
                            type="button"
                            onMouseEnter={() => setHoverRating(value)}
                            onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                            className="transition-transform hover:scale-110"
                            aria-label={`${value} stele`}
                          >
                            <Star
                              size={28}
                              className={value <= renderedRating ? 'fill-[#ffc700] text-[#ffc700]' : 'text-white/20'}
                            />
                          </button>
                        ))}
                        <span className="ml-3 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                          {reviewForm.rating} / 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                        Fotografie
                      </label>
                      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-4 transition-all hover:border-accent/50">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">Incarca o poza de profil</p>
                          <p className="mt-1 text-xs text-white/40">JPG, PNG sau WEBP</p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-accent">
                          {isUploading ? <LoaderCircle className="animate-spin" size={18} /> : <Upload size={18} />}
                          <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                            {isUploading ? 'Uploading' : 'Selecteaza'}
                          </span>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleReviewImageUpload(event.target.files?.[0])}
                        />
                      </label>

                      {reviewForm.image && (
                        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <img src={reviewForm.image} alt="Preview recenzie" className="h-14 w-14 rounded-full object-cover object-top" />
                          <p className="text-xs text-white/55">Fotografia a fost incarcata si este pregatita pentru recenzia ta.</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                        Recenzie
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewForm.text}
                        onChange={(event) => setReviewForm((current) => ({ ...current, text: event.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-accent"
                        placeholder="Scrie cateva randuri despre experienta ta la Stoica Brothers Academy."
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-full border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
                      >
                        Inchide
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="rounded-full bg-accent px-8 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmitting ? 'Se trimite...' : 'Trimite recenzia'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
